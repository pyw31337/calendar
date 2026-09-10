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
      height: "32px", minWidth: "28px", padding: "0 6px", borderRadius: "8px",
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

export function FileAttachmentCard(props) {
  var React = window.React;
  var attachment = props && props.attachment;
  var onOpen = props && props.onOpen;
  var stretch = !!(props && props.stretch);
  var compact = !!(props && props.compact);
  var searchQuery = (props && props.searchQuery) || "";
  if (!attachment || !attachment.url) return null;
  var label = getChatFileTypeLabel(attachment);
  var sizeLabel = formatChatFileSize(attachment.size);
  return React.createElement("button", {
    type: "button",
    className: "chat-file-attachment-card",
    onClick: function(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (typeof onOpen === "function") onOpen(attachment);
    },
    title: attachment.name || "파일",
    style: {
      display: "flex", alignItems: "center", gap: "10px",
      width: stretch ? "100%" : "fit-content",
      maxWidth: stretch ? "100%" : "min(100%, 420px)",
      boxSizing: "border-box", textAlign: "left",
      border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
      backgroundColor: "var(--bg-card)", color: "inherit",
      padding: compact ? "8px 10px" : "10px 12px",
      cursor: "pointer", marginTop: compact ? 0 : "6px"
    }
  },
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

  if (!current) return null;
  var typeLabel = getChatFileTypeLabel(current);
  var sizeLabel = formatChatFileSize(current.size);
  var pdf = isPdfAttachment(current);
  var scale = zoomLevel / 100;
  var previewSrc = preview.url || (pdf ? current.url : null);

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

  return React.createElement("div", {
    role: "dialog", "aria-modal": "true", "aria-label": "파일 미리보기", onClick: onClose,
    style: {
      position: "fixed", inset: 0, zIndex: 12000, backgroundColor: "rgba(15, 23, 42, 0.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: isMobile ? "0" : "16px",
      height: "100dvh", maxHeight: "100dvh", boxSizing: "border-box", overflow: "hidden"
    }
  },
    React.createElement("div", {
      onClick: function(e) { e.stopPropagation(); },
      style: {
        width: isMobile ? "100%" : "min(1100px, 96vw)",
        height: isMobile ? "100dvh" : "auto",
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
            pdf ? React.createElement(DocZoomControls, {
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
          display: "flex", alignItems: "stretch", justifyContent: "center", padding: pdf ? "0" : "16px"
        }
      },
        pdf
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
              React.createElement("div", { style: { fontWeight: 800 } }, "이 형식은 앱 내 페이지 미리보기를 지원하지 않습니다."),
              React.createElement("div", {
                style: { color: "var(--text-muted)", fontSize: "var(--font-size-md)", fontWeight: 600 }
              }, "Office 문서(doc/docx/ppt/pptx/xls/xlsx)와 텍스트는 다운로드 또는 새 탭에서 열어 주세요."),
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
        }, list.length > 1 ? ((safeIndex + 1) + " / " + list.length) : (pdf ? "PDF 미리보기" : " ")),
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

export function renderChatFileAttachments(attachments, onOpenAttachment) {
  var React = window.React;
  var list = Array.isArray(attachments) ? attachments.filter(function(a) { return a && a.url; }) : [];
  if (list.length === 0) return null;
  return React.createElement("div", {
    style: { display: "flex", flexDirection: "column", gap: "6px", width: "100%" }
  }, list.map(function(attachment, idx) {
    return React.createElement(FileAttachmentCard, {
      key: attachment.id || (attachment.url + "-" + idx),
      attachment: attachment,
      onOpen: function() { if (onOpenAttachment) onOpenAttachment(list, idx); }
    });
  }));
}

if (typeof window !== "undefined") {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    FileAttachmentCard: FileAttachmentCard,
    DocumentLightbox: DocumentLightbox,
    renderChatFileAttachments: renderChatFileAttachments
  });
}
