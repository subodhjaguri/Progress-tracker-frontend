import React, { useRef, useEffect, useState, useCallback } from "react";
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

// Formatting state is read off the DOM ancestors of the caret — NOT from
// document.queryCommandState, which reports bold=true inside an <h1>/<h2>
// simply because headings render bold (that made the Bold button switch itself
// on, and its "off" click had no <b> to toggle).
const TAG_STATE = {
  B: "bold",
  STRONG: "bold",
  I: "italic",
  EM: "italic",
  U: "underline",
  H1: "h1",
  H2: "h2",
  BLOCKQUOTE: "blockquote",
  UL: "ul",
  OL: "ol",
};

const NO_FORMATTING = {
  bold: false,
  italic: false,
  underline: false,
  h1: false,
  h2: false,
  blockquote: false,
  ul: false,
  ol: false,
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write detailed site description or technical specifications…",
}) {
  const editorRef = useRef(null);
  const isFocusedRef = useRef(false);
  const savedRangeRef = useRef(null);
  const [active, setActive] = useState(NO_FORMATTING);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    try {
      // Paragraphs (not <div>) on Enter, and tag-based markup (<b>, not
      // style="font-weight:bold") so the ancestor walk above can see it.
      document.execCommand("defaultParagraphSeparator", false, "p");
      document.execCommand("styleWithCSS", false, false);
    } catch {
      // Older browsers: the editing commands below still work.
    }
  }, []);

  /** The current selection, but only when it actually sits inside this editor. */
  const selectionInEditor = useCallback(() => {
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return null;
    const range = sel.getRangeAt(0);
    return editorRef.current.contains(range.commonAncestorContainer) ? range : null;
  }, []);

  const saveSelection = useCallback(() => {
    const range = selectionInEditor();
    if (range) savedRangeRef.current = range.cloneRange();
  }, [selectionInEditor]);

  /**
   * Focus the editor for a toolbar command without losing the user's place.
   * A bare .focus() on an unfocused contentEditable drops the caret at offset 0,
   * so commands and typing landed at the top of the note (and inherited whatever
   * formatting lived there). Restore the last caret instead, or fall back to the
   * end of the content.
   */
  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const keepsCaret = document.activeElement === editor && selectionInEditor();
    editor.focus();
    if (keepsCaret) return;

    const sel = document.getSelection();
    const range = document.createRange();
    const saved = savedRangeRef.current;
    if (saved && editor.contains(saved.commonAncestorContainer)) {
      range.setStart(saved.startContainer, saved.startOffset);
      range.setEnd(saved.endContainer, saved.endOffset);
    } else {
      range.selectNodeContents(editor);
      range.collapse(false); // end of content, not the start
    }
    sel.removeAllRanges();
    sel.addRange(range);
  }, [selectionInEditor]);

  const refreshActiveState = useCallback(() => {
    const range = selectionInEditor();
    if (!range) return;
    const next = { ...NO_FORMATTING };
    let node =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : range.startContainer;
    while (node && node !== editorRef.current) {
      const key = TAG_STATE[node.tagName];
      if (key) next[key] = true;
      node = node.parentElement;
    }
    setActive(next);
  }, [selectionInEditor]);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Browsers leave scaffolding behind once the last character is deleted
    // (<br>, <p><br></p>, <h1><br></h1>…). Report that as empty so the
    // placeholder and the form's required-content check agree — but never
    // rewrite the DOM, or an empty block the user just created with the
    // toolbar would be destroyed before they can type into it.
    const blank = editor.textContent === "" && !editor.querySelector("img");
    setIsEmpty(blank);
    saveSelection();
    onChange(blank ? "" : editor.innerHTML);
  }, [onChange, saveSelection]);

  // Push external value in only while the user isn't typing.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isFocusedRef.current) return;
    const incoming = value || "";
    if (editor.innerHTML !== incoming) editor.innerHTML = incoming;
    setIsEmpty(editor.textContent === "" && !editor.querySelector("img"));
  }, [value]);

  const applyInline = (command, stateKey) => {
    restoreSelection();
    const collapsed = document.getSelection()?.isCollapsed;
    document.execCommand(command, false, null);
    emitChange();
    // With a collapsed caret the command only arms a typing style — there's no
    // element to read yet, so reflect the toggle optimistically until the next
    // keystroke lets refreshActiveState() read it off the DOM.
    if (collapsed) setActive((prev) => ({ ...prev, [stateKey]: !prev[stateKey] }));
    else refreshActiveState();
  };

  const applyBlock = (tag) => {
    restoreSelection();
    document.execCommand("formatBlock", false, tag);
    emitChange();
    refreshActiveState();
  };

  const applyList = (command) => {
    restoreSelection();
    document.execCommand(command, false, null);
    emitChange();
    refreshActiveState();
  };

  const clearFormatting = () => {
    restoreSelection();
    document.execCommand("removeFormat", false, null);
    document.execCommand("formatBlock", false, "<p>");
    emitChange();
    refreshActiveState();
  };

  const handleInput = () => {
    refreshActiveState();
    emitChange();
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    const range = selectionInEditor();
    if (!range) return;
    let node =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : range.startContainer;
    let inHeading = false;
    while (node && node !== editorRef.current) {
      if (node.tagName === "H1" || node.tagName === "H2" || node.tagName === "BLOCKQUOTE") {
        inHeading = true;
        break;
      }
      node = node.parentElement;
    }
    if (!inHeading) return;
    // Let the browser split the block first, then demote the new one so the
    // next line is body text rather than another heading.
    setTimeout(() => {
      document.execCommand("formatBlock", false, "<p>");
      emitChange();
      refreshActiveState();
    }, 0);
  };

  const handleSelectionChange = () => {
    saveSelection();
    refreshActiveState();
  };

  const btn = (key) => `toolbar-btn${active[key] ? " active" : ""}`;

  return (
    <div className="rich-editor-container">
      <div className="rich-editor-toolbar">
        <button
          type="button"
          className={btn("bold")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyInline("bold", "bold")}
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          className={btn("italic")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyInline("italic", "italic")}
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          className={btn("underline")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyInline("underline", "underline")}
          title="Underline"
        >
          <Underline size={15} />
        </button>
        <div className="rich-editor-divider" />
        <button
          type="button"
          className={btn("h1")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyBlock("<h1>")}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button
          type="button"
          className={btn("h2")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyBlock("<h2>")}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          className="toolbar-btn text"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyBlock("<p>")}
          title="Normal Paragraph"
        >
          Paragraph
        </button>
        <div className="rich-editor-divider" />
        <button
          type="button"
          className={btn("ul")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyList("insertUnorderedList")}
          title="Bullet List"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          className={btn("ol")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyList("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          className={btn("blockquote")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyBlock("<blockquote>")}
          title="Quote"
        >
          <Quote size={15} />
        </button>
        <div className="rich-editor-divider" />
        <button
          type="button"
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearFormatting}
          title="Clear Formatting"
        >
          <RemoveFormatting size={15} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        className={`rich-editor-content${isEmpty ? " is-empty" : ""}`}
        onFocus={() => {
          isFocusedRef.current = true;
          refreshActiveState();
        }}
        onBlur={() => {
          saveSelection();
          isFocusedRef.current = false;
          emitChange();
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={handleSelectionChange}
        onMouseUp={handleSelectionChange}
      />
    </div>
  );
}
