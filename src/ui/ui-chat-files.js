/**
 * Chat file attachment card + document lightbox.
 * PDF: browser iframe/object viewer. Office/text: download / open-in-new-tab.
 */

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

function FileTypeBadge(props) {
  var React = window.React;
  var label = props && props.label;
  return React.createElement("div", {
    style: {
      width: "48px", height: "48px", borderRadius: "10px",
      backgroundColor: "color-mix(in srgb, var(--primary) 12%, var(--bg-secondary))",
      color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.02em", flexShrink: 0
    }
  }, label || "FILE");
}

export function FileAttachmentCard(props) {
  var React = window.React;
  var attachment = props && props.attachment;
  var onOpen = props && props.onOpen;
  var stretch = !!(props && props.stretch);
  var compact = !!(props && props.compact);
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
      maxWidth: stretch ? "100%" : "min(100%, 280px)",
      boxSizing: "border-box", textAlign: "left",
      border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
      backgroundColor: "var(--bg-card)", color: "inherit",
      padding: compact ? "8px 10px" : "10px 12px",
      cursor: "pointer", marginTop: compact ? 0 : "6px"
    }
  },
    React.createElement(FileTypeBadge, { label: label }),
    React.createElement("div", { style: { minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "2px" } },
      React.createElement("div", {
        style: {
          fontSize: "var(--font-size-md)", fontWeight: 800, color: "var(--text-main)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
        }
      }, attachment.name || "파일"),
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

  React.useEffect(function() {
    var onKey = function(e) {
      if (e.key === "Escape" && onClose) onClose();
      if (e.key === "ArrowLeft" && typeof onNavigate === "function" && safeIndex > 0) onNavigate(safeIndex - 1);
      if (e.key === "ArrowRight" && typeof onNavigate === "function" && safeIndex < list.length - 1) onNavigate(safeIndex + 1);
    };
    window.addEventListener("keydown", onKey);
    return function() { window.removeEventListener("keydown", onKey); };
  }, [onClose, onNavigate, safeIndex, list.length]);

  if (!current) return null;
  var typeLabel = getChatFileTypeLabel(current);
  var sizeLabel = formatChatFileSize(current.size);
  var pdf = isPdfAttachment(current);

  return React.createElement("div", {
    role: "dialog", "aria-modal": "true", "aria-label": "파일 미리보기", onClick: onClose,
    style: {
      position: "fixed", inset: 0, zIndex: 12000, backgroundColor: "rgba(15, 23, 42, 0.72)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
    }
  },
    React.createElement("div", {
      onClick: function(e) { e.stopPropagation(); },
      style: {
        width: "min(960px, 100%)", maxHeight: "92vh", backgroundColor: "var(--bg-card)",
        borderRadius: "16px", border: "1px solid var(--border-subtle)", display: "flex",
        flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.35)"
      }
    },
      React.createElement("div", {
        style: {
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)"
        }
      },
        React.createElement("div", { style: { minWidth: 0 } },
          React.createElement("div", {
            style: {
              fontWeight: 900, fontSize: "var(--font-size-base)", color: "var(--text-main)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }
          }, current.name || "파일"),
          React.createElement("div", {
            style: { fontSize: "var(--font-size-sm)", color: "var(--text-muted)", fontWeight: 600 }
          }, [typeLabel, sizeLabel].filter(Boolean).join(" · "))
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", flexShrink: 0 } },
          React.createElement("a", {
            href: current.url, target: "_blank", rel: "noopener noreferrer",
            download: current.name || undefined,
            style: {
              height: "36px", padding: "0 12px", borderRadius: "10px",
              border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
              color: "var(--text-main)", display: "inline-flex", alignItems: "center",
              fontWeight: 800, fontSize: "var(--font-size-md)", textDecoration: "none"
            }
          }, "다운로드"),
          React.createElement("button", {
            type: "button", onClick: onClose, "aria-label": "닫기",
            style: {
              width: "36px", height: "36px", borderRadius: "10px",
              border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
              color: "var(--text-main)", cursor: "pointer", fontWeight: 900
            }
          }, "×")
        )
      ),
      React.createElement("div", {
        style: {
          flex: 1, minHeight: "320px", overflow: "auto", background: "var(--bg-primary)",
          display: "flex", alignItems: "stretch", justifyContent: "center", padding: pdf ? "0" : "16px"
        }
      },
        pdf
          ? React.createElement("iframe", {
              title: current.name || "PDF",
              src: current.url,
              style: { width: "100%", minHeight: "70vh", border: "none", background: "#fff" }
            })
          : React.createElement("div", {
              style: {
                margin: "auto", display: "flex", flexDirection: "column", alignItems: "center",
                gap: "12px", textAlign: "center", maxWidth: "420px", color: "var(--text-main)"
              }
            },
              React.createElement(FileTypeBadge, { label: typeLabel }),
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
          padding: "10px 14px", borderTop: "1px solid var(--border-subtle)"
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
