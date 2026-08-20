/**
 * Icon components (P4-23)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_CONFIG = window.GATHER_APP_CONFIG || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getActiveAvailabilities(calendar) {
  const f = __gatherUiDeps().getActiveAvailabilities || GATHER_APP_UTILS.getActiveAvailabilities;
  return typeof f === 'function' ? f(calendar) : [];
}
function getActiveParticipants(calendar) {
  const f = __gatherUiDeps().getActiveParticipants || GATHER_APP_UTILS.getActiveParticipants;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPolls(calendar) {
  const f = __gatherUiDeps().getCalendarPolls || GATHER_APP_UTILS.getCalendarPolls;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPlaces(calendar) {
  const f = __gatherUiDeps().getCalendarPlaces || GATHER_APP_UTILS.getCalendarPlaces;
  return typeof f === 'function' ? f(calendar) : [];
}
function useChatSendGuard(onSend, canSend) {
  const f = __gatherUiDeps().useChatSendGuard;
  return typeof f === 'function' ? f(onSend, canSend) : onSend;
}
function computeKoreanHolidaysForYear(year) {
  const f = __gatherUiDeps().computeKoreanHolidaysForYear;
  return typeof f === 'function' ? f(year) : [];
}
function getFooterFamilyLinks() {
  return __gatherUiDeps().FOOTER_FAMILY_LINKS || [];
}


export function MenuIcon({ paths }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 }
  }, paths.map((d, i) => /*#__PURE__*/React.createElement("path", { key: i, d })));
}

export function NotepadTextIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 }
  },
    /*#__PURE__*/React.createElement("path", { d: "M8 2v4" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 2v4" }),
    /*#__PURE__*/React.createElement("path", { d: "M16 2v4" }),
    /*#__PURE__*/React.createElement("rect", { width: "16", height: "18", x: "4", y: "4", rx: "2" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 10h6" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 14h8" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 18h5" })
  );
}

export function ChatSectionIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { marginRight: '6px' }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
  }));
}

export function LinkIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-link"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M9 15l6 -6" }),
    /*#__PURE__*/React.createElement("path", { d: "M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" }),
    /*#__PURE__*/React.createElement("path", { d: "M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" }));
}

export function MessageCommentIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 9h8" }),
    /*#__PURE__*/React.createElement("path", { d: "M8 13h6" }),
    /*#__PURE__*/React.createElement("path", { d: "M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12" })
  );
}

export function PencilIcon({ size = 12 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" }),
    /*#__PURE__*/React.createElement("path", { d: "M13.5 6.5l4 4" })
  );
}

export function BuildingIcon({ size = 14 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("path", { d: "M10 12h4" }),
    /*#__PURE__*/React.createElement("path", { d: "M10 8h4" }),
    /*#__PURE__*/React.createElement("path", { d: "M14 21v-3a2 2 0 0 0-4 0v3" }),
    /*#__PURE__*/React.createElement("path", { d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" }),
    /*#__PURE__*/React.createElement("path", { d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" })
  );
}

export function BackArrowIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
    style: { transform: 'rotate(90deg)', display: 'inline-block' }
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" }));
}

export function SunIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-sun"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /*#__PURE__*/React.createElement("path", { d: "M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" }));
}

export function CloudIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-cloud"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M7 18a4.6 4.4 0 0 1 0 -9h.1a5 4.5 0 0 1 11 2h.9a4 3.5 0 0 1 0 7h-12" }));
}

export function MistIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-mist"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M5 5h14M5 9h14M5 13h14M5 17h14" }));
}

export function CloudRainIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-cloud-rain"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M7 18a4.6 4.4 0 0 1 0 -9h.1a5 4.5 0 0 1 11 2h.9a4 3.5 0 0 1 0 7h-12M8 22l-.5 -1.5M12 22l-.5 -1.5M16 22l-.5 -1.5" }));
}

export function SnowflakeIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-snowflake"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M10 4l2 1l2 -1M12 2v6.5M10 20l2 -1l2 1M12 15.5v6.5M20 10l-1 2l1 2M15.5 12h6.5M4 10l1 2l-1 2M2 12h6.5M4.43 4.43l4.24 4.24M2.5 5.5l1.5 1.5l1.5 -1.5M19.56 19.56l-4.24 -4.24M18.5 17.5l1.5 1.5l1.5 -1.5M19.56 4.43l-4.24 4.24M18.5 6.5l1.5 -1.5l1.5 1.5M4.43 19.56l4.24 -4.24M2.5 18.5l1.5 -1.5l1.5 1.5" }));
}

