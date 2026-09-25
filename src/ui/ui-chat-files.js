/**
 * Chat file attachment card + document lightbox.
 * PDF: browser iframe/object viewer. Office/text: download / open-in-new-tab.
 */

import { resolveFileTypeIconUrl } from './file-type-icons.js';

function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function __chatFiles() { return window.GATHER_CHAT_FILE_ATTACHMENTS || {}; }

function formatChatFileSize() {
  var args = Array.prototype.slice.call(arguments);
  var f = __chatFiles().formatChatFileSize || __gatherUiDeps().formatChatFileSize;
  return typeof f === "function" ? f.apply(null, args) : "";
}
function getChatFileTypeLabel() {
  var args = Array.prototype.slice.call(arguments);
  var f = __chatFiles().getChatFileTypeLabel || __gatherUiDeps().getChatFileTypeLabel;
  return typeof f === "function" ? f.apply(null, args) : "FILE";
}
function isPdfAttachment() {
  var args = Array.prototype.slice.call(arguments);
  var f = __chatFiles().isPdfAttachment || __gatherUiDeps().isPdfAttachment;
  return typeof f === "function" ? f.apply(null, args) : false;
}
function highlightKeyword(value, keyword) {
  var f = __gatherUiDeps().highlightKeyword;
  return typeof f === "function" ? f(value, keyword) : value;
}


function isHttpUrl(value) {
  try {
    var u = new URL(String(value || ""), typeof window !== "undefined" ? window.location.href : "https://local.invalid");
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_) {
    return false;
  }
}

/** iOS/WebKit often cannot inline-render cross-origin Firebase Storage PDFs in an iframe
 *  (shows gray PDF icon + encoded storage path + 「열기」). Same-origin blob: URLs work. */
function usePdfPreviewUrl(sourceUrl, enabled) {
  var React = window.React;
  var _state = React.useState({ status: enabled ? "idle" : "skip", url: null, error: null });
  var state = _state[0];
  var setState = _state[1];

  React.useEffect(function() {
    if (!enabled) {
      setState({ status: "skip", url: null, error: null });
      return undefined;
    }
    if (!sourceUrl || !isHttpUrl(sourceUrl)) {
      setState({ status: "error", url: null, error: "invalid-url" });
      return undefined;
    }

    var cancelled = false;
    var objectUrl = null;
    setState({ status: "loading", url: null, error: null });

    fetch(sourceUrl, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "force-cache"
    }).then(function(res) {
      if (!res.ok) throw new Error("http-" + res.status);
      return res.blob();
    }).then(function(blob) {
      if (cancelled) return;
      var typed = blob && blob.type === "application/pdf"
        ? blob
        : new Blob([blob], { type: "application/pdf" });
      objectUrl = URL.createObjectURL(typed);
      setState({ status: "ready", url: objectUrl, error: null });
    }).catch(function(err) {
      if (cancelled) return;
      var ua = typeof navigator !== "undefined" ? String(navigator.userAgent || "") : "";
      var isMobileUa = /Android|iP(hone|od|ad)|Mobile/i.test(ua)
        || (typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      if (isMobileUa) {
        setState({ status: "error", url: null, error: err && err.message ? err.message : "fetch-failed" });
      } else {
        setState({ status: "remote", url: sourceUrl, error: err && err.message ? err.message : "fetch-failed" });
      }
    });

    return function() {
      cancelled = true;
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl); } catch (_) {}
      }
    };
  }, [sourceUrl, enabled]);

  return state;
}

function FileTypeBadge(props) {
  var React = window.React;
  var label = (props && props.label) || "FILE";
  var attachment = props && props.attachment;
  var iconSrc = resolveFileTypeIconUrl(attachment || label);
  return React.createElement("div", {
    style: {
      width: "48px", height: "48px", borderRadius: "10px",
      backgroundColor: "color-mix(in srgb, var(--primary) 12%, var(--bg-secondary))",
      color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.02em", flexShrink: 0,
      overflow: "hidden"
    },
    "aria-hidden": true
  },
    React.createElement("img", {
      src: iconSrc,
      alt: "",
      width: 40,
      height: 40,
      decoding: "async",
      style: { width: "40px", height: "40px", objectFit: "contain", display: "block" }
    })
  );
}

