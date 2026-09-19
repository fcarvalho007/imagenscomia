import CourseCheckout from "./pages/CourseCheckout";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Confirmacao from "./pages/Confirmacao";
import Upsell from "./pages/Upsell";
import Convites from "./pages/Convites";
import NotFound from "./pages/NotFound";
import CRM from "./pages/CRM";
import WebinarLive from "./pages/WebinarLive";
import WebinarLiveVideo from "./pages/WebinarLiveVideo";
import Termos from "./pages/Termos";
import UpgradeSucesso from "./pages/UpgradeSucesso";
import Pagar from "./pages/Pagar";
import Gravacao from "./pages/Gravacao";
import UpgradeGravacao from "./pages/UpgradeGravacao";
import UpgradeVideo from "./pages/UpgradeVideo";
import Inicial from "./pages/Inicial";
import CourseResources from "./pages/CourseResources";
import Recursos from "./pages/Recursos";
import VideoPage from "./pages/Video";
import Comprar from "./pages/Comprar";
import Fatura from "./pages/Fatura";
import VideoLPPage from "./pages/VideoLP";
import RecursosVideo from "./pages/RecursosVideo";
import MasterclassVideo from "./pages/MasterclassVideo";
import GuiaPrompts from "./pages/GuiaPrompts";
import RecursosMasterclass from "./pages/RecursosMasterclass";

const CourseCheckoutDemo = lazy(() => import("./pages/CourseCheckoutDemo"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/curso-ia/checkout" element={<CourseCheckout />} />
            <Route
              path="/curso-ia/checkout-demonstracao"
              element={
                <Suspense fallback={<p>A abrir a demonstração…</p>}>
                  <CourseCheckoutDemo />
                </Suspense>
              }
            />
          <Route path="/" element={<Index />} />
          <Route path="/confirmacao" element={<Confirmacao />} />
          <Route path="/upgrade" element={<Upsell />} />
          <Route path="/convites" element={<Convites />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/crm/curso-ia" element={<Navigate to="/crm?project=curso-ia" replace />} />
          <Route path="/live" element={<WebinarLive />} />
          <Route path="/live-video" element={<WebinarLiveVideo />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/upgrade/sucesso" element={<UpgradeSucesso />} />
          <Route path="/pagar" element={<Pagar />} />
          <Route path="/gravacao" element={<Gravacao />} />
          <Route path="/upgrade-gravacao" element={<UpgradeGravacao />} />
          <Route path="/upgrade-video" element={<UpgradeVideo />} />
          <Route path="/inicial" element={<Inicial />} />
          <Route path="/curso-ia/recursos" element={<CourseResources />} />
          <Route path="/recursos" element={<Recursos />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/comprar" element={<Comprar />} />
          <Route path="/fatura" element={<Fatura />} />
          <Route path="/video-lp" element={<VideoLPPage />} />
          <Route path="/recursos-video" element={<RecursosVideo />} />
          <Route path="/masterclass-video" element={<MasterclassVideo />} />
          <Route path="/guia-prompts" element={<GuiaPrompts />} />
          <Route
            path="/recursos-masterclass"
            element={<RecursosMasterclass />}
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
