import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRING, simulateSpring, springTrack } from '../src/ui/v2/spring.js';

test('a released control overshoots and settles on the target', () => {
  const sim = simulateSpring({ from: 0.94, to: 1, ...SPRING.release });
  assert.equal(sim.overshoot, true);
  assert.ok(sim.duration > 80 && sim.duration < 900);
  assert.equal(sim.frames[sim.frames.length - 1].x, 1);
  const peak = Math.max(...sim.frames.map(frame => frame.x));
  assert.ok(peak > 1.015 && peak < 1.06, `peak ${peak}`);
});

test('pressing in and leaving do not bounce back', () => {
  const press = simulateSpring({ from: 1, to: 0.94, ...SPRING.press });
  const leave = simulateSpring({ from: 1, to: 0.9, ...SPRING.leave });
  assert.equal(press.overshoot, false);
  assert.equal(leave.overshoot, false);
  assert.equal(press.frames.at(-1).x, 0.94);
  assert.equal(leave.frames.at(-1).x, 0.9);
});

test('entering springs past full size, then the track ends at rest', () => {
  const track = springTrack({ from: 0.92, to: 1, opacityFrom: 0, opacityTo: 1, ...SPRING.enter });
  assert.equal(track.overshoot, true);
  assert.equal(track.keyframes[0].offset, 0);
  assert.equal(track.keyframes.at(-1).offset, 1);
  assert.equal(track.keyframes.at(-1).scale, 1);
  assert.equal(track.keyframes.at(-1).opacity, 1);
  assert.ok(track.keyframes[0].opacity < 0.05);
  const offsets = track.keyframes.map(frame => frame.offset);
  assert.deepEqual(offsets, [...offsets].sort((a, b) => a - b));
});
