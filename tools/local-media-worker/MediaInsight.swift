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
  "food": "음식", "meal": "음식", "restaurant": "식당", "cafe": "카페",
  "outdoor": "야외", "landscape": "풍경", "beach": "바다", "mountain": "산",
  "child": "아이", "dog": "강아지", "cat": "고양이", "document": "문서",
  "screenshot": "스크린샷", "receipt": "영수증", "vehicle": "자동차"
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
  if let tag = koreanTagByLabel[normalized] { tagSet.insert(tag) }
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
