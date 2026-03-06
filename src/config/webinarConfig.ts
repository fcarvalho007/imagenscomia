export type WebinarKey = "imagens" | "video";
export type WebinarContext = WebinarKey | "consolidado";

export const WEBINAR_CONFIG = {
  imagens: {
    label: "Imagens IA",
    emoji: "📷",
    date: "18 Fev 2026",
    startDate: new Date("2026-02-18T10:00:00Z"),
    postEventCutoff: new Date("2026-02-18T11:00:00Z"),
    color: "#1e40af",
    badgeBg: "rgba(30,64,175,0.15)",
    sidebarSubtitle: "Imagens IA · 18 Fev 2026",
  },
  video: {
    label: "Vídeo IA",
    emoji: "🎬",
    date: "2 Mar 2026",
    startDate: new Date("2026-03-02T23:59:59Z"),
    postEventCutoff: new Date("2026-03-05T11:00:00Z"),
    color: "#16a34a",
    badgeBg: "rgba(22,163,74,0.15)",
    sidebarSubtitle: "Vídeo IA · 2 Mar 2026",
  },
} as const;

export const CONSOLIDADO_COLOR = "#7c3aed";

/** Video webinar dates & URLs */
export const VIDEO_WEBINAR_DATE = new Date("2026-03-05T10:00:00Z");
export const VIDEO_QA_DATE = new Date("2026-03-10T14:30:00Z");
export const VIDEO_MASTERCLASS_DATE = new Date("2026-03-12T10:00:00Z");
export const LIVE_URL_VIDEO = "https://imagenscomia.com/live-video";
export const UPGRADE_URL_VIDEO = "https://imagenscomia.com/upgrade-video";
export const INVITES_URL = "https://imagenscomia.com/convites";

/** Dashboard-specific constants per webinar */
export const WEBINAR_DASHBOARD_CONFIG = {
  imagens: {
    visitors: 2686,
    cutoffDate: new Date("2026-02-20T23:59:59"),
    liveResults: {
      views: 268,
      avgDuration: "27:35",
      peakViewers: 109,
      likes: 14,
      newSubs: 11,
      date: "18 Fev",
    },
  },
  video: {
    visitors: 0 as number,
    cutoffDate: null as Date | null,
    liveResults: null as null | {
      views: number;
      avgDuration: string;
      peakViewers: number;
      likes: number;
      newSubs: number;
      date: string;
    },
  },
} as const;

export function filterByWebinar<T extends { webinar?: string }>(
  items: T[],
  context: WebinarContext
): T[] {
  if (context === "consolidado") return items;
  if (context === "video") return items.filter((i) => i.webinar === "video");
  return items.filter((i) => !i.webinar || i.webinar === "imagens");
}

/** Small reusable badge for webinar identification in consolidado mode */
export function webinarBadgeStyle(webinar: string): { bg: string; color: string; label: string } {
  if (webinar === "video") return { bg: "#16a34a", color: "#fff", label: "VID" };
  return { bg: "#1e40af", color: "#fff", label: "IMG" };
}

export const EGOI_CONFIG = {
  baseUrl: "https://api.egoiapp.com",
  listId: 5,
  tags: {
    videoWebinar: 34,     // webinar_video_com_ia_5_marco
    premiumPass: 35,      // premium_pass_webinar_video
    masterclass: 33,      // masterclass (partilhada)
  }
} as const;
