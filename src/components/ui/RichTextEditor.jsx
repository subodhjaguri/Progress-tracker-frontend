import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="rich-editor-container" style={{ border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#ffffff" }}>
      <div className="rich-editor-toolbar" style={{ display: "flex", gap: "4px", padding: "6px 8px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
        <button type="button" className="toolbar-btn" onClick={() => exec("bold")} title="Bold">
          <Bold size={15} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => exec("italic")} title="Italic">
          <Italic size={15} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => exec("underline")} title="Underline">
          <Underline size={15} />
        </button>
        <div style={{ width: "1px", background: "#cbd5e1", margin: "0 4px" }} />
        <button type="button" className="toolbar-btn" onClick={() => exec("formatBlock", "<h1>")} title="Heading 1">
          <Heading1 size={15} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => exec("formatBlock", "<h2>")} title="Heading 2">
          <Heading2 size={15} />
        </button>
        <div style={{ width: "1px", background: "#cbd5e1", margin: "0 4px" }} />
        <button type="button" className="toolbar-btn" onClick={() => exec("insertUnorderedList")} title="Bullet List">
          <List size={15} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => exec("insertOrderedList")} title="Numbered List">
          <ListOrdered size={15} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => exec("formatBlock", "<blockquote>")} title="Quote">
          <Quote size={15} />
        </button>
        <div style={{ width: "1px", background: "#cbd5e1", margin: "0 4px" }} />
        <button type="button" className="toolbar-btn" onClick={() => exec("removeFormat")} title="Clear Formatting">
          <RemoveFormatting size={15} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
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
