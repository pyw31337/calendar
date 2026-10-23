#!/usr/bin/env node

// Lightweight, dependency-free quality gate for the daily Culture Flow snapshot.
// It deliberately reports ambiguous same-title groups instead of deleting them: touring
// productions are valid separate rows when the venue or date window differs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  duplicateDateWindowMatches,
  normalizeTitleForMatch,
  venuesMatch
} from './lib/culture-normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultInput = path.resolve(__dirname, '../public-vite/data/culture-performances.json');
const args = process.argv.slice(2);
const input = path.resolve(args.find(arg => !arg.startsWith('-')) || defaultInput);
const strict = args.includes('--strict');
const outputArg = args.find(arg => arg.startsWith('--output='));

function readItems(file) {
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
}

const items = readItems(input);
const groups = new Map();
for (const item of items) {
  const key = normalizeTitleForMatch(item.title);
  if (!key) continue;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);
}

const sameTitleGroups = [...groups.values()].filter(group => group.length > 1);
const crossSourceGroups = sameTitleGroups.filter(group => {
  const sources = new Set(group.flatMap(item => String(item.source || '').split('+').filter(Boolean)));
  return sources.size > 1;
});
const mergeCandidates = [];
for (const group of sameTitleGroups) {
  for (let i = 0; i < group.length; i += 1) {
    for (let j = i + 1; j < group.length; j += 1) {
      const a = group[i], b = group[j];
      if (venuesMatch(a.venue, b.venue) && duplicateDateWindowMatches(a, b)) {
        mergeCandidates.push({ ids: [a.id, b.id], title: a.title, sources: [a.source, b.source] });
      }
    }
  }
}

const missingPoster = items.filter(item => !item.image && !item.backupPoster).map(item => ({ id: item.id, title: item.title, source: item.source }));
const sourceListingMissing = items.filter(item => String(item.source || '').includes('+') && !Array.isArray(item.sourceListings));
const sourceCounts = {};
for (const item of items) {
  for (const source of String(item.source || '').split('+').filter(Boolean)) sourceCounts[source] = (sourceCounts[source] || 0) + 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  input,
  itemCount: items.length,
  sourceCounts,
  sameTitleGroupCount: sameTitleGroups.length,
  crossSourceGroupCount: crossSourceGroups.length,
  remainingMergeCandidateCount: mergeCandidates.length,
  missingPosterCount: missingPoster.length,
  sourceListingMissingCount: sourceListingMissing.length,
  missingPoster: missingPoster.slice(0, 100),
  remainingMergeCandidates: mergeCandidates.slice(0, 100),
  crossSourceGroups: crossSourceGroups.slice(0, 100).map(group => ({
    title: group[0].title,
    items: group.map(item => ({ id: item.id, venue: item.venue, startDate: item.startDate, endDate: item.endDate, source: item.source }))
  }))
};

if (outputArg) {
  const output = path.resolve(outputArg.slice('--output='.length));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify(report, null, 2));

if (strict && (report.remainingMergeCandidateCount > 0 || report.missingPosterCount > 0 || report.sourceListingMissingCount > 0)) {
  process.exitCode = 1;
}
