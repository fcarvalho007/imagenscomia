// Shared rich-text pipeline. The same module runs in the browser editor, in the
// preview and in the delivery worker, so what is previewed is exactly what is sent.
import { Parser } from "npm:htmlparser2@10.0.0";

export type BodyFormat = "text" | "html";

export const RICH_TAGS = ["p", "br", "strong", "em", "u", "ul", "ol", "li", "a", "h2", "h3", "blockquote"] as const;
const ALLOWED = new Set<string>(RICH_TAGS);
const RENAME: Record<string, string> = { b: "strong", i: "em", div: "p" };
const VOID = new Set(["br"]);
const SKIP_CONTENT = new Set(["script", "style", "iframe", "object", "embed", "template", "noscript", "svg", "math"]);

export const escapeHTML = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function safeHref(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "mailto:") return null;
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

/** Parses with htmlparser2 and re-serialises only an explicit allow list. */
export function sanitizeCourseHTML(input: string): string {
  const out: string[] = [];
  const open: (string | null)[] = [];
  let skipDepth = 0;
  const parser = new Parser(
    {
      onopentag(rawName, attributes) {
        const name = rawName.toLowerCase();
        if (SKIP_CONTENT.has(name)) {
          skipDepth++;
          open.push(null);
          return;
        }
        if (skipDepth > 0) {
          open.push(null);
          return;
        }
        const tag = RENAME[name] || name;
        if (!ALLOWED.has(tag)) {
          open.push(null);
          return;
        }
        if (tag === "br") {
          out.push("<br>");
          open.push(null);
          return;
        }
        if (tag === "a") {
          const href = safeHref(String(attributes.href ?? ""));
          if (!href) {
            open.push(null);
            return;
          }
          out.push(`<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">`);
          open.push("a");
          return;
        }
        out.push(`<${tag}>`);
        open.push(tag);
      },
      ontext(text) {
        if (skipDepth > 0) return;
        out.push(escapeHTML(text));
      },
      onclosetag(rawName) {
        const name = rawName.toLowerCase();
        const tag = open.pop();
        if (SKIP_CONTENT.has(name) && skipDepth > 0) skipDepth--;
        if (tag) out.push(`</${tag}>`);
      },
    },
    { decodeEntities: true, lowerCaseTags: true, lowerCaseAttributeNames: true, recognizeSelfClosing: true },
  );
  parser.write(input);
  parser.end();
  while (open.length) {
    const tag = open.pop();
    if (tag) out.push(`</${tag}>`);
  }
  return out.join("").replace(/<p>\s*<\/p>/g, "").trim();
}

/** Plain-text alternative built from the already sanitised markup. */
export function htmlToPlainText(html: string): string {
  const parts: string[] = [];
  const parser = new Parser({
    ontext(text) {
      parts.push(text);
    },
    onopentag(name) {
      if (name === "br" || name === "li") parts.push("\n");
    },
    onclosetag(name) {
      if (["p", "h2", "h3", "ul", "ol", "blockquote"].includes(name)) parts.push("\n\n");
    },
  });
  parser.write(html);
  parser.end();
  return parts
    .join("")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeFormat(value: unknown): BodyFormat {
  return value === "html" ? "html" : "text";
}

/**
 * Renders a stored body. Legacy content has format "text" and is never
 * interpreted as markup, so previously saved messages keep their exact wording.
 */
export function renderCourseBody(body: string, format: BodyFormat): { html: string; text: string } {
  if (format !== "html") {
    const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    return {
      html: paragraphs.map((p) => `<p>${escapeHTML(p).replace(/\n/g, "<br>")}</p>`).join(""),
      text: body.trim(),
    };
  }
  const html = sanitizeCourseHTML(body);
  return { html, text: htmlToPlainText(html) };
}

/** Only {{nome}} is supported. The value is escaped for the HTML variant. */
export function personalize(value: string, name: string, asHtml: boolean): string {
  const first = (name || "").trim().split(/\s+/)[0] || "";
  return value.replace(/\{\{\s*nome\s*\}\}/g, asHtml ? escapeHTML(first) : first);
}

export function wrapCourseEmail(title: string, innerHTML: string, footer: string): string {
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f2f5f7;color:#102c3d;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#fff"><tr><td style="padding:30px 32px;background:#09212f;color:#fff;font-size:20px;font-weight:bold">Frederico Carvalho</td></tr><tr><td style="padding:32px;font-size:17px;line-height:1.65"><h1 style="font-size:27px;line-height:1.2;margin:0 0 24px">${escapeHTML(title)}</h1>${innerHTML}</td></tr><tr><td style="padding:24px 32px;background:#eaf1f5;font-size:14px;line-height:1.6">${escapeHTML(footer)}<br>Precisa de ajuda? Responda a este email ou ligue <a style="color:#124c67" href="tel:+351915015508">915 015 508</a>.</td></tr></table></td></tr></table></body></html>`;
}