export function CloudLightningIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-cloud-lightning"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M7 18a4.6 4.4 0 0 1 0 -9h.1a5 4.5 0 0 1 11 2h.9a4 3.5 0 0 1 0 7h-12M13 18l-2 3v-3l-2 3" }));
}

export function SettingsIcon({ size = 18 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icon-tabler-settings"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "3" }));
}

export function MapCogIcon({ size = 16 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-map-cog"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v8" }), /*#__PURE__*/React.createElement("path", { d: "M9 4v13" }), /*#__PURE__*/React.createElement("path", { d: "M15 7v6.5" }), /*#__PURE__*/React.createElement("path", { d: "M17.001 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }), /*#__PURE__*/React.createElement("path", { d: "M19.001 15.5v1.5" }), /*#__PURE__*/React.createElement("path", { d: "M19.001 21v1.5" }), /*#__PURE__*/React.createElement("path", { d: "M22.032 17.25l-1.299 .75" }), /*#__PURE__*/React.createElement("path", { d: "M17.27 20l-1.3 .75" }), /*#__PURE__*/React.createElement("path", { d: "M15.97 17.25l1.3 .75" }), /*#__PURE__*/React.createElement("path", { d: "M20.733 20l1.3 .75" }));
}

export function GiftIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-gift"
  },
    /*#__PURE__*/React.createElement("rect", { x: "3", y: "8", width: "18", height: "4", rx: "1" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 8v13" }),
    /*#__PURE__*/React.createElement("path", { d: "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 8H7.5a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8z" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 8h4.5a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8z" })
  );
}

export function MoonStarsIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" }),
    /*#__PURE__*/React.createElement("path", { d: "M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" }),
    /*#__PURE__*/React.createElement("path", { d: "M19 11h2m-1 -1v2" }));
}

export function TextResizeIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M3 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }),
    /*#__PURE__*/React.createElement("path", { d: "M17 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }),
    /*#__PURE__*/React.createElement("path", { d: "M3 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }),
    /*#__PURE__*/React.createElement("path", { d: "M17 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" }),
    /*#__PURE__*/React.createElement("path", { d: "M5 7v10" }),
    /*#__PURE__*/React.createElement("path", { d: "M7 5h10" }),
    /*#__PURE__*/React.createElement("path", { d: "M7 19h10" }),
    /*#__PURE__*/React.createElement("path", { d: "M19 7v10" }),
    /*#__PURE__*/React.createElement("path", { d: "M10 10h4" }),
    /*#__PURE__*/React.createElement("path", { d: "M12 14v-4" }));
}

export function BellIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
    /*#__PURE__*/React.createElement("path", { d: "M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" }),
    /*#__PURE__*/React.createElement("path", { d: "M9 17v1a3 3 0 0 0 6 0v-1" }));
}

export function SearchIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-search"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 21l-6 -6"
  }));
}

export function CalendarCheckIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon lucide lucide-calendar-check"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 2v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 2v3"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 9h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 15 2 2 4-4"
  }));
}

export function LockIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-lock"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 11m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11v-4a4 4 0 1 1 8 0v4"
  }));
}

export function LogoutIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-logout"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 12h12l-3 -3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 15l3 -3"
  }));
}

export function RefreshIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-refresh"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"
  }));
}

export function AdminFilledMenuIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className: "icon icon-tabler icons-tabler-filled icon-tabler-menu-2"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 6a1 1 0 0 1 -1 1h-16a1 1 0 1 1 0 -2h16a1 1 0 0 1 1 1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12a1 1 0 0 1 -1 1h-16a1 1 0 0 1 0 -2h16a1 1 0 0 1 1 1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 18a1 1 0 0 1 -1 1h-16a1 1 0 0 1 0 -2h16a1 1 0 0 1 1 1"
  }));
}

export function EmojiPickerIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-mood-smile"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12", cy: "12", r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 10l.01 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 10l.01 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 15a3.5 3.5 0 0 0 5 0"
  }));
}

export function ExternalLinkIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "lucide lucide-external-link-icon lucide-external-link"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 3h6v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 14 21 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
  }));
}