function DocZoomControls(props) {
  var React = window.React;
  var zoomLevel = props.zoomLevel;
  var onZoomIn = props.onZoomIn;
  var onZoomOut = props.onZoomOut;
  var onZoomReset = props.onZoomReset;
  var zoomMin = props.zoomMin;
  var zoomMax = props.zoomMax;
  var zoomDefault = props.zoomDefault;
  var btnStyle = function(disabled) {
    return {
      height: "32px", minWidth: "32px", padding: "0 8px", borderRadius: "8px",
      border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
      color: "var(--text-main)", cursor: disabled ? "default" : "pointer",
      fontWeight: 800, fontSize: "var(--font-size-sm)", opacity: disabled ? 0.45 : 1,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, lineHeight: 1
    };
  };
  return React.createElement("div", {
    style: { display: "inline-flex", alignItems: "center", gap: "4px", flexShrink: 0 }
  },
    React.createElement("button", {
      type: "button", onClick: onZoomOut, disabled: zoomLevel <= zoomMin,
      "aria-label": "축소", title: "축소", style: btnStyle(zoomLevel <= zoomMin)
    }, "-"),
    React.createElement("button", {
      type: "button", onClick: onZoomReset, disabled: zoomLevel === zoomDefault,
      "aria-label": "맞춤", title: "맞춤 (100%)",
      style: Object.assign({}, btnStyle(zoomLevel === zoomDefault), {
        minWidth: "44px", padding: "0 4px", fontVariantNumeric: "tabular-nums"
      })
    }, zoomLevel + "%"),
    React.createElement("button", {
      type: "button", onClick: onZoomIn, disabled: zoomLevel >= zoomMax,
      "aria-label": "확대", title: "확대", style: btnStyle(zoomLevel >= zoomMax)
    }, "+")
  );
}


/* ---------------- type-aware previews ---------------- */

var INLINE_FETCH_MAX_BYTES = 3 * 1024 * 1024;
var LIGHTBOX_FETCH_MAX_BYTES = 20 * 1024 * 1024;
// One parse per file per page session; the Storage bytes themselves are cached by the browser
// HTTP cache (and the service worker), so re-opening a file costs no egress.
var __previewModelCache = new Map();
var __extractorModule = null;

function loadPreviewExtractor() {
  if (!__extractorModule) {
    __extractorModule = import("../core/file-preview-extract.js").catch(function(err) {
      __extractorModule = null;
      throw err;
    });
  }
  return __extractorModule;
}

