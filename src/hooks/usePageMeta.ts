import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
}

function upsertMeta(attr: string, key: string, content: string): string | null {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  const prev = el?.getAttribute("content") ?? null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return prev;
}

function restoreMeta(attr: string, key: string, prev: string | null) {
  const el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) return;
  if (prev !== null) {
    el.setAttribute("content", prev);
  }
  // keep default in place even if prev was null
}

export function usePageMeta({ title, description, ogTitle, ogDescription, ogImage, ogUrl }: PageMetaOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const prevs: Array<() => void> = [];

    if (description) {
      const p = upsertMeta("name", "description", description);
      prevs.push(() => restoreMeta("name", "description", p));
    }

    const ogPairs: Array<[string, string, string]> = [];
    const resolvedOgTitle = ogTitle ?? title;
    const resolvedOgDesc = ogDescription ?? description;

    ogPairs.push(["property", "og:title", resolvedOgTitle]);
    ogPairs.push(["name", "twitter:title", resolvedOgTitle]);

    if (resolvedOgDesc) {
      ogPairs.push(["property", "og:description", resolvedOgDesc]);
      ogPairs.push(["name", "twitter:description", resolvedOgDesc]);
    }
    if (ogImage) {
      ogPairs.push(["property", "og:image", ogImage]);
      ogPairs.push(["name", "twitter:image", ogImage]);
    }
    if (ogUrl) {
      ogPairs.push(["property", "og:url", ogUrl]);
    }

    for (const [attr, key, content] of ogPairs) {
      const p = upsertMeta(attr, key, content);
      prevs.push(() => restoreMeta(attr, key, p));
    }

    return () => {
      document.title = prevTitle;
      prevs.forEach((fn) => fn());
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl]);
}
