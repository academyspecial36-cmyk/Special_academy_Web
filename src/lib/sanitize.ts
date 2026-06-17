/**
 * Sanitize HTML to prevent XSS in email bodies and user-generated content.
 * This is a lightweight server-side sanitizer that works without DOMPurify.
 * For production, replace with DOMPurify (isomorphic-dompurify).
 */

const ALLOWED_TAGS = new Set([
  "a", "b", "i", "em", "strong", "u", "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "span", "img", "figure", "figcaption",
]);

const ALLOWED_ATTRS = new Set([
  "href", "target", "rel", "src", "alt", "width", "height",
  "style", "class", "id", "align",
]);

const URI_ATTRS = new Set(["href", "src"]);

function isSafeUri(value: string): boolean {
  const lower = value.toLowerCase().trim();
  return (
    lower.startsWith("https://") ||
    lower.startsWith("http://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("/") ||
    lower.startsWith("#") ||
    lower.startsWith("data:image/")
  );
}

export function sanitizeHtml(html: string): string {
  const tagRe = /<(\/?)(\w+)([^>]*)>/g;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRe.exec(html)) !== null) {
    result += html.slice(lastIndex, match.index);

    const isClosing = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const attrsStr = match[3];

    if (!ALLOWED_TAGS.has(tagName)) {
      result += `&lt;${isClosing ? "/" : ""}${tagName}${attrsStr}&gt;`;
      lastIndex = tagRe.lastIndex;
      continue;
    }

    if (isClosing) {
      result += `</${tagName}>`;
    } else {
      const safeAttrs: string[] = [];
      const attrRe = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
      let attrMatch: RegExpExecArray | null;
      while ((attrMatch = attrRe.exec(attrsStr)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || "";
        if (!ALLOWED_ATTRS.has(attrName)) continue;
        if (URI_ATTRS.has(attrName) && !isSafeUri(attrValue)) continue;
        if (attrName === "href" && tagName !== "a") continue;
        if (attrName === "src" && tagName !== "img") continue;
        safeAttrs.push(`${attrName}="${attrValue.replace(/"/g, "&quot;")}"`);
      }
      const attrs = safeAttrs.length > 0 ? " " + safeAttrs.join(" ") : "";
      result += `<${tagName}${attrs}>`;
    }

    lastIndex = tagRe.lastIndex;
  }

  result += html.slice(lastIndex);
  return result;
}
