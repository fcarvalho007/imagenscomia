import { Copy, ExternalLink, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EDITIONS } from "@/lib/course/contract";
import { editionNames } from "@/lib/course/editions";
import type { CRMView } from "@/components/crm/CRMSidebar";

const landing = "https://fredericocarvalho.pt/curso-de-inteligencia-artificial/";
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

export default function CourseLinks({ edition, onNavigate }: { edition: string; onNavigate: (view: CRMView) => void }) {
  const editions = EDITIONS.filter(id => !edition || edition === id);
  return <section className="px-4 pb-4 pt-16 sm:px-7 sm:pb-7 md:pt-7 lg:p-8 max-w-6xl">
    <header className="mb-8">
      <h1 className="font-heading text-2xl font-bold text-slate-900">Links e testes</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Abra as páginas, avalie a experiência e copie os links. Os atalhos externos abrem num novo separador.</p>
    </header>
    <section aria-labelledby="landing-links" className="mb-9">
      <h2 id="landing-links" className="text-lg font-bold text-slate-900">Landing page</h2>
      <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
        <LinkRow title="Começar pela LP1" description="Veja a primeira visita e percorra o formulário até à página personalizada da edição (LP2)." href={`${landing}?preview=primeira-visita`} />
        <LinkRow title="Página pública do curso" description="Abra o endereço que será partilhado com os interessados. Pode recuperar escolhas anteriores guardadas neste navegador." href={landing} />
      </div>
    </section>
    <section aria-labelledby="demo-links" className="mb-9">
      <div className="flex flex-wrap items-center gap-3"><h2 id="demo-links" className="text-lg font-bold text-slate-900">Experimentar o checkout</h2><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Demonstração · sem cobrança</span></div>
      <p className="mt-2 text-sm text-slate-600">Teste o formulário, os totais e o complemento opcional. Esta demonstração não cria inscrições, pagamentos ou emails.</p>
      <p className="mt-2 text-sm text-slate-600">{edition ? "A mostrar a edição selecionada no menu lateral." : "Escolha uma edição abaixo ou filtre no menu lateral."}</p>
      <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{editions.map(id => <LinkRow key={id} title={editionNames[id]} description="Pode simular a compra com e sem o pacote de imagem e vídeo." href={`/curso-ia/checkout-demonstracao?edition=${id}`} action="Testar" />)}</div>
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
      <summary className={`cursor-pointer rounded text-sm font-semibold text-slate-700 ${focus}`}>Outros acessos · checkout real e área do participante</summary>
      <p className="mt-4 text-sm text-slate-600">Estes links usam a versão da aplicação onde está a trabalhar. Abrir uma página não confirma que esteja publicada ou que as vendas estejam ativas. Para simular uma compra, use a demonstração acima.</p>
      <div className="divide-y divide-slate-200">{editions.map(id => <LinkRow key={id} title={`Checkout real · ${editionNames[id]}`} description="Fluxo de inscrição ligado ao backend. Quando as vendas estiverem ativas, submeter pode criar uma inscrição real." href={`/curso-ia/checkout?edition=${id}`} />)}
        <LinkRow title="Área do participante" description="Veja o ecrã de entrada. Os materiais exigem o link privado enviado ao participante; este atalho não concede acesso." href="/curso-ia/recursos" />
      </div>
    </details>
  </section>;
}
