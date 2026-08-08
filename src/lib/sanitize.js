import DOMPurify from "dompurify";

// Engineering notes are stored as raw HTML from the rich text editor and rendered
// with dangerouslySetInnerHTML. Anyone who can write a note could otherwise plant
// script that runs in a manager's or the owner's browser — where the JWT lives in
// localStorage. Allow only what the editor's toolbar can actually produce.
const ALLOWED_TAGS = [
  "p",
  "br",
  "div",
  "span",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "h1",
  "h2",
  "ul",
  "ol",
  "li",
  "blockquote",
];

export function sanitizeHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [], // no href/src/style/on* — the toolbar emits none of them
  });
}
