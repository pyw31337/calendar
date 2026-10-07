/**
 * Same burst as https://app.cresotech.com/clipboardtool_welcome.html
 * (canvas-confetti 1.9, origin y 0.8, five layered shots).
 * The library keeps one canvas and locks the z-index from the first call,
 * so every shot uses the same top layer.
 */
import confetti from 'canvas-confetti';

/** Below modal overlays (~11000+) so particles never cover controls. */
export const CONFETTI_Z_INDEX = 9000;

if (typeof window !== 'undefined') window.confetti = confetti;

const COUNT = 350;
const defaults = {
  origin: { y: 0.8 },
  zIndex: CONFETTI_Z_INDEX,
  disableForReducedMotion: true,
};

function shouldSkipConfetti() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  } catch (_) { /* ignore */ }
  // Skip while a modal/sheet/settings overlay is open so particles never sit on controls.
  if (document.querySelector('.modal-overlay, .bottom-sheet-overlay, .admin-side-menu-overlay')) return true;
  return false;
}

function fire(particleRatio, opts) {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(COUNT * particleRatio),
  });
}

function pinConfettiLayer() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('body > canvas').forEach(canvas => {
    if (canvas.style.position !== 'fixed' || canvas.style.pointerEvents !== 'none') return;
    canvas.classList.add('bp-confetti-layer');
    canvas.style.zIndex = String(CONFETTI_Z_INDEX);
  });
}

export function launchClipboardConfetti() {
  if (shouldSkipConfetti()) return;
  try {
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      gravity: 3.0,
      ticks: 200,
    });
    fire(0.2, {
      spread: 60,
      gravity: 2.0,
      ticks: 200,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      gravity: 2.0,
      ticks: 200,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      gravity: 2.0,
      ticks: 200,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      gravity: 2.0,
      ticks: 200,
    });
    pinConfettiLayer();
  } catch (err) {
    console.warn('celebrate confetti failed', err);
  }
}
