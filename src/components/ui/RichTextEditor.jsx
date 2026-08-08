import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
} from "lucide-react";

export function RichTextEditor({ value, onChange, placeholder = "Write detailed site description or technical specifications…" }) {
  const editorRef = useRef(null);
  const isFocusedRef = useRef(false);
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch (e) {
      // ignore
    }
  }, []);

  const checkStates = () => {
    if (!editorRef.current) return;
    try {
      const isBold = document.queryCommandState("bold");
      const isItalic = document.queryCommandState("italic");
      const isUnderline = document.queryCommandState("underline");
      setActiveStates({
        bold: !!isBold,
        italic: !!isItalic,
        underline: !!isUnderline,
      });
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (editorRef.current && !isFocusedRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const exec = (command, val = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === "bold" && activeStates.bold) {
      document.execCommand("bold", false, null);
      document.execCommand("removeFormat", false, null);
      setActiveStates((prev) => ({ ...prev, bold: false }));
    } else {
      document.execCommand(command, false, val);
      checkStates();
    }
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) {
      checkStates();
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const sel = document.getSelection();
      if (sel && sel.anchorNode) {
        let parent = sel.anchorNode.parentElement;
        while (parent && parent !== editorRef.current) {
          const tag = parent.tagName.toUpperCase();
          if (tag === "H1" || tag === "H2" || tag === "BLOCKQUOTE") {
            setTimeout(() => {
              document.execCommand("formatBlock", false, "<p>");
              checkStates();
              if (editorRef.current) onChange(editorRef.current.innerHTML);
            }, 0);
            break;
          }
          parent = parent.parentElement;
        }
      }
    }
  };

  return (
    <div className="rich-editor-container" style={{ border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#ffffff" }}>
      <div className="rich-editor-toolbar" style={{ display: "flex", gap: "4px", padding: "6px 8px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`toolbar-btn ${activeStates.bold ? "active" : ""}`}
          style={activeStates.bold ? { background: "#cbd5e1", fontWeight: "bold" } : {}}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${activeStates.italic ? "active" : ""}`}
          style={activeStates.italic ? { background: "#cbd5e1" } : {}}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${activeStates.underline ? "active" : ""}`}
          style={activeStates.underline ? { background: "#cbd5e1" } : {}}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
          title="Underline"
        >
          <Underline size={15} />
        </button>
        <div style={{ width: "1px", background: "#cbd5e1", margin: "0 4px" }} />
        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<h1>")}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<h2>")}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<p>")}
          title="Normal Paragraph"
          style={{ fontSize: "11px", padding: "2px 6px", height: "26px" }}
        >
          Paragraph
        </button>
        <div style={{ width: "1px", background: "#cbd5e1", margin: "0 4px" }} />
        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<blockquote>")}
          title="Quote"
        >
          <Quote size={15} />
        </button>
        <div style={{ width: "1px", background: "#cbd5e1", margin: "0 4px" }} />
        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("removeFormat")}
          title="Clear Formatting"
        >
          <RemoveFormatting size={15} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onFocus={() => {
          isFocusedRef.current = true;
          checkStates();
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          handleInput();
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={checkStates}
        onMouseUp={checkStates}
        placeholder={placeholder}
        className="rich-editor-content"
        style={{
          minHeight: "150px",
          padding: "12px",
          outline: "none",
          fontSize: "0.925rem",
          lineHeight: 1.6,
          color: "#1e293b",
        }}
      />
    </div>
  );
}
