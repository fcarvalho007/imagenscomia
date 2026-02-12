import { useEffect } from "react";

export function usePageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let prevDesc: string | null = null;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        prevDesc = meta.getAttribute("content");
        meta.setAttribute("content", description);
      }
    }

    return () => {
      document.title = prevTitle;
      if (description && prevDesc !== null) {
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", prevDesc);
      }
    };
  }, [title, description]);
}
