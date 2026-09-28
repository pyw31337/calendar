#!/usr/bin/env swift
// On-device media insight helper for Apple Silicon Macs.
//
// This deliberately produces suggestions only. It never changes an image, uploads a file, or
// writes a calendar tag. The Node runner stores the JSON beside the local inbox so a later,
// reviewed batch can decide what reaches Firestore.

import AppKit
import Foundation
import Vision

struct Label: Codable {
  let value: String
  let confidence: Double
}

struct Insight: Codable {
  let schemaVersion: Int
  let filePath: String
  let labels: [Label]
  let ocrText: [String]
  let faceCount: Int
  let suggestedTags: [String]
}

let koreanTagByLabel: [String: String] = [
  // 1. 놀이 / 키즈 / 육아
  "playground": "놀이터", "slide": "미끄럼틀", "swing": "그네", "seesaw": "시소", "sandbox": "모래놀이",
  "jungle_gym": "정글짐", "trampoline": "트램펄린", "amusement_park": "놀이공원", "theme_park": "테마파크",
  "carousel": "회전목마", "roller_coaster": "롤러코스터", "ferris_wheel": "대관람차", "water_park": "워터파크",
  "water_slide": "워터슬라이드", "kids_cafe": "키즈카페", "ball_pit": "볼풀", "toy": "장난감", "lego": "레고",
  "doll": "인형", "teddy_bear": "곰인형", "puzzle": "퍼즐", "robot": "로봇", "block": "블록", "stroller": "유모차",
  "pram": "유모차", "crib": "아기침대", "baby_bottle": "젖병", "pacifier": "쪽쪽이", "baby": "아기",
  "toddler": "유아", "infant": "영유아", "child": "아이", "kid": "어린이", "boy": "남자아이", "girl": "여자아이",

  // 2. 나들이 / 자연 / 계절
  "park": "공원", "garden": "정원", "lawn": "잔디밭", "grass": "풀밭", "flower": "꽃", "blossom": "꽃",
  "cherry_blossom": "벚꽃", "rose": "장미", "tulip": "튤립", "sunflower": "해바라기", "daisy": "데이지",
  "tree": "나무", "forest": "숲", "woods": "숲길", "mountain": "산", "hill": "언덕", "peak": "정상",
  "hiking": "등산", "trail": "산책로", "climbing": "암벽등반", "valley": "계곡", "river": "강", "lake": "호수",
  "pond": "연못", "waterfall": "폭포", "stream": "시냇물", "beach": "바다", "seashore": "해변", "coast": "해안",
  "ocean": "바다", "sea": "바다", "sand": "모래사장", "wave": "파도", "sunset": "일몰", "sunrise": "일출",
  "sky": "하늘", "cloud": "구름", "blue_sky": "파란하늘", "rainbow": "무지개", "star": "별", "night_sky": "밤하늘",
  "outdoor": "야외", "landscape": "풍경", "scenery": "경치", "nature": "자연", "autumn_leaves": "단풍",
  "foliage": "단풍", "fallen_leaves": "낙엽", "snow": "눈", "snowman": "눈사람", "snowfield": "설경",
  "frost": "서리", "ice": "얼음", "icicle": "고드름", "winter": "겨울", "spring": "봄", "summer": "여름", "autumn": "가을",

  // 3. 액티비티 / 레저 / 스포츠
  "camping": "캠핑", "tent": "텐트", "campfire": "모닥불", "bonfire": "캠프파이어", "barbecue": "바비큐",
  "bbq": "바비큐", "grill": "그릴", "picnic": "소풍", "picnic_basket": "피크닉", "picnic_mat": "돗자리",
  "fishing": "낚시", "swimming": "수영", "swimming_pool": "수영장", "pool": "수영장", "sunbathing": "일광욕",
  "boat": "보트", "yacht": "요트", "kayak": "카약", "canoe": "카누", "surf": "서핑", "surfing": "서핑",
  "paddleboard": "패들보드", "ski": "스키", "skiing": "스키", "snowboard": "스노보드", "sled": "썰매",
  "sledding": "눈썰매", "bicycle": "자전거", "bike": "자전거", "cycling": "라이딩", "skateboard": "스케이트보드",
  "scooter": "킥보드", "kickboard": "킥보드", "roller_skating": "롤러스케이트", "inline_skating": "인라인스케이트",
  "badminton": "배드민턴", "tennis": "테니스", "golf": "골프", "soccer": "축구", "football": "축구",
  "basketball": "농구", "baseball": "야구", "running": "달리기", "jogging": "조깅", "marathon": "마라톤",
  "athletics": "운동회", "gym": "헬스장", "fitness": "운동", "yoga": "요가", "pilates": "필라테스",
  "martial_arts": "무예", "taekwondo": "태권도",

  // 4. 음식 / 식사 / 맛집
  "food": "음식", "meal": "식사", "dish": "요리", "cuisine": "요리", "restaurant": "식당", "dining": "외식",
  "buffet": "뷔페", "street_food": "길거리음식", "snack": "간식", "snack_bar": "분식", "korean_food": "한식",
  "bibimbap": "비빔밥", "kimchi": "김치", "bulgogi": "불고기", "pork_belly": "삼겹살", "samgyeopsal": "삼겹살",
  "galbi": "갈비", "meat": "고기", "steak": "스테이크", "beef": "소고기", "pork": "돼지고기", "chicken": "치킨",
  "fried_chicken": "치킨", "burger": "햄버거", "hamburger": "햄버거", "pizza": "피자", "pasta": "파스타",
  "spaghetti": "스파게티", "noodle": "면", "noodles": "국수", "ramen": "라면", "ramyeon": "라면", "udon": "우동",
  "soba": "소바", "soup": "국물", "stew": "찌개", "hot_pot": "전골", "curry": "카레", "sushi": "초밥",
  "sashimi": "생선회", "raw_fish": "회", "seafood": "해산물", "shrimp": "새우", "crab": "게", "lobster": "랍스터",
  "fish": "생선", "squid": "오징어", "octopus": "문어", "dumpling": "만두", "mandoo": "만두", "tteokbokki": "떡볶이",
  "gimbap": "김밥", "kimbap": "김밥", "tempura": "튀김", "pancake": "부침개", "jeon": "전", "salad": "샐러드",
  "fruit": "과일", "apple": "사과", "banana": "바나나", "strawberry": "딸기", "orange": "오렌지",
  "watermelon": "수박", "grape": "포도", "melon": "멜론", "peach": "복숭아", "cherry": "체리", "tomato": "토마토",

  // 5. 카페 / 음료 / 디저트
  "cafe": "카페", "coffee_shop": "카페", "coffee": "커피", "espresso": "에스프레소", "americano": "아메리카노",
  "latte": "라떼", "cappuccino": "카푸치노", "tea": "차", "green_tea": "녹차", "iced_tea": "아이스티",
  "milk_tea": "밀크티", "smoothie": "스무디", "juice": "주스", "beverage": "음료", "drink": "음료",
  "dessert": "디저트", "bakery": "베이커리", "bread": "빵", "toast": "토스트", "croissant": "크루아상",
  "bagel": "베이글", "sandwich": "샌드위치", "cake": "케이크", "pastry": "패스트리", "tart": "타르트",
  "pie": "파이", "cupcake": "컵케이크", "muffin": "머핀", "cookie": "쿠키", "donut": "도넛", "doughnut": "도넛",
  "waffle": "와플", "ice_cream": "아이스크림", "soft_serve": "소프트아이스크림", "shaved_ice": "빙수",
  "bingsu": "빙수", "macaron": "마카롱", "chocolate": "초콜릿", "candy": "사탕", "cotton_candy": "솜사탕",

  // 6. 가족 / 기념일 / 파티 / 행사
  "family": "가족", "parents": "부모님", "mother": "엄마", "mom": "엄마", "father": "아빠", "dad": "아빠",
  "grandmother": "할머니", "grandfather": "할아버지", "sister": "자매", "brother": "형제", "sibling": "남매",
  "twins": "쌍둥이", "couple": "커플", "party": "파티", "birthday": "생일", "birthday_party": "생일파티",
  "birthday_cake": "생일케이크", "candle": "촛불", "balloon": "풍선", "gift": "선물", "present": "선물",
  "bouquet": "꽃다발", "celebration": "축하", "festival": "축제", "fireworks": "불꽃놀이", "parade": "퍼레이드",
  "ceremony": "행사", "graduation": "졸업식", "entrance_ceremony": "입학식", "school_festival": "학예회",
  "sports_day": "운동회", "wedding": "결혼식", "wedding_dress": "웨딩드레스", "bride": "신부", "groom": "신랑",
  "anniversary": "기념일", "hanbok": "한복", "costume": "코스튬", "halloween": "할로윈", "christmas": "크리스마스",
  "christmas_tree": "크리스마스트리", "santa": "산타", "new_year": "새해", "holiday": "휴일",

  // 7. 학교 / 교육 / 문화 / 실내
  "school": "학교", "classroom": "교실", "kindergarten": "유치원", "daycare": "어린이집", "nursery": "어린이집",
  "blackboard": "칠판", "whiteboard": "화이트보드", "desk": "책상", "chair": "의자", "backpack": "책가방",
  "book": "책", "textbook": "교과서", "notebook": "공책", "library": "도서관", "bookstore": "서점",
  "museum": "박물관", "art_museum": "미술관", "gallery": "갤러리", "exhibition": "전시회", "painting": "그림",
  "drawing": "드로잉", "sculpture": "조각", "craft": "만들기", "origami": "종이접기", "pottery": "도자기",
  "theater": "공연장", "cinema": "영화관", "movie": "영화", "performance": "공연", "concert": "콘서트",
  "musical": "뮤지컬", "stage": "무대", "piano": "피아노", "guitar": "기타", "violin": "바이올린", "drums": "드럼",

  // 8. 동물 / 반려동물
  "pet": "반려동물", "dog": "강아지", "puppy": "강아지", "cat": "고양이", "kitten": "아기고양이",
  "animal": "동물", "bird": "새", "parrot": "앵무새", "duck": "오리", "swan": "백조", "horse": "말",
  "pony": "조랑말", "cow": "소", "sheep": "양", "goat": "염소", "rabbit": "토끼", "hamster": "햄스터",
  "squirrel": "다람쥐", "deer": "사슴", "zoo": "동물원", "aquarium": "아쿠아리움", "turtle": "거북이",
  "dolphin": "돌고래", "whale": "고래", "penguin": "펭귄", "butterfly": "나비", "dragonfly": "잠자리",

  // 9. 이동 / 장소 / 숙소
  "car": "자동차", "vehicle": "차량", "automobile": "승용차", "taxi": "택시", "bus": "버스", "van": "승합차",
  "train": "기차", "subway": "지하철", "railway": "철도", "station": "역", "airport": "공항", "airplane": "비행기",
  "flight": "항공", "ship": "배", "ferry": "페리", "port": "항구", "harbor": "항구", "yacht": "요트",
  "bridge": "다리", "road": "도로", "street": "거리", "city": "도시", "building": "건물", "hotel": "호텔",
  "resort": "리조트", "lodging": "숙소", "pension": "펜션", "pool_villa": "풀빌라", "room": "방",
  "shopping_mall": "쇼핑몰", "department_store": "백화점", "market": "시장", "supermarket": "마트",
  "convenience_store": "편의점", "hospital": "병원", "pharmacy": "약국", "document": "문서", "screenshot": "스크린샷",
  "receipt": "영수증"
]

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data((message + "\n").utf8))
  exit(2)
}