function previewKindOf(attachment) {
  // Synchronous copy of getFilePreviewKind (file-preview-extract.js is a lazy chunk).
  var ext = String((attachment && (attachment.ext || String(attachment.name || "").split(".").pop())) || "").toLowerCase();
  var mime = String((attachment && attachment.mime) || "").toLowerCase();
  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (/^(jpe?g|png|webp|gif|bmp|avif|svg)$/.test(ext) || (/^image\//.test(mime) && !/hei[cf]/.test(mime))) return "image";
  if (/^(mp4|webm|mov|m4v)$/.test(ext) || /^video\//.test(mime)) return "video";
  if (/^(mp3|m4a|aac|wav|ogg|oga|flac)$/.test(ext) || /^audio\//.test(mime)) return "audio";
  if (/^(csv|tsv)$/.test(ext)) return "table";
  if (ext === "rtf") return "rtf";
  if (/^(docx|hwpx|odt)$/.test(ext)) return "document";
  if (/^(xlsx|ods)$/.test(ext)) return "sheet";
  if (/^(pptx|odp)$/.test(ext)) return "slides";
  if (/^(txt|md|markdown|log|json|xml|ya?ml|ini)$/.test(ext) || /^text\//.test(mime)) return "text";
  return "none";
}

function isExtractedKind(kind) {
  return kind === "text" || kind === "table" || kind === "rtf" || kind === "document" || kind === "sheet" || kind === "slides";
}

function loadPreviewModel(attachment) {
  var key = attachment.url;
  if (__previewModelCache.has(key)) return __previewModelCache.get(key);
  var promise = loadPreviewExtractor().then(function(mod) {
    return fetch(attachment.url, { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer", cache: "force-cache" })
      .then(function(res) {
        if (!res.ok) throw new Error("http-" + res.status);
        return res.arrayBuffer();
      })
      .then(function(buf) { return mod.extractFilePreview(attachment, new Uint8Array(buf)); })
      .then(function(model) {
        return { model: model, summary: mod.summarizeFilePreview(model, 4) };
      });
  });
  promise.catch(function() { __previewModelCache.delete(key); });
  __previewModelCache.set(key, promise);
  return promise;
}

/** Parsed preview for text/office files. `enabled` gates the network fetch. */
function useFilePreviewModel(attachment, enabled, maxBytes) {
  var React = window.React;
  var kind = attachment ? previewKindOf(attachment) : "none";
  var size = Number(attachment && attachment.size) || 0;
  var eligible = !!(attachment && attachment.url && isHttpUrl(attachment.url) && isExtractedKind(kind) && size <= maxBytes);
  var _s = React.useState({ status: "idle", model: null, summary: "" });
  var state = _s[0];
  var setState = _s[1];
  React.useEffect(function() {
    if (!eligible || !enabled) return undefined;
    var cancelled = false;
    setState(function(prev) { return prev.status === "ready" ? prev : { status: "loading", model: null, summary: "" }; });
    loadPreviewModel(attachment).then(function(result) {
      if (cancelled) return;
      var empty = !result.model || result.model.kind === "none";
      setState({ status: empty ? "empty" : "ready", model: result.model, summary: result.summary || "" });
    }).catch(function() {
      if (!cancelled) setState({ status: "error", model: null, summary: "" });
    });
    return function() { cancelled = true; };
  }, [attachment && attachment.url, eligible, enabled]);
  return { kind: kind, eligible: eligible, status: eligible ? state.status : "skip", model: state.model, summary: state.summary };
}

/** true once the element has scrolled near the viewport (inline previews fetch lazily). */
function useNearViewport(ref) {
  var React = window.React;
  var _v = React.useState(false);
  var visible = _v[0];
  var setVisible = _v[1];
  React.useEffect(function() {
    if (visible) return undefined;
    var el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return undefined; }
    var io = new IntersectionObserver(function(entries) {
      if (entries.some(function(e) { return e.isIntersecting; })) { setVisible(true); io.disconnect(); }
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    return function() { io.disconnect(); };
  }, [visible]);
  return visible;
}

var stopBubble = function(e) { if (e) e.stopPropagation(); };

function FileInlineMedia(props) {
  var React = window.React;
  var attachment = props.attachment;
  var kind = props.kind;
  var visible = props.visible;
  if (!visible) return React.createElement("div", { className: "chat-file-preview-media", style: { height: kind === "audio" ? "40px" : "140px" } });
  if (kind === "image") {
    return React.createElement("img", {
      className: "chat-file-preview-media",
      src: attachment.url, alt: attachment.name || "", loading: "lazy", decoding: "async",
      style: { display: "block", width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "10px", background: "var(--bg-secondary)" }
    });
  }
  if (kind === "video") {
    return React.createElement("video", {
      className: "chat-file-preview-media",
      src: attachment.url, controls: true, preload: "metadata", playsInline: true,
      onClick: stopBubble, onKeyDown: stopBubble,
      style: { display: "block", width: "100%", maxHeight: "220px", borderRadius: "10px", background: "#000" }
    });
  }
  if (kind === "audio") {
    return React.createElement("audio", {
      className: "chat-file-preview-media",
      src: attachment.url, controls: true, preload: "none",
      onClick: stopBubble, onKeyDown: stopBubble,
      style: { display: "block", width: "100%" }
    });
  }
  return null;
}

function PreviewTable(props) {
  var React = window.React;
  var rows = props.rows || [];
  var maxRows = props.maxRows || rows.length;
  var maxCols = props.maxCols || 99;
  var compact = !!props.compact;
  var shown = rows.slice(0, maxRows);
  var width = shown.reduce(function(m, r) { return Math.max(m, Math.min(maxCols, r.length)); }, 0);
  if (!shown.length || !width) return null;
  var cellStyle = function(head) {
    return {
      border: "1px solid var(--border-subtle)", padding: compact ? "3px 6px" : "6px 10px",
      textAlign: "left", verticalAlign: "top", whiteSpace: compact ? "nowrap" : "pre-wrap",
      maxWidth: compact ? "120px" : "280px", overflow: "hidden", textOverflow: "ellipsis",
      fontWeight: head ? 800 : 500, background: head ? "var(--bg-secondary)" : "transparent"
    };
  };
  return React.createElement("table", {
    className: "chat-file-preview-table",
    style: { borderCollapse: "collapse", fontSize: compact ? "12px" : "var(--font-size-sm)", color: "var(--text-main)", minWidth: compact ? 0 : "100%" }
  }, React.createElement("tbody", null, shown.map(function(row, ri) {
    var cells = [];
    for (var ci = 0; ci < width; ci += 1) {
      cells.push(React.createElement(ri === 0 ? "th" : "td", { key: ci, style: cellStyle(ri === 0) }, row[ci] || ""));
    }
    return React.createElement("tr", { key: ri }, cells);
  })));
}

function FileInlineSnippet(props) {
  var React = window.React;
  var preview = props.preview;
  if (preview.status === "loading" || preview.status === "idle") {
    return React.createElement("div", {
      className: "chat-file-preview-snippet is-loading",
      style: { height: "48px", borderRadius: "10px", background: "var(--bg-secondary)" }
    });
  }
  if (preview.status !== "ready" || !preview.model) return null;
  var model = preview.model;
  var table = model.kind === "table" ? model.rows : (model.kind === "sheet" && model.sheets[0] ? model.sheets[0].rows : null);
  if (table && table.length) {
    return React.createElement("div", {
      className: "chat-file-preview-snippet",
      style: { overflow: "hidden", borderRadius: "10px", maxHeight: "104px", background: "var(--bg-secondary)", padding: "6px" }
    }, React.createElement(PreviewTable, { rows: table, maxRows: 4, maxCols: 5, compact: true }));
  }
  if (!preview.summary) return null;
  return React.createElement("div", {
    className: "chat-file-preview-snippet",
    style: {
      whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: "13px", lineHeight: "19px",
      color: "var(--text-main)", background: "var(--bg-secondary)", borderRadius: "10px",
      padding: "8px 10px", maxHeight: "86px", overflow: "hidden",
      display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical"
    }
  }, preview.summary);
}

/** Full-size body of the document lightbox for everything that is not a PDF. */
function FileLightboxBody(props) {
  var React = window.React;
  var current = props.current;
  var kind = props.kind;
  var preview = props.preview;
  var scale = props.scale || 1;
  var _sheet = React.useState(0);
  var sheetIndex = _sheet[0];
  var setSheetIndex = _sheet[1];
  React.useEffect(function() { setSheetIndex(0); }, [current && current.url]);
  var scroller = function(children, extra) {
    return React.createElement("div", {
      className: "document-lightbox-scroll",
      style: Object.assign({
        width: "100%", height: "100%", overflow: "auto", WebkitOverflowScrolling: "touch",
        boxSizing: "border-box", padding: "16px", fontSize: (15 * scale) + "px", lineHeight: 1.6,
        color: "var(--text-main)"
      }, extra || {})
    }, children);
  };
  if (kind === "image") {
    return scroller(React.createElement("img", {
      src: current.url, alt: current.name || "",
      style: { display: "block", margin: "0 auto", maxWidth: (100 * scale) + "%", height: "auto" }
    }), { display: "flex", alignItems: scale > 1 ? "flex-start" : "center", justifyContent: "center" });
  }
  if (kind === "video") {
    return React.createElement("video", {
      src: current.url, controls: true, autoPlay: false, playsInline: true, preload: "metadata",
      style: { width: "100%", height: "100%", background: "#000", display: "block" }
    });
  }
  if (kind === "audio") {
    return scroller(React.createElement("audio", { src: current.url, controls: true, style: { width: "100%" } }),
      { display: "flex", alignItems: "center" });
  }
  if (preview.status === "loading" || preview.status === "idle") {
    return scroller("미리보기를 불러오는 중...", { display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontWeight: 700 });
  }
  var model = preview.status === "ready" ? preview.model : null;
  if (!model) return null;
  if (model.kind === "text") {
    return scroller(React.createElement(React.Fragment, null,
      React.createElement("pre", {
        style: { margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "inherit", fontSize: "inherit" }
      }, model.text),
      model.truncated ? React.createElement("div", { style: { marginTop: "12px", color: "var(--text-muted)", fontWeight: 700 } }, "… 일부만 표시했어요. 전체는 다운로드해서 확인해 주세요.") : null
    ));
  }
  if (model.kind === "table") {
    return scroller(React.createElement(PreviewTable, { rows: model.rows }), { padding: "12px" });
  }
  if (model.kind === "sheet") {
    var sheet = model.sheets[Math.min(sheetIndex, model.sheets.length - 1)] || { rows: [] };
    return React.createElement("div", { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 } },
      model.sheets.length > 1 ? React.createElement("div", {
        style: { display: "flex", gap: "6px", padding: "8px 12px", overflowX: "auto", flexShrink: 0, borderBottom: "1px solid var(--border-subtle)" }
      }, model.sheets.map(function(s, i) {
        var active = i === sheetIndex;
        return React.createElement("button", {
          key: i, type: "button", onClick: function() { setSheetIndex(i); },
          style: {
            height: "32px", padding: "0 12px", borderRadius: "999px", whiteSpace: "nowrap", cursor: "pointer",
            border: "1px solid " + (active ? "var(--v2-accent, var(--brand, #7C2FE5))" : "var(--border-subtle)"),
            background: active ? "var(--v2-accent, var(--brand, #7C2FE5))" : "var(--bg-card)",
            color: active ? "var(--v2-on-accent, #fff)" : "var(--text-main)", fontWeight: 800
          }
        }, s.name);
      })) : null,
      React.createElement("div", { style: { flex: 1, minHeight: 0 } },
        scroller(sheet.rows.length ? React.createElement(PreviewTable, { rows: sheet.rows }) : "빈 시트예요.", { padding: "12px" }))
    );
  }
  if (model.kind === "document") {
    return scroller(React.createElement("div", { style: { maxWidth: "760px", margin: "0 auto" } },
      model.paragraphs.map(function(p, i) {
        return React.createElement("p", {
          key: i, style: { margin: "0 0 0.6em", whiteSpace: "pre-wrap", overflowWrap: "anywhere", minHeight: "1em" }
        }, p);
      })));
  }
  if (model.kind === "slides") {
    return scroller(React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "12px", maxWidth: "760px", margin: "0 auto" } },
      model.slides.map(function(lines, i) {
        return React.createElement("div", {
          key: i,
          style: { border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "14px 16px", background: "var(--bg-card)" }
        },
          React.createElement("div", { style: { fontSize: "0.8em", fontWeight: 800, color: "var(--text-muted)", marginBottom: "6px" } }, "슬라이드 " + (i + 1)),
          lines.length ? lines.map(function(line, li) {
            return React.createElement("div", { key: li, style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontWeight: li === 0 ? 800 : 500 } }, line);
          }) : React.createElement("div", { style: { color: "var(--text-muted)" } }, "(텍스트 없음)")
        );
      })));
  }
  return null;
}

export function FileAttachmentCard(props) {
  var React = window.React;
  var attachment = props && props.attachment;
  var onOpen = props && props.onOpen;
  var onToggleSelect = props && props.onToggleSelect;
  var compact = !!(props && props.compact);
  var searchQuery = (props && props.searchQuery) || "";
  // Selection grids (gallery file tab) stay a plain row; chat/memo bubbles get the preview.
  var showPreview = !compact && typeof onToggleSelect !== "function" && !(props && props.noPreview);
  var rootRef = React.useRef(null);
  var nearViewport = useNearViewport(rootRef);
  var preview = useFilePreviewModel(attachment, showPreview && nearViewport, INLINE_FETCH_MAX_BYTES);
  if (!attachment || !attachment.url) return null;
  var label = getChatFileTypeLabel(attachment);
  var sizeLabel = formatChatFileSize(attachment.size);
  var kind = preview.kind;
  var mediaKind = showPreview && (kind === "image" || kind === "video" || kind === "audio") ? kind : null;
  var activate = function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (typeof onToggleSelect === "function") {
      onToggleSelect();
      return;
    }
    if (typeof onOpen === "function") onOpen(attachment);
  };
  return React.createElement("div", {
    ref: rootRef,
    role: "button",
    tabIndex: 0,
    className: "chat-file-attachment-card" + (mediaKind || preview.status === "ready" ? " has-preview" : ""),
    "data-preview-kind": kind,
    onClick: activate,
    onKeyDown: function(e) {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") activate(e);
    },
    title: attachment.name || "파일",
    style: {
      display: "flex", flexDirection: "column", gap: "8px",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box", textAlign: "left",
      border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
      backgroundColor: "var(--bg-card)", color: "inherit",
      padding: compact ? "8px 10px" : "10px 12px",
      cursor: "pointer", marginTop: compact ? 0 : "6px"
    }
  },
    mediaKind ? React.createElement(FileInlineMedia, { attachment: attachment, kind: mediaKind, visible: nearViewport }) : null,
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0 } },
      React.createElement(FileTypeBadge, { label: label, attachment: attachment }),
      React.createElement("div", { style: { minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "2px" } },
        React.createElement("div", {
          style: {
            fontSize: "var(--font-size-md)", fontWeight: 800, color: "var(--text-main)",
            whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word"
          }
        }, highlightKeyword(attachment.name || "파일", searchQuery)),
        React.createElement("div", {
          style: { fontSize: "var(--font-size-sm)", color: "var(--text-muted)", fontWeight: 600 }
        }, [label, sizeLabel].filter(Boolean).join(" · "))
      )
    ),
    showPreview && preview.eligible ? React.createElement(FileInlineSnippet, { preview: preview }) : null
  );
}

