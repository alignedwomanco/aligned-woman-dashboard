// Lightweight HTML sanitizer for dangerouslySetInnerHTML sinks.
// Strips executable markup (script/style/iframe/object/embed/link/meta/base/
// form/svg/math), removes inline event handlers (on*), and neutralises
// javascript: URLs on href/src/xlink:href. Use this on any user- or
// admin-supplied HTML before rendering it with dangerouslySetInnerHTML.
const BLOCKED_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
  "svg",
  "math",
];

export function sanitizeHtml(dirty) {
  if (!dirty) return "";
  const doc = new DOMParser().parseFromString(String(dirty), "text/html");

  BLOCKED_TAGS.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });

  doc.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || "";
      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
      } else if (
        (name === "href" || name === "src" || name === "xlink:href") &&
        /^\s*javascript:/i.test(value)
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body ? doc.body.innerHTML : "";
}