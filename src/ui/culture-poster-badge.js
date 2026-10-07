// Compatibility entry point for existing UI imports. The rules live in core so
// server-side import jobs and Node tests never have to initialise React globals.
export {
  CULTURE_POSTER_BADGE_COLORS,
  contentPosterStatusBadge,
  getCulturePosterBadge,
  weekEndSundayIso,
} from '../core/culture-poster-badge.js';