export function DocumentLightbox(props) {
  var React = window.React;
  var attachment = props && props.attachment;
  var onClose = props && props.onClose;
  var attachments = props && props.attachments;
  var index = props && props.index;
  var onNavigate = props && props.onNavigate;
  var list = Array.isArray(attachments) && attachments.length > 0 ? attachments : (attachment ? [attachment] : []);
  var safeIndex = Math.max(0, Math.min(list.length - 1, Number(index) || 0));
  var current = list[safeIndex] || attachment;

  var ZOOM_MIN = 50;
  var ZOOM_MAX = 300;
  var ZOOM_STEP = 25;
  var ZOOM_DEFAULT = 100;
  var _zoom = React.useState(ZOOM_DEFAULT);
  var zoomLevel = _zoom[0];
  var setZoomLevel = _zoom[1];
  // Match ui-lightbox.js mobile breakpoint so document preview header adapts with resize/rotate.
  var _mobile = React.useState(function() {
    return typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(max-width: 1023px)").matches;
  });
  var isMobile = _mobile[0];
  var setIsMobile = _mobile[1];

  React.useEffect(function() {
    setZoomLevel(ZOOM_DEFAULT);
  }, [safeIndex, current && current.url]);

  React.useEffect(function() {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    var mq = window.matchMedia("(max-width: 1023px)");
    var onChange = function() { setIsMobile(mq.matches); };
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
    return function() {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);

  React.useEffect(function() {
    var onKey = function(e) {
      if (e.key === "Escape" && onClose) onClose();
      if (e.key === "ArrowLeft" && typeof onNavigate === "function" && safeIndex > 0) onNavigate(safeIndex - 1);
      if (e.key === "ArrowRight" && typeof onNavigate === "function" && safeIndex < list.length - 1) onNavigate(safeIndex + 1);
      if (e.key === "+" || e.key === "=") {
        setZoomLevel(function(prev) { return Math.min(ZOOM_MAX, prev + ZOOM_STEP); });
      }
      if (e.key === "-" || e.key === "_") {
        setZoomLevel(function(prev) { return Math.max(ZOOM_MIN, prev - ZOOM_STEP); });
      }
      if (e.key === "0") setZoomLevel(ZOOM_DEFAULT);
    };
    window.addEventListener("keydown", onKey);
    return function() { window.removeEventListener("keydown", onKey); };
  }, [onClose, onNavigate, safeIndex, list.length]);

  var pdfForPreview = current ? isPdfAttachment(current) : false;
  var preview = usePdfPreviewUrl(current && current.url, !!pdfForPreview);
  var filePreview = useFilePreviewModel(current, !pdfForPreview, LIGHTBOX_FETCH_MAX_BYTES);

  if (!current) return null;
  var typeLabel = getChatFileTypeLabel(current);
  var sizeLabel = formatChatFileSize(current.size);
  var pdf = isPdfAttachment(current);
  var scale = zoomLevel / 100;
  var previewSrc = preview.url || (pdf ? current.url : null);
  var fileKind = filePreview.kind;
  var directMedia = fileKind === "image" || fileKind === "video" || fileKind === "audio";
  var extractedShown = filePreview.eligible && filePreview.status !== "error" && filePreview.status !== "empty";
  var richPreview = !pdf && (directMedia || extractedShown);
  var zoomable = pdf || fileKind === "image" || (richPreview && !directMedia);

  var handleZoomIn = function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setZoomLevel(function(prev) { return Math.min(ZOOM_MAX, prev + ZOOM_STEP); });
  };
  var handleZoomOut = function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setZoomLevel(function(prev) { return Math.max(ZOOM_MIN, prev - ZOOM_STEP); });
  };
  var handleZoomReset = function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setZoomLevel(ZOOM_DEFAULT);
  };

  var ModalBox = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || "div";

  return React.createElement("div", {
    role: "dialog", "aria-modal": "true", "aria-label": "파일 미리보기", onClick: onClose,
    style: {
      position: "fixed", inset: 0, zIndex: 12000, backgroundColor: "rgba(15, 23, 42, 0.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: isMobile ? "0" : "16px",
      height: "100dvh", maxHeight: "100dvh", boxSizing: "border-box", overflow: "hidden"
    }
  },
    React.createElement(ModalBox, {
      className: "modal-container document-lightbox-modal",
      onClick: function(e) { e.stopPropagation(); },
      style: {
        width: isMobile ? "100%" : "min(1100px, 96vw)",
        height: isMobile ? "100dvh" : "min(860px, 86vh)",
        maxHeight: isMobile ? "100dvh" : "92vh",
        backgroundColor: "var(--bg-card)",
        borderRadius: isMobile ? "0" : "16px", border: "1px solid var(--border-subtle)", display: "flex",
        flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        boxSizing: "border-box"
      }
    },
      React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: isMobile ? "10px" : "12px",
          padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0
        }
      },
        // Mirror FileAttachmentCard: type icon + filename + type·size meta.
        React.createElement("div", {
          style: {
            display: "flex", alignItems: "center", gap: "10px",
            minWidth: 0, flex: isMobile ? "0 0 auto" : 1
          }
        },
          React.createElement(FileTypeBadge, { label: typeLabel, attachment: current }),
          React.createElement("div", {
            style: { minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "2px" }
          },
            React.createElement("div", {
              style: {
                fontWeight: 900, fontSize: "var(--font-size-base)", color: "var(--text-main)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }
            }, current.name || "파일"),
            React.createElement("div", {
              style: { fontSize: "var(--font-size-sm)", color: "var(--text-muted)", fontWeight: 600 }
            }, [typeLabel, sizeLabel].filter(Boolean).join(" · "))
          )
        ),
        React.createElement("div", {
          style: {
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: isMobile ? "8px" : "12px",
            flexShrink: 1, flexWrap: "nowrap", minWidth: 0,
            width: isMobile ? "100%" : "auto",
            overflow: "hidden"
          }
        },
          // Left cluster: zoom + download. Close stays alone on the far right.
          React.createElement("div", {
            style: {
              display: "flex", alignItems: "center", gap: isMobile ? "4px" : "6px",
              flexShrink: 1, minWidth: 0, overflow: "hidden"
            }
          },
            zoomable ? React.createElement(DocZoomControls, {
              zoomLevel: zoomLevel,
              zoomMin: ZOOM_MIN,
              zoomMax: ZOOM_MAX,
              zoomDefault: ZOOM_DEFAULT,
              onZoomIn: handleZoomIn,
              onZoomOut: handleZoomOut,
              onZoomReset: handleZoomReset
            }) : null,
            React.createElement("a", {
              href: current.url, target: "_blank", rel: "noopener noreferrer",
              download: current.name || undefined,
              style: {
                height: "32px", padding: isMobile ? "0 8px" : "0 10px", borderRadius: "8px",
                border: "1px solid #000", background: "#000",
                color: "#fff", display: "inline-flex", alignItems: "center",
                fontWeight: 800, fontSize: "var(--font-size-sm)", textDecoration: "none",
                flexShrink: 0, whiteSpace: "nowrap", lineHeight: 1
              }
            }, "다운로드")
          ),
          React.createElement("button", {
            type: "button", onClick: onClose, "aria-label": "닫기",
            style: {
              width: "32px", height: "32px", minWidth: "32px", borderRadius: "8px",
              border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
              color: "var(--text-main)", cursor: "pointer", fontWeight: 900,
              flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1, padding: 0, marginLeft: "auto"
            }
          }, "×")
        )
      ),
      React.createElement("div", {
        style: {
          flex: "1 1 auto", minHeight: 0, overflow: "hidden", background: "var(--bg-primary)",
          display: "flex", alignItems: "stretch", justifyContent: "center", padding: (pdf || richPreview) ? "0" : "16px"
        }
      },
        richPreview
          ? React.createElement(FileLightboxBody, { current: current, kind: fileKind, preview: filePreview, scale: scale })
          : pdf
          ? React.createElement("div", {
              style: {
                width: "100%", height: "100%", minHeight: 0, overflow: "hidden",
                background: "#fff", position: "relative", display: "flex", flexDirection: "column"
              }
            },
              preview.status === "loading" || preview.status === "idle"
                ? React.createElement("div", {
                    style: {
                      minHeight: isMobile ? "0" : "240px", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "var(--text-muted)", fontWeight: 700
                    }
                  }, "PDF 불러오는 중...")
                : null,
              preview.status === "error"
                ? React.createElement("div", {
                    style: {
                      minHeight: isMobile ? "0" : "240px", margin: "auto", display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: "12px",
                      textAlign: "center", padding: "16px", color: "var(--text-main)"
                    }
                  },
                    React.createElement(FileTypeBadge, { label: typeLabel, attachment: current }),
                    React.createElement("div", { style: { fontWeight: 800 } }, "이 브라우저에서는 PDF 미리보기를 열 수 없습니다."),
                    React.createElement("div", {
                      style: { color: "var(--text-muted)", fontSize: "var(--font-size-md)", fontWeight: 600, overflowWrap: "anywhere" }
                    }, current.name || ""),
                    React.createElement("a", {
                      href: current.url, target: "_blank", rel: "noopener noreferrer",
                      style: {
                        height: "40px", padding: "0 16px", borderRadius: "12px", background: "#57606F",
                        color: "#fff", display: "inline-flex", alignItems: "center", fontWeight: 900,
                        textDecoration: "none"
                      }
                    }, "새 탭에서 열기")
                  )
                : (preview.status === "ready" || preview.status === "remote")
                ? React.createElement("div", {
                    style: {
                      transform: "scale(" + scale + ")",
                      transformOrigin: "top left",
                      width: (100 / scale) + "%",
                      height: (100 / scale) + "%",
                      minHeight: 0
                    }
                  },
                    // Mobile WebKit is unreliable with nested object/embed PDF viewers. A
                    // same-origin blob iframe avoids the external Storage navigation/error path.
                    isMobile ? React.createElement("iframe", {
                      title: current.name || "PDF",
                      src: previewSrc,
                      style: {
                        width: "100%", minHeight: 0, height: "100%",
                        border: "none", background: "#fff", display: "block"
                      }
                    }) : React.createElement("object", {
                      data: previewSrc,
                      type: "application/pdf",
                      title: current.name || "PDF",
                      style: {
                        width: "100%",
                        minHeight: 0,
                        height: "100%",
                        border: "none",
                        background: "#fff",
                        display: "block"
                      }
                    },
                      React.createElement("embed", {
                        src: previewSrc,
                        type: "application/pdf",
                        title: current.name || "PDF",
                        style: {
                          width: "100%",
                          minHeight: 0,
                          height: "100%",
                          border: "none",
                          background: "#fff",
                          display: "block"
                        }
                      }),
                      React.createElement("iframe", {
                        title: current.name || "PDF",
                        src: previewSrc,
                        style: {
                          width: "100%",
                          minHeight: 0,
                          height: "100%",
                          border: "none",
                          background: "#fff",
                          display: "block"
                        }
                      }),
                      React.createElement("div", {
                        style: {
                          padding: "16px", display: "flex", flexDirection: "column",
                          alignItems: "center", gap: "12px", textAlign: "center"
                        }
                      },
                        React.createElement(FileTypeBadge, { label: typeLabel, attachment: current }),
                        React.createElement("div", { style: { fontWeight: 800 } }, "이 기기에서 PDF 미리보기를 지원하지 않습니다."),
                        React.createElement("a", {
                          href: current.url, target: "_blank", rel: "noopener noreferrer",
                          style: {
                            height: "40px", padding: "0 16px", borderRadius: "12px", background: "#57606F",
                            color: "#fff", display: "inline-flex", alignItems: "center", fontWeight: 900,
                            textDecoration: "none"
                          }
                        }, "열기")
                      )
                    )
                  )
                : null
            )
          : React.createElement("div", {
              style: {
                margin: "auto", display: "flex", flexDirection: "column", alignItems: "center",
                gap: "12px", textAlign: "center", maxWidth: "420px", color: "var(--text-main)"
              }
            },
              React.createElement(FileTypeBadge, { label: typeLabel, attachment: current }),
              React.createElement("div", { style: { fontWeight: 800 } }, filePreview.status === "error"
                ? "미리보기를 불러오지 못했어요."
                : "이 형식은 앱 안에서 미리보기를 지원하지 않아요."),
              React.createElement("div", {
                style: { color: "var(--text-muted)", fontSize: "var(--font-size-md)", fontWeight: 600 }
              }, fileKind === "none"
                ? "예전 Office 형식(doc/xls/ppt)과 한글(hwp)은 다운로드하거나 새 탭에서 열어 주세요."
                : "다운로드하거나 새 탭에서 열어 주세요."),
              React.createElement("a", {
                href: current.url, target: "_blank", rel: "noopener noreferrer",
                style: {
                  height: "40px", padding: "0 16px", borderRadius: "12px", background: "#57606F",
                  color: "#fff", display: "inline-flex", alignItems: "center", fontWeight: 900,
                  textDecoration: "none"
                }
              }, "새 탭에서 열기")
            )
      ),
      React.createElement("div", {
        style: {
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
          padding: "10px 14px", borderTop: "1px solid var(--border-subtle)",
          flexShrink: 0
        }
      },
        React.createElement("button", {
          type: "button",
          disabled: !(typeof onNavigate === "function" && safeIndex > 0),
          onClick: function() { if (onNavigate) onNavigate(safeIndex - 1); },
          style: {
            height: "36px", padding: "0 12px", borderRadius: "10px",
            border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
            opacity: (typeof onNavigate === "function" && safeIndex > 0) ? 1 : 0.4,
            cursor: (typeof onNavigate === "function" && safeIndex > 0) ? "pointer" : "default",
            fontWeight: 800
          }
        }, "이전 파일"),
        React.createElement("span", {
          style: { color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--font-size-sm)" }
        }, list.length > 1 ? ((safeIndex + 1) + " / " + list.length) : (pdf ? "PDF 미리보기" : (richPreview ? "미리보기" : " "))),
        React.createElement("button", {
          type: "button",
          disabled: !(typeof onNavigate === "function" && safeIndex < list.length - 1),
          onClick: function() { if (onNavigate) onNavigate(safeIndex + 1); },
          style: {
            height: "36px", padding: "0 12px", borderRadius: "10px",
            border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
            opacity: (typeof onNavigate === "function" && safeIndex < list.length - 1) ? 1 : 0.4,
            cursor: (typeof onNavigate === "function" && safeIndex < list.length - 1) ? "pointer" : "default",
            fontWeight: 800
          }
        }, "다음 파일")
      )
    )
  );
}

