import { useEffect } from "react";
import { Radio } from "lucide-react";
import { WebinarVideoArea } from "@/components/webinar/WebinarVideoArea";
import { WebinarSidebar } from "@/components/webinar/WebinarSidebar";
import { WebinarContent } from "@/components/webinar/WebinarContent";
import WebinarCalendarButton from "@/components/webinar/AddToCalendarButton";
import { WebinarFooter } from "@/components/webinar/WebinarFooter";
import { WEBINAR_CONFIG } from "@/components/webinar/webinarConfig";
import { useCountdown } from "@/hooks/useCountdown";

const WebinarLive = () => {
  const countdown = useCountdown(WEBINAR_CONFIG.startDate);

  useEffect(() => {
    document.title = `${WEBINAR_CONFIG.title} — DIGITALFC`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", WEBINAR_CONFIG.summary);
    else {
      const tag = document.createElement("meta");
      tag.name = "description";
      tag.content = WEBINAR_CONFIG.summary;
      document.head.appendChild(tag);
    }
  }, []);
  const now = new Date();
  const timeDiff = WEBINAR_CONFIG.startDate.getTime() - now.getTime();
  const isNearStart = timeDiff <= 30 * 60 * 1000 && timeDiff > 0;
  const isPast = timeDiff <= 0;
  const isLive = WEBINAR_CONFIG.isLive || isNearStart;
  const endTime = new Date(WEBINAR_CONFIG.startDate.getTime() + WEBINAR_CONFIG.durationMinutes * 60 * 1000);
  const isEnded = now > endTime && !WEBINAR_CONFIG.isLive;

  return (
    <div className="min-h-screen bg-[#FAFBFC] font-sans">
      {/* Header bar */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <span className="font-heading font-medium text-[15px] tracking-normal text-ink-900">
            Frederico Carvalho
          </span>
          {isLive && (
            <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-600 text-[12px] font-semibold px-2.5 py-1 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />
              EM DIRETO
            </span>
          )}
          <span className="text-[13px] text-ink-400 hidden sm:block">
            {WEBINAR_CONFIG.metaLine}
          </span>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Title block */}
        <div className="mb-6 md:mb-8">
          <p className="text-[13px] text-ink-400 uppercase tracking-widest font-medium mb-2">
            Webinar gratuito
          </p>
          <h1 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[36px] leading-[1.15] text-ink-900 mb-2">
            {WEBINAR_CONFIG.title}
          </h1>
          <p className="text-[15px] sm:text-[17px] text-ink-500 max-w-[640px]">
            {WEBINAR_CONFIG.summary}
          </p>
          <p className="text-[13px] text-ink-400 mt-2 sm:hidden">
            {WEBINAR_CONFIG.metaLine}
          </p>
        </div>

        {/* 2-col layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            <WebinarVideoArea
              isLive={isLive}
              isEnded={isEnded}
              countdown={countdown}
            />
            {!isLive && !isEnded && (
              <div className="text-center py-4 mb-4">
                <WebinarCalendarButton />
              </div>
            )}
            <WebinarContent />
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[340px] flex-shrink-0">
            <WebinarSidebar />
          </aside>
        </div>
      </main>

      <WebinarFooter />
    </div>
  );
};

export default WebinarLive;
