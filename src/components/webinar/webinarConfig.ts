// ─── Webinar Configuration ───────────────────────────────────────────
// Change these constants to reuse this template for future webinars.

export const WEBINAR_CONFIG = {
  title: "Cria Imagens Profissionais com IA",
  metaLine: "Quarta-feira, 18 de Fevereiro · 10h00 (Portugal)",
  summary: "De briefing a imagem publicável em minutos — com método e exemplos reais.",
  startDate: new Date("2026-02-18T10:00:00+00:00"), // Europe/Lisbon = UTC in Feb
  durationMinutes: 60,

  /** Set to true to force the live/embed state regardless of time */
  isLive: true,

  /** YouTube video ID for the live stream */
  YOUTUBE_VIDEO_ID: "hYsTZA9bcPA",

  /**
   * Paste the full iframe embed code here when you have it.
   * Example: '<iframe src="https://youtube.com/embed/..." ...></iframe>'
   */
  EMBED_IFRAME_HTML: "",

  // ─── Calendar Event Details ───
  calendarEvent: {
    name: "Webinar ao vivo — Cria Imagens Profissionais com IA",
    description: "Aprender um método prático para transformar um briefing simples em imagens prontas a publicar, com consistência visual e controlo do resultado. - Quarta-feira, 18 Fev 2026",
    startDate: "2026-02-18",
    startTime: "10:00",
    endDate: "2026-02-18",
    endTime: "11:00",
    timeZone: "Europe/Lisbon",
    location: "https://imagenscomia.com/live",
    organizer: "Frederico Carvalho|fredericodigital@gmail.com",
  },

  // ─── URLs ───
  PREMIUM_URL: "/upgrade",
  MASTERCLASS_URL: "#",
  INSTAGRAM_URL: "https://www.instagram.com/frederico.m.carvalho/",
} as const;