function ChatFileAttachmentList(props) {
  var React = window.React;
  var list = props.list;
  var onOpenAttachment = props.onOpenAttachment;
  // Places without their own document viewer (home chat, memo cards, date popup) still open
  // the file: the list hosts a lightbox of its own, portaled so no transformed ancestor clips it.
  var _open = React.useState(null);
  var openIndex = _open[0];
  var setOpenIndex = _open[1];
  var ReactDOM = window.ReactDOM;
  var ownLightbox = openIndex != null
    ? React.createElement(DocumentLightbox, {
        attachments: list, index: openIndex,
        onClose: function() { setOpenIndex(null); },
        onNavigate: function(i) { setOpenIndex(i); }
      })
    : null;
  return React.createElement("div", {
    className: "chat-file-attachment-list",
    style: { display: "flex", flexDirection: "column", gap: "6px", width: "100%" }
  }, list.map(function(attachment, idx) {
    return React.createElement(FileAttachmentCard, {
      key: attachment.id || (attachment.url + "-" + idx),
      attachment: attachment,
      onOpen: function() {
        if (typeof onOpenAttachment === "function") onOpenAttachment(list, idx);
        else setOpenIndex(idx);
      }
    });
  }), ownLightbox && ReactDOM && typeof ReactDOM.createPortal === "function" && typeof document !== "undefined"
    ? ReactDOM.createPortal(ownLightbox, document.body)
    : ownLightbox);
}

export function renderChatFileAttachments(attachments, onOpenAttachment) {
  var React = window.React;
  var list = Array.isArray(attachments) ? attachments.filter(function(a) { return a && a.url; }) : [];
  if (list.length === 0) return null;
  return React.createElement(ChatFileAttachmentList, { list: list, onOpenAttachment: onOpenAttachment });
}

if (typeof window !== "undefined") {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    FileAttachmentCard: FileAttachmentCard,
    DocumentLightbox: DocumentLightbox,
    renderChatFileAttachments: renderChatFileAttachments
  });
}
