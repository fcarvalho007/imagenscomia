import { Radio } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { VideoWebinarVideoArea } from "@/components/webinar/VideoWebinarVideoArea";
import { VideoWebinarSidebar } from "@/components/webinar/VideoWebinarSidebar";
import { VideoWebinarContent } from "@/components/webinar/VideoWebinarContent";
import { WebinarFooter } from "@/components/webinar/WebinarFooter";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { VIDEO_WEBINAR_CONFIG } from "@/components/webinar/videoWebinarConfig";
import { RegistrationModalProvider } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";

const WebinarLiveVideo = () => {
  usePageMeta({
    title: `${VIDEO_WEBINAR_CONFIG.title} — DIGITALFC`,
    description: VIDEO_WEBINAR_CONFIG.summary,
  });

  return (
    <RegistrationModalProvider subtitle="Terça-feira, 3 de Março, 21h">
      <div className="min-h-screen bg-[#FAFBFC] font-sans">
        <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <span className="font-heading font-medium text-[15px] tracking-normal text-ink-900">
              Frederico Carvalho
            </span>
            <span className="text-[13px] text-ink-400 hidden sm:block">
              {VIDEO_WEBINAR_CONFIG.metaLine}
            </span>
          </div>
        </header>

        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="mb-6 md:mb-8">
            <p className="text-[13px] text-ink-400 uppercase tracking-widest font-medium mb-2">
              Webinar gratuito
            </p>
            <h1 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[36px] leading-[1.15] text-ink-900 mb-2">
              {VIDEO_WEBINAR_CONFIG.title}
            </h1>
            <p className="text-[15px] sm:text-[17px] text-ink-500 max-w-[640px]">
              {VIDEO_WEBINAR_CONFIG.summary}
            </p>
            <p className="text-[13px] text-ink-400 mt-2 sm:hidden">
              {VIDEO_WEBINAR_CONFIG.metaLine}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-1 min-w-0">
              <VideoWebinarVideoArea />
              <VideoWebinarContent />
            </div>

            <aside className="w-full lg:w-[340px] flex-shrink-0">
              <VideoWebinarSidebar />
            </aside>
          </div>
        </main>

        <WebinarFooter />
        <WhatsAppSupportButton />
        <RegistrationModal />
      </div>
    </RegistrationModalProvider>
  );
};

export default WebinarLiveVideo;
