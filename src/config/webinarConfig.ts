export type WebinarKey = "imagens" | "video";
export type WebinarContext = WebinarKey | "consolidado";

export const WEBINAR_CONFIG = {
  imagens: {
    label: "Imagens IA",
    emoji: "📷",
    date: "18 Fev 2026",
    startDate: new Date("2026-02-18T10:00:00Z"),
    color: "#1e40af",
    badgeBg: "rgba(30,64,175,0.15)",
    sidebarSubtitle: "Imagens IA · 18 Fev 2026",
  },
  video: {
    label: "Vídeo IA",
    emoji: "🎬",
    date: "2 Mar 2026",
    startDate: new Date("2026-03-02T23:59:59Z"),
    color: "#16a34a",
    badgeBg: "rgba(22,163,74,0.15)",
    sidebarSubtitle: "Vídeo IA · 2 Mar 2026",
  },
} as const;

export const CONSOLIDADO_COLOR = "#7c3aed";

export function filterByWebinar<T extends { webinar?: string }>(
  items: T[],
  context: WebinarContext
): T[] {
  if (context === "consolidado") return items;
  if (context === "video") return items.filter((i) => i.webinar === "video");
  return items.filter((i) => !i.webinar || i.webinar === "imagens");
}
