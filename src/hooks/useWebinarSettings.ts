import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WebinarSettings {
  webinar: string;
  label: string;
  emoji: string;
  color: string;
  event_date: string | null;
  price_premium: number;
  price_masterclass: number;
  price_bundle: number;
  landing_visitors: number;
  cutoff_date: string | null;
  live_views: number | null;
  live_avg_duration: string | null;
  live_peak_viewers: number | null;
  live_likes: number | null;
  live_new_subs: number | null;
  live_date: string | null;
}

// Fallback hardcoded values (used only if DB fetch fails)
const FALLBACK: Record<string, Pick<WebinarSettings, "price_premium" | "price_masterclass" | "price_bundle">> = {
  imagens: { price_premium: 18.45, price_masterclass: 57.81, price_bundle: 76.26 },
  video: { price_premium: 33.21, price_masterclass: 82.41, price_bundle: 115.62 },
};

let _cache: Map<string, WebinarSettings> | null = null;
let _fetchPromise: Promise<Map<string, WebinarSettings>> | null = null;

async function fetchSettings(): Promise<Map<string, WebinarSettings>> {
  if (_cache) return _cache;
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = supabase
    .from("webinar_settings")
    .select("*")
    .then(({ data, error }) => {
      if (error || !data) {
        console.error("Error fetching webinar_settings:", error);
        return new Map();
      }
      const map = new Map<string, WebinarSettings>();
      for (const row of data as any[]) {
        map.set(row.webinar, {
          webinar: row.webinar,
          label: row.label,
          emoji: row.emoji,
          color: row.color,
          event_date: row.event_date,
          price_premium: Number(row.price_premium) || 0,
          price_masterclass: Number(row.price_masterclass) || 0,
          price_bundle: Number(row.price_bundle) || 0,
          landing_visitors: row.landing_visitors ?? 0,
          cutoff_date: row.cutoff_date,
          live_views: row.live_views,
          live_avg_duration: row.live_avg_duration,
          live_peak_viewers: row.live_peak_viewers,
          live_likes: row.live_likes,
          live_new_subs: row.live_new_subs,
          live_date: row.live_date,
        });
      }
      _cache = map;
      _fetchPromise = null;
      return map;
    });
  return _fetchPromise;
}

/** Get plan prices for a webinar, with DB-first + hardcoded fallback */
export function getPlanPrices(webinar: string, settingsMap: Map<string, WebinarSettings>): Record<string, number> {
  const s = settingsMap.get(webinar);
  const fb = FALLBACK[webinar] || FALLBACK.imagens;
  return {
    premium: s?.price_premium ?? fb.price_premium,
    masterclass: s?.price_masterclass ?? fb.price_masterclass,
    bundle: s?.price_bundle ?? fb.price_bundle,
  };
}

export function useWebinarSettings() {
  const [settings, setSettings] = useState<Map<string, WebinarSettings>>(_cache || new Map());
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    fetchSettings().then((map) => {
      setSettings(map);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
