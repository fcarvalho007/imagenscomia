import { Component, lazy, Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const CourseCheckoutDemo = lazy(() => import("./pages/CourseCheckoutDemo"));

const CourseCheckout = lazy(() => import("./pages/CourseCheckout"));
const Index = lazy(() => import("./pages/Index"));
const Confirmacao = lazy(() => import("./pages/Confirmacao"));
const Upsell = lazy(() => import("./pages/Upsell"));
const Convites = lazy(() => import("./pages/Convites"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CRM = lazy(() => import("./pages/CRM"));
const WebinarLive = lazy(() => import("./pages/WebinarLive"));
const WebinarLiveVideo = lazy(() => import("./pages/WebinarLiveVideo"));
const Termos = lazy(() => import("./pages/Termos"));
const UpgradeSucesso = lazy(() => import("./pages/UpgradeSucesso"));
const Pagar = lazy(() => import("./pages/Pagar"));
const Gravacao = lazy(() => import("./pages/Gravacao"));
const UpgradeGravacao = lazy(() => import("./pages/UpgradeGravacao"));
const UpgradeVideo = lazy(() => import("./pages/UpgradeVideo"));
const Inicial = lazy(() => import("./pages/Inicial"));
const CourseResources = lazy(() => import("./pages/CourseResources"));
const Recursos = lazy(() => import("./pages/Recursos"));
const VideoPage = lazy(() => import("./pages/Video"));
const Comprar = lazy(() => import("./pages/Comprar"));
const Fatura = lazy(() => import("./pages/Fatura"));
const VideoLPPage = lazy(() => import("./pages/VideoLP"));
const RecursosVideo = lazy(() => import("./pages/RecursosVideo"));
const MasterclassVideo = lazy(() => import("./pages/MasterclassVideo"));
const GuiaPrompts = lazy(() => import("./pages/GuiaPrompts"));
const RecursosMasterclass = lazy(() => import("./pages/RecursosMasterclass"));

class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 text-center">
      <h1 className="text-2xl font-semibold">Não foi possível abrir esta página.</h1>
      <p>Verifique a ligação à internet e tente novamente.</p>
      <button type="button" className="rounded-lg bg-primary text-primary-foreground px-6 py-3" onClick={() => window.location.reload()}>Voltar a carregar</button>
    </main>;
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteErrorBoundary>
        <Suspense fallback={<main className="min-h-screen flex items-center justify-center p-6" role="status">A abrir a página…</main>}>
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
        </Suspense>
        </RouteErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
