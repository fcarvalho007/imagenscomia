import { Copy, ExternalLink, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CRMView } from "@/components/crm/CRMSidebar";
import { activeEditions, checkoutUrl, COURSE_LANDING, WP_ADMIN, type CatalogEdition } from "@/lib/course/catalog";

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

function LinkRow({ title, description, href, action = "Abrir" }: { title: string; description: string; href: string; action?: string }) {
  const absolute = new URL(href, window.location.origin).href;
  async function copy() {
    try { await navigator.clipboard.writeText(absolute); toast.success("Link copiado."); }
    catch { toast.error("Não foi possível copiar. Selecione e copie o endereço apresentado."); }
  }
  return <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 max-w-2xl">{description}</p>
      <p className="mt-2 break-all text-xs text-slate-500 select-all">{absolute}</p>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <Button variant="outline" size="sm" onClick={copy} aria-label={`Copiar link: ${title}`}><Copy size={14} className="mr-2" />Copiar</Button>
      <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 ${focus}`} aria-label={`${action}: ${title} (novo separador)`}>{action}<ExternalLink size={14} aria-hidden="true" /></a>
    </div>
  </div>;
}

export default function CourseLinks({ edition, onNavigate, catalog = [] }: { catalog?: CatalogEdition[]; edition: string; onNavigate: (view: CRMView) => void }) {
  const editions = activeEditions(catalog).filter(e => !edition || e.id === edition);
  return <section className="px-4 pb-4 pt-16 sm:px-7 sm:pb-7 md:pt-7 lg:p-8 max-w-6xl">
    <header className="mb-8">
      <h1 className="font-heading text-2xl font-bold text-slate-900">Links e testes</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Percurso atual: página do curso → escolha Online ou Lisboa → checkout WordPress → CRM. Os atalhos abrem num novo separador.</p>
    </header>
    <section aria-labelledby="landing-links" className="mb-9">
      <h2 id="landing-links" className="text-lg font-bold text-slate-900">Landing page</h2>
      <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
        <LinkRow title="Landing page publicada" description="Página única do curso, com programa, edições e escolha da modalidade." href={COURSE_LANDING} />
      </div>
    </section>
    <section aria-labelledby="demo-links" className="mb-9">
      <h2 id="demo-links" className="text-lg font-bold text-slate-900">Checkout WordPress · edições ativas</h2>
      <p className="mt-2 text-sm text-slate-600">Confira a edição, os dados e o total. Não conclua o pagamento para uma simples revisão: a submissão cria uma encomenda real. A compra e a fatura são confirmadas pelo WooCommerce.</p>
      <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
        {editions.length === 0 && <p className="py-5 text-sm text-slate-600">A edição selecionada está arquivada: não tem link de inscrição ativo.</p>}
        {editions.map(e => { const url = checkoutUrl(e); return url && <LinkRow key={e.id} title={e.label} description={`Abre o checkout com a modalidade ${e.modality}.`} href={url} action="Rever" />; })}
      </div>
    </section>
    <section aria-labelledby="wp-links" className="mb-9">
      <h2 id="wp-links" className="text-lg font-bold text-slate-900">Painel WordPress</h2>
      <p className="mt-2 text-sm text-slate-600">Requer sessão de administrador no WordPress.</p>
      <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
        <LinkRow title="Analítica" description="Visitas e entradas no checkout medidas com consentimento." href={`${WP_ADMIN}?page=fcia-course`} />
        <LinkRow title="Acessos" description="Gestão de acessos dos participantes." href={`${WP_ADMIN}?page=fcia-access`} />
        <LinkRow title="Anúncios" description="Investimento, anúncios e última sincronização." href={`${WP_ADMIN}?page=fcia-ads`} />
      </div>
    </section>
    <section aria-labelledby="management-links" className="mb-9">
      <h2 id="management-links" className="text-lg font-bold text-slate-900">Rever dentro do CRM</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">{[
        { view: "templates" as CRMView, title: "Automações", text: "Rever sequências, templates e configuração." },
        { view: "comunicacao" as CRMView, title: "Emails e SMS", text: "Enviar um teste para si e consultar o resultado." },
        { view: "recursos" as CRMView, title: "Materiais do curso", text: "Gerir os recursos disponíveis por edição." },
      ].map(item => <button key={item.view} onClick={() => onNavigate(item.view)} className={`group border-b border-slate-200 py-4 text-left ${focus}`}><span className="flex items-center justify-between gap-3 font-semibold text-slate-900">{item.title}<ArrowRight size={16} aria-hidden="true" className="text-blue-600" /></span><span className="mt-2 block text-sm text-slate-600">{item.text}</span></button>)}</div>
    </section>
    <details className="border-t border-slate-200 pt-5">
      <summary className={`cursor-pointer rounded text-sm font-semibold text-slate-700 ${focus}`}>Histórico anterior (até 01/10/2026)</summary>
      <p className="mt-4 text-sm text-slate-600">Consulta administrativa do sistema anterior. Ambos os links requerem sessão de administrador no WordPress; o arquivo não é público.</p>
      <div className="divide-y divide-slate-200">
        <LinkRow title="Histórico no WordPress" description="Eventos guardados do sistema anterior, sem os apagar." href={`${WP_ADMIN}?page=fcia-history`} />
        <LinkRow title="Antiga landing page" description="Versão anterior, apenas para consulta administrativa." href="https://fredericocarvalho.pt/?fc_ia_history=20261001&preview=primeira-visita" />
        <LinkRow title="Área do participante" description="Ecrã de entrada. Os materiais exigem o link privado enviado ao participante." href="/curso-ia/recursos" />
      </div>
    </details>
  </section>;
}