export function ShareIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, /*#__PURE__*/React.createElement("circle", { cx: "18", cy: "5", r: "3" }),
     /*#__PURE__*/React.createElement("circle", { cx: "6", cy: "12", r: "3" }),
     /*#__PURE__*/React.createElement("circle", { cx: "18", cy: "19", r: "3" }),
     /*#__PURE__*/React.createElement("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
     /*#__PURE__*/React.createElement("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }));
}

export function WalletIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-wallet"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 12v4h-4a2 2 0 0 1 0 -4h4"
  }));
}

export function CoinIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    className: "day-coin-icon",
    viewBox: "0 0 24 24",
    width: "16",
    height: "17",
    style: {
      flexShrink: 0,
      verticalAlign: 'middle',
      marginLeft: 0
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "11",
    fill: "#8A99AD"
  }), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "16.5",
    fontSize: "14",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "900",
    textAnchor: "middle",
    fill: "#FFFFFF"
  }, "\u20A9"));
}

export function BanknoteArrowUpIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon lucide lucide-banknote-arrow-up"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 12h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 22v-6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m22 19-3-3-3 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12h.01"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }));
}

export function BanknoteArrowDownIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon lucide lucide-banknote-arrow-down"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m16 19 3 3 3-3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 12h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 16v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12h.01"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }));
}

export function PiggyBankIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon lucide lucide-piggy-bank"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 10h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 8v1a2 2 0 0 0 2 2h1"
  }));
}

export function ChartBarIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chart-bar"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 20h14"
  }));
}

export function ChartPieIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chart-pie"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-6.8a2 2 0 0 1 -2 -2v-7a.9 .9 0 0 0 -1 -.8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 3.5a9 9 0 0 1 5.5 5.5h-4.5a1 1 0 0 1 -1 -1v-4.5"
  }));
}

export function CalendarCogIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-calendar-cog"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 21h-6a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.001 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.001 15.5v1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.001 21v1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22.032 17.25l-1.299 .75"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.27 20l-1.3 .75"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.97 17.25l1.3 .75"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20.733 20l1.3 .75"
  }));
}

export function CalendarSearchIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-calendar-search"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11.5 21h-5.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20.2 20.2l1.8 1.8"
  }));
}

export function TrophyIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "lucide lucide-trophy-icon lucide-trophy"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 22h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"
  }));
}

export function PodiumIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "lucide lucide-podium-icon lucide-podium"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 6V2h-1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 15a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 21V11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10"
  }));
}

export function CloudDataConnectionIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-cloud-data-connection"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 9.897c0 -1.714 1.46 -3.104 3.26 -3.104c.275 -1.22 1.255 -2.215 2.572 -2.611c1.317 -.397 2.77 -.134 3.811 .69c1.042 .822 1.514 2.08 1.239 3.3h.693a2.42 2.42 0 0 1 2.425 2.414a2.42 2.42 0 0 1 -2.425 2.414h-8.315c-1.8 0 -3.26 -1.39 -3.26 -3.103"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 13v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 18h7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 18h7"
  }));
}

export function LogIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "lucide lucide-list-todo"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 9h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 13h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 17h6"
  }));
}

export function HourglassIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "lucide lucide-rotate-ccw-clock-icon lucide-rotate-ccw-clock"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 3v5h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l4 2"
  }));
}

export function AlertTriangleIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-alert-triangle"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16h.01"
  }));
}

export function ShieldCheckIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-shield-check"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 12l2 2l4 -4"
  }));
}

export function CalendarExportIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-calendar-plus"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 16h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 14v4"
  }));
}

export function GalleryIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-photo"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 8h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"
  }));
}

export function PollSectionIcon() {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-checkbox"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 11l3 3l8 -8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"
  }));
}

export function LineHeightIcon({ size = 22 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-line-height"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 8l3 -3l3 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 16l3 3l3 -3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 5l0 14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 6l7 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 12l7 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 18l7 0"
  }));
}

export function MegaphoneIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "lucide lucide-megaphone-icon lucide-megaphone"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 6v8"
  }));
}

export function SmallXIcon({ size = 24 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-x"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 6l-12 12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12"
  }));
}

export function PlaceSectionIcon({ size = 20 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-map-pin"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"
  }));
}

export function ThreeLinesIcon({ size = 18 } = {}) {
  const React = window.React;

  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round"
  }, /*#__PURE__*/React.createElement("line", { x1: "4", y1: "7", x2: "20", y2: "7" }),
    /*#__PURE__*/React.createElement("line", { x1: "4", y1: "12", x2: "20", y2: "12" }),
    /*#__PURE__*/React.createElement("line", { x1: "4", y1: "17", x2: "20", y2: "17" }));
}