guard CommandLine.arguments.count >= 2 else {
  fail("Usage: MediaInsight.swift <image-path>")
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1]).standardizedFileURL
guard let image = NSImage(contentsOf: inputURL) else {
  fail("Cannot decode image: \(inputURL.path)")
}
var proposedRect = CGRect(origin: .zero, size: image.size)
guard let cgImage = image.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else {
  fail("Cannot create CGImage: \(inputURL.path)")
}

let classify = VNClassifyImageRequest()
let recognizeText = VNRecognizeTextRequest()
recognizeText.recognitionLevel = .accurate
recognizeText.usesLanguageCorrection = true
recognizeText.recognitionLanguages = ["ko-KR", "en-US"]
let detectFaces = VNDetectFaceRectanglesRequest()

do {
  let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
  try handler.perform([classify, recognizeText, detectFaces])
} catch {
  fail("Vision analysis failed: \(error.localizedDescription)")
}

let labels = (classify.results ?? [])
  .filter { $0.confidence >= 0.55 }
  .prefix(8)
  .map { Label(value: $0.identifier, confidence: Double($0.confidence)) }

let ocrText = (recognizeText.results ?? [])
  .compactMap { $0.topCandidates(1).first?.string.trimmingCharacters(in: .whitespacesAndNewlines) }
  .filter { !$0.isEmpty }
  .prefix(12)
  .map { $0 }

var tagSet = Set<String>()
for label in labels where label.confidence >= 0.7 {
  let normalized = label.value.lowercased()
  if let tag = koreanTagByLabel[normalized] {
    tagSet.insert(tag)
  } else {
    // Check hierarchy (e.g. food/dessert/cake) and underscore tokens (e.g. playground_equipment)
    let parts = normalized.components(separatedBy: CharacterSet(charactersIn: "/_ -"))
    for part in parts where !part.isEmpty {
      if let tag = koreanTagByLabel[part] {
        tagSet.insert(tag)
        break
      }
    }
  }
}

let insight = Insight(
  schemaVersion: 1,
  filePath: inputURL.path,
  labels: labels,
  ocrText: ocrText,
  faceCount: (detectFaces.results ?? []).count,
  suggestedTags: tagSet.sorted()
)

let encoder = JSONEncoder()
encoder.outputFormatting = [.sortedKeys]
guard let payload = try? encoder.encode(insight) else {
  fail("Could not encode analysis JSON")
}
FileHandle.standardOutput.write(payload)
FileHandle.standardOutput.write(Data("\n".utf8))
