/**
 * Underdamped / overdamped spring samples. Playback is linear between samples
 * because the curve already comes from the integrator.
 */

export const SPRING = {
  press: { stiffness: 720, damping: 46, mass: 0.8 },
  release: { stiffness: 520, damping: 12, mass: 1 },
  enter: { stiffness: 320, damping: 14, mass: 1 },
  leave: { stiffness: 380, damping: 44, mass: 1 },
};

export function stepSpring(state, target, config, dt) {
  const mass = config.mass || 1;
  const accel = (-config.stiffness * (state.x - target) - config.damping * state.v) / mass;
  const v = state.v + accel * dt;
  return { x: state.x + v * dt, v };
}

export function simulateSpring({
  from,
  to,
  velocity = 0,
  stiffness,
  damping,
  mass = 1,
  dt = 1 / 60,
  restDelta = 0.0015,
  restSpeed = 0.02,
  maxMs = 900,
}) {
  const frames = [];
  let x = from;
  let v = velocity;
  let overshoot = false;
  const sign = Math.sign(to - from) || 1;
  const stepMs = dt * 1000;
  for (let t = 0; t <= maxMs; t += stepMs) {
    frames.push({ t, x });
    if (t > 0 && (x - to) * sign > 0.0008) overshoot = true;
    if (t > 0 && Math.abs(x - to) < restDelta && Math.abs(v) < restSpeed) break;
    const next = stepSpring({ x, v }, to, { stiffness, damping, mass }, dt);
    x = next.x;
    v = next.v;
  }
  const last = frames[frames.length - 1];
  if (Math.abs(last.x - to) > 0.0001) frames.push({ t: last.t + stepMs, x: to });
  else last.x = to;
  return { frames, duration: frames[frames.length - 1].t, overshoot };
}

export function thinFrames(frames, max = 28) {
  if (frames.length <= max) return frames.slice();
  const end = frames[frames.length - 1].x;
  let peakIndex = 0;
  frames.forEach((frame, index) => {
    if (Math.abs(frame.x - end) > Math.abs(frames[peakIndex].x - end)) peakIndex = index;
  });
  const picked = new Set([0, frames.length - 1, peakIndex]);
  const step = (frames.length - 1) / (max - 1);
  for (let i = 0; i < max; i += 1) picked.add(Math.round(i * step));
  return [...picked].sort((a, b) => a - b).map(index => frames[index]);
}

export function springTrack({ from, to, opacityFrom, opacityTo, velocity = 0, ...config }) {
  const simulated = simulateSpring({ from, to, velocity, ...config });
  const frames = thinFrames(simulated.frames);
  const duration = Math.max(simulated.duration, 16);
  const span = to - from || 1;
  let previous = -1;
  const keyframes = frames.map(frame => {
    let offset = Math.min(1, Math.max(0, frame.t / duration));
    if (offset <= previous) offset = Math.min(1, previous + 0.0001);
    previous = offset;
    const keyframe = { offset, scale: frame.x, easing: 'linear' };
    if (opacityFrom != null && opacityTo != null) {
      const progress = Math.min(1, Math.max(0, (frame.x - from) / span));
      keyframe.opacity = opacityFrom + (opacityTo - opacityFrom) * progress;
    }
    return keyframe;
  });
  keyframes[0].offset = 0;
  keyframes[keyframes.length - 1].offset = 1;
  keyframes[keyframes.length - 1].scale = to;
  if (opacityTo != null) keyframes[keyframes.length - 1].opacity = opacityTo;
  return { duration, keyframes, overshoot: simulated.overshoot };
}
