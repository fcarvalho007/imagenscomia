import { describe, expect, it } from "vitest";
import {
  htmlToPlainText,
  normalizeFormat,
  personalize,
  renderCourseBody,
  safeHref,
  sanitizeCourseHTML,
} from "@shared/course/richtext";

describe("sanitizeCourseHTML", () => {
  it("keeps the short allow list", () => {
    const html = sanitizeCourseHTML("<p>Olá <strong>mundo</strong> e <em>mais</em></p><ul><li>um</li></ul>");
    expect(html).toBe("<p>Olá <strong>mundo</strong> e <em>mais</em></p><ul><li>um</li></ul>");
  });

  it("renames legacy tags", () => {
    expect(sanitizeCourseHTML("<div>a<b>b</b><i>c</i></div>")).toBe("<p>a<strong>b</strong><em>c</em></p>");
  });

  it("drops scripts and their content", () => {
    expect(sanitizeCourseHTML('<p>ok</p><script>alert("x")</script>')).toBe("<p>ok</p>");
    expect(sanitizeCourseHTML("<style>body{display:none}</style><p>ok</p>")).toBe("<p>ok</p>");
  });

  it("drops event handlers, styles and classes", () => {
    expect(sanitizeCourseHTML('<p onclick="steal()" style="color:red" class="x">texto</p>')).toBe("<p>texto</p>");
  });

  it("drops iframes and images", () => {
    expect(sanitizeCourseHTML('<p>a</p><iframe src="https://evil.test"></iframe><img src=x onerror=alert(1)>')).toBe("<p>a</p>");
  });

  it("escapes text so injected markup cannot re-enter", () => {
    expect(sanitizeCourseHTML("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>")).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  });

  it("only allows https and mailto links, with safe rel", () => {
    expect(sanitizeCourseHTML('<a href="https://exemplo.pt/a">ok</a>')).toContain('rel="noopener noreferrer"');
    expect(sanitizeCourseHTML('<a href="javascript:alert(1)">mau</a>')).toBe("mau");
    expect(sanitizeCourseHTML('<a href="http://exemplo.pt">mau</a>')).toBe("mau");
    expect(sanitizeCourseHTML('<a href="https://user:pass@exemplo.pt">mau</a>')).toBe("mau");
    expect(sanitizeCourseHTML('<a href="mailto:info@fredericocarvalho.pt">email</a>')).toContain("mailto:info@fredericocarvalho.pt");
  });

  it("closes unbalanced markup", () => {
    expect(sanitizeCourseHTML("<p>aberto")).toBe("<p>aberto</p>");
  });
});

describe("safeHref", () => {
  it("rejects anything outside https and mailto", () => {
    expect(safeHref("data:text/html,<script>")).toBeNull();
    expect(safeHref("  https://exemplo.pt  ")).toBe("https://exemplo.pt/");
  });
});

describe("renderCourseBody", () => {
  it("treats legacy text as text, never as markup", () => {
    const rendered = renderCourseBody("Olá <b>não</b>\n\nSegundo parágrafo", "text");
    expect(rendered.html).toBe("<p>Olá &lt;b&gt;não&lt;/b&gt;</p><p>Segundo parágrafo</p>");
    expect(rendered.text).toContain("<b>não</b>");
  });

  it("keeps single line breaks inside a text paragraph", () => {
    expect(renderCourseBody("linha1\nlinha2", "text").html).toBe("<p>linha1<br>linha2</p>");
  });

  it("sanitises html bodies and builds a plain-text alternative", () => {
    const rendered = renderCourseBody('<p>Olá</p><script>x</script><ul><li>um</li></ul>', "html");
    expect(rendered.html).toBe("<p>Olá</p><ul><li>um</li></ul>");
    expect(rendered.text).toBe("Olá\n\num");
  });

  it("defaults an unknown format to text", () => {
    expect(normalizeFormat(undefined)).toBe("text");
    expect(normalizeFormat("markdown")).toBe("text");
    expect(normalizeFormat("html")).toBe("html");
  });
});

describe("personalize", () => {
  it("replaces the token with the first name", () => {
    expect(personalize("<p>Olá, {{nome}}.</p>", "Ana Maria Silva", true)).toBe("<p>Olá, Ana.</p>");
    expect(personalize("Olá, {{ nome }}.", "Ana", false)).toBe("Olá, Ana.");
  });

  it("escapes the name in html output", () => {
    expect(personalize("<p>{{nome}}</p>", "<script>", true)).toBe("<p>&lt;script&gt;</p>");
  });

  it("leaves other tokens untouched", () => {
    expect(personalize("{{email}}", "Ana", false)).toBe("{{email}}");
  });
});

describe("htmlToPlainText", () => {
  it("flattens blocks into readable text", () => {
    expect(htmlToPlainText("<h2>Título</h2><p>Um<br>dois</p>")).toBe("Título\n\nUm\ndois");
  });
});
