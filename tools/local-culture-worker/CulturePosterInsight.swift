#!/usr/bin/env swift
// Optional Mac mini helper for poster OCR and visual fingerprints.
// It is intentionally read-only: the Node pipeline decides whether any suggestion is trusted.

import AppKit
import Foundation
import Vision

struct PosterInsight: Codable {
  let schemaVersion: Int
  let filePath: String
  let ocrText: [String]
  let featurePrintBase64: String?
}

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data((message + "\n").utf8))
  exit(2)
}

guard CommandLine.arguments.count >= 2 else { fail("Usage: CulturePosterInsight.swift <poster-path>") }
let inputURL = URL(fileURLWithPath: CommandLine.arguments[1]).standardizedFileURL
guard let image = NSImage(contentsOf: inputURL) else { fail("Cannot decode poster: \(inputURL.path)") }
var proposedRect = CGRect(origin: .zero, size: image.size)
guard let cgImage = image.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else { fail("Cannot create poster bitmap") }

let recognize = VNRecognizeTextRequest()
recognize.recognitionLevel = .accurate
recognize.usesLanguageCorrection = true
recognize.automaticallyDetectsLanguage = true
recognize.recognitionLanguages = ["ko-KR", "en-US"]
let featurePrint = VNGenerateImageFeaturePrintRequest()

do {
  let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
  try handler.perform([recognize, featurePrint])
} catch {
  fail("Vision poster analysis failed: \(error.localizedDescription)")
}

let ocrText = (recognize.results ?? [])
  .compactMap { $0.topCandidates(1).first?.string.trimmingCharacters(in: .whitespacesAndNewlines) }
  .filter { !$0.isEmpty }
  .prefix(30)
  .map { $0 }
let featureData = featurePrint.results?.first?.data
let insight = PosterInsight(
  schemaVersion: 1,
  filePath: inputURL.path,
  ocrText: ocrText,
  featurePrintBase64: featureData?.base64EncodedString()
)
let encoder = JSONEncoder()
encoder.outputFormatting = [.sortedKeys]
guard let payload = try? encoder.encode(insight) else { fail("Could not encode poster insight") }
FileHandle.standardOutput.write(payload)
FileHandle.standardOutput.write(Data("\n".utf8))