export function PlaceCategoryMarkerIcon({ category, size = 14, strokeColor = "#fff" } = {}) {
  const React = window.React;

  const content = getPlaceCategoryMarkerContent(category);
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: strokeColor,
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, content.shapes.map((shape, i) => /*#__PURE__*/React.createElement(shape.tag, { key: i, ...(shape.tag === 'rect' ? { x: shape.x, y: shape.y, width: shape.width, height: shape.height, rx: shape.rx, ry: shape.ry } : shape.tag === 'circle' ? { cx: shape.cx, cy: shape.cy, r: shape.r } : { d: shape.d }) })));
}

export function CctvIcon({ size = 14 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
  },
    /*#__PURE__*/React.createElement('path', { d: 'M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97' }),
    /*#__PURE__*/React.createElement('path', { d: 'M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z' }),
    /*#__PURE__*/React.createElement('path', { d: 'M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15' }),
    /*#__PURE__*/React.createElement('path', { d: 'M2 21v-4' }),
    /*#__PURE__*/React.createElement('path', { d: 'M7 9h.01' })
  );
}

export function DicesIcon({ size = 14 }) {
  const React = window.React;

  return /*#__PURE__*/React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
  },
    /*#__PURE__*/React.createElement('rect', { width: '12', height: '12', x: '2', y: '10', rx: '2', ry: '2' }),
    /*#__PURE__*/React.createElement('path', { d: 'm17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6' }),
    /*#__PURE__*/React.createElement('path', { d: 'M6 18h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M10 14h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M15 6h.01' }),
    /*#__PURE__*/React.createElement('path', { d: 'M18 9h.01' })
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    MenuIcon: MenuIcon,
    NotepadTextIcon: NotepadTextIcon,
    ChatSectionIcon: ChatSectionIcon,
    LinkIcon: LinkIcon,
    MessageCommentIcon: MessageCommentIcon,
    PencilIcon: PencilIcon,
    BuildingIcon: BuildingIcon,
    BackArrowIcon: BackArrowIcon,
    SunIcon: SunIcon,
    CloudIcon: CloudIcon,
    MistIcon: MistIcon,
    CloudRainIcon: CloudRainIcon,
    SnowflakeIcon: SnowflakeIcon,
    CloudLightningIcon: CloudLightningIcon,
    SettingsIcon: SettingsIcon,
    MapCogIcon: MapCogIcon,
    GiftIcon: GiftIcon,
    MoonStarsIcon: MoonStarsIcon,
    TextResizeIcon: TextResizeIcon,
    BellIcon: BellIcon,
    SearchIcon: SearchIcon,
    CalendarCheckIcon: CalendarCheckIcon,
    LockIcon: LockIcon,
    LogoutIcon: LogoutIcon,
    RefreshIcon: RefreshIcon,
    AdminFilledMenuIcon: AdminFilledMenuIcon,
    EmojiPickerIcon: EmojiPickerIcon,
    ExternalLinkIcon: ExternalLinkIcon,
    ShareIcon: ShareIcon,
    WalletIcon: WalletIcon,
    CoinIcon: CoinIcon,
    BanknoteArrowUpIcon: BanknoteArrowUpIcon,
    BanknoteArrowDownIcon: BanknoteArrowDownIcon,
    PiggyBankIcon: PiggyBankIcon,
    ChartBarIcon: ChartBarIcon,
    ChartPieIcon: ChartPieIcon,
    CalendarCogIcon: CalendarCogIcon,
    CalendarSearchIcon: CalendarSearchIcon,
    TrophyIcon: TrophyIcon,
    PodiumIcon: PodiumIcon,
    CloudDataConnectionIcon: CloudDataConnectionIcon,
    LogIcon: LogIcon,
    HourglassIcon: HourglassIcon,
    AlertTriangleIcon: AlertTriangleIcon,
    ShieldCheckIcon: ShieldCheckIcon,
    CalendarExportIcon: CalendarExportIcon,
    GalleryIcon: GalleryIcon,
    PollSectionIcon: PollSectionIcon,
    LineHeightIcon: LineHeightIcon,
    MegaphoneIcon: MegaphoneIcon,
    SmallXIcon: SmallXIcon,
    PlaceSectionIcon: PlaceSectionIcon,
    ThreeLinesIcon: ThreeLinesIcon,
    PlaceCategoryMarkerIcon: PlaceCategoryMarkerIcon,
    CctvIcon: CctvIcon,
    DicesIcon: DicesIcon,
  });
}
