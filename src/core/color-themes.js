/**
 * Color themes = a mode (light/dark, on <html data-theme>) plus an optional point color
 * (<html data-accent>). No accent means each mode's original brand: purple in light, lime in dark.
 * The palettes live in src/ui/v2/color-themes.css as --a-* (light) / --d-* (dark) tokens; every
 * themed literal in the V2 CSS reads them with its original color as the fallback, so the two
 * default themes render exactly as before.
 *
 * The choice is stored in the existing per-calendar theme key (gather_theme_preference_<id>_v1)
 * as "light" | "dark" | "light:orange" | "dark:blue" ...; absent means follow the system mode.
 */

export const COLOR_THEME_ACCENTS = ['orange', 'blue'];

// Settings groups the picker by mode: 밝은 테마 / 어두운 테마.
export const COLOR_THEME_GROUPS = [
  { mode: 'light', label: '밝은 테마' },
  { mode: 'dark', label: '어두운 테마' },
];

export const COLOR_THEMES = [
  { id: 'light', mode: 'light', accent: '', label: '화이트 · 보라', pointLabel: '보라', surface: '#FFFFFF', point: '#7C2FE5' },
  { id: 'light:orange', mode: 'light', accent: 'orange', label: '화이트 · 오렌지', pointLabel: '오렌지', surface: '#FFFFFF', point: '#EA580C' },
  { id: 'light:blue', mode: 'light', accent: 'blue', label: '화이트 · 블루', pointLabel: '블루', surface: '#FFFFFF', point: '#2563EB' },
  { id: 'dark', mode: 'dark', accent: '', label: '블랙 · 라임', pointLabel: '라임', surface: '#0D0D0D', point: '#C9FD58' },
  { id: 'dark:orange', mode: 'dark', accent: 'orange', label: '블랙 · 오렌지', pointLabel: '오렌지', surface: '#0D0D0D', point: '#FF7A1A' },
  { id: 'dark:blue', mode: 'dark', accent: 'blue', label: '블랙 · 블루', pointLabel: '블루', surface: '#0D0D0D', point: '#4DA3FF' },
];

// "system" | "light" | "dark", optionally ":<accent>". Unknown values read as the system default.
export function parseThemeChoice(value) {
  const raw = String(value || '');
  const [mode, accent = ''] = raw.split(':');
  if (mode !== 'light' && mode !== 'dark') return { mode: 'system', accent: '' };
  return { mode, accent: COLOR_THEME_ACCENTS.includes(accent) ? accent : '' };
}

export function serializeThemeChoice({ mode, accent }) {
  if (mode !== 'light' && mode !== 'dark') return 'system';
  return COLOR_THEME_ACCENTS.includes(accent) ? `${mode}:${accent}` : mode;
}

export function isStoredThemeChoice(value) {
  return parseThemeChoice(value).mode !== 'system';
}

// The dark-mode switch flips the mode and keeps the point color (orange stays orange); the
// default purple and lime are each other's counterpart.
export function toggleThemeChoice(choice, resolvedMode) {
  const { accent } = parseThemeChoice(choice);
  return serializeThemeChoice({ mode: resolvedMode === 'dark' ? 'light' : 'dark', accent });
}

export function findColorTheme(id) {
  return COLOR_THEMES.find(theme => theme.id === id) || null;
}

// The theme actually on screen, as a COLOR_THEMES id (system mode already resolved to isDark).
export function resolveColorThemeId(choice, isDark) {
  return serializeThemeChoice({ mode: isDark ? 'dark' : 'light', accent: parseThemeChoice(choice).accent });
}

// <html data-theme> carries the mode, <html data-accent> the point color (absent = the default).
export function applyColorThemeAttributes(root, mode, choice) {
  root.setAttribute('data-theme', mode);
  const { accent } = parseThemeChoice(choice);
  if (accent) root.setAttribute('data-accent', accent);
  else root.removeAttribute('data-accent');
}
