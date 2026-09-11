import { SunIcon, CloudIcon, MistIcon, CloudRainIcon, SnowflakeIcon, CloudLightningIcon } from '../ui/ui-icons.js';

export function getWeatherIcon(code, size = 16) {
  const React = window.React;
  const c = Number(code);
  if (c === 0) return /*#__PURE__*/React.createElement(SunIcon, { size });
  if ([1, 2, 3].includes(c)) return /*#__PURE__*/React.createElement(CloudIcon, { size });
  if ([45, 48].includes(c)) return /*#__PURE__*/React.createElement(MistIcon, { size });
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return /*#__PURE__*/React.createElement(CloudRainIcon, { size });
  if ([71, 73, 75, 77, 85, 86].includes(c)) return /*#__PURE__*/React.createElement(SnowflakeIcon, { size });
  if ([95, 96, 99].includes(c)) return /*#__PURE__*/React.createElement(CloudLightningIcon, { size });
  return /*#__PURE__*/React.createElement(SunIcon, { size });
}

export function translateKoreanToEnglish(query) {
  const clean = query.trim().toLowerCase();
  const mapping = {
    '서울': 'Seoul', '서울특별시': 'Seoul', '서울시': 'Seoul',
    '인천': 'Incheon', '인천광역시': 'Incheon', '인천시': 'Incheon',
    '부산': 'Busan', '부산광역시': 'Busan', '부산시': 'Busan',
    '대구': 'Daegu', '대구광역시': 'Daegu', '대구시': 'Daegu',
    '대전': 'Daejeon', '대전광역시': 'Daejeon', '대전시': 'Daejeon',
    '광주': 'Gwangju', '광주광역시': 'Gwangju', '광주시': 'Gwangju',
    '울산': 'Ulsan', '울산광역시': 'Ulsan', '울산시': 'Ulsan',
    '세종': 'Sejong', '세종시': 'Sejong', '세종특별자치시': 'Sejong',
    '경기도': 'Gyeonggi', '경기': 'Gyeonggi',
    '강원도': 'Gangwon', '강원': 'Gangwon',
    '충청북도': 'Chungcheongbuk', '충북': 'Chungcheongbuk',
    '충청남도': 'Chungcheongnam', '충남': 'Chungcheongnam',
    '전라북도': 'Jeollabuk', '전북': 'Jeollabuk',
    '전라남도': 'Jeollanam', '전남': 'Jeollanam',
    '경상북도': 'Gyeongsangbuk', '경북': 'Gyeongsangbuk',
    '경상남도': 'Gyeongsangnam', '경남': 'Gyeongsangnam',
    '제주': 'Jeju', '제주도': 'Jeju', '제주시': 'Jeju', '서귀포': 'Seogwipo',
    '수원': 'Suwon', '성남': 'Seongnam', '분당': 'Bundang', '용인': 'Yongin',
    '부천': 'Bucheon', '안산': 'Ansan', '화성': 'Hwaseong', '남양주': 'Namyangju',
    '남양주시': 'Namyangju', '안양': 'Anyang', '평택': 'Pyeongtaek',
    '의정부': 'Uijeongbu', '파주': 'Paju', '파주시': 'Paju', '시흥': 'Siheung',
    '김포': 'Gimpo', '광명': 'Gwangmyeong', '군포': 'Gunpo', '오산': 'Osan',
    '이천': 'Icheon', '양주': 'Yangju', '안성': 'Anseong', '구리': 'Guri',
    '포천': 'Pocheon', '의왕': 'Uiwang', '하남': 'Hanam', '여주': 'Yeoju',
    '동두천': 'Dongducheon', '과천': 'Gwacheon',
    '춘천': 'Chuncheon', '원주': 'Wonju', '강릉': 'Gangneung', '동해': 'Donghae',
    '태백': 'Taebaek', '속초': 'Sokcho', '삼척': 'Samcheok',
    '청주': 'Cheongju', '충주': 'Chungju', '제천': 'Jecheon',
    '천안': 'Cheonan', '공주': 'Gongju', '보령': 'Boryeong', '아산': 'Asan',
    '서산': 'Seosan', '논산': 'Nonsan', '계룡': 'Gyeryong', '당진': 'Dangjin',
    '전주': 'Jeonju', '군산': 'Gunsan', '익산': 'Iksan', '정읍': 'Jeongeup',
    '남원': 'Namwon', '김제': 'Gimje',
    '목포': 'Mokpo', '여수': 'Yeosu', '순천': 'Suncheon', '나주': 'Naju',
    '광양': 'Gwangyang',
    '포항': 'Pohang', '경주': 'Gyeongju', '김천': 'Gimcheon', '안동': 'Andong',
    '구미': 'Gumi', '영주': 'Yeongju', '영천': 'Yeongcheon', '상주': 'Sangju',
    '문경': 'Mungyeong', '경산': 'Gyeongsan',
    '창원': 'Changwon', '진주': 'Jinju', '통영': 'Tongyeong', '사천': 'Sacheon',
    '김해': 'Gimhae', '밀양': 'Miryang', '거제': 'Geoje', '양산': 'Yangsan',
    '독도': 'Dokdo', '울릉도': 'Ulleungdo'
  };

  if (mapping[clean]) return mapping[clean];
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query)) {
    return null; // Fallback to Nominatim
  }
  return query;
}
