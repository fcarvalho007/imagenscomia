import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Confirmacao from "./pages/Confirmacao";
import Upsell from "./pages/Upsell";
import Convites from "./pages/Convites";
import NotFound from "./pages/NotFound";
import CRM from "./pages/CRM";
import WebinarLive from "./pages/WebinarLive";
import Termos from "./pages/Termos";
import UpgradeSucesso from "./pages/UpgradeSucesso";
import Pagar from "./pages/Pagar";
import Gravacao from "./pages/Gravacao";
import UpgradeGravacao from "./pages/UpgradeGravacao";
import Inicial from "./pages/Inicial";
import Recursos from "./pages/Recursos";
import VideoPage from "./pages/Video";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/confirmacao" element={<Confirmacao />} />
          <Route path="/upgrade" element={<Upsell />} />
          <Route path="/convites" element={<Convites />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/live" element={<WebinarLive />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/upgrade/sucesso" element={<UpgradeSucesso />} />
          <Route path="/pagar" element={<Pagar />} />
          <Route path="/gravacao" element={<Gravacao />} />
          <Route path="/upgrade-gravacao" element={<UpgradeGravacao />} />
          <Route path="/inicial" element={<Inicial />} />
          <Route path="/recursos" element={<Recursos />} />
          <Route path="/video" element={<VideoPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
