import { useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWebinarContext } from "@/contexts/WebinarContext";
import { WEBINAR_CONFIG, type WebinarKey } from "@/config/webinarConfig";

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

interface LinkItem { title: string; description: string; href: string; token?: boolean }


const LINKS: Record<WebinarKey, { group: string; items: LinkItem[] }[]> = {
  video: [
    {
      group: "Páginas de entrada",
      items: [
        { title: "Landing page", description: "Página de inscrição no webinar gratuito.", href: "/video-lp" },
        { title: "Landing page (variante)", description: "Versão alternativa da página de inscrição.", href: "/video" },
        { title: "Checkout", description: "Página de compra dos planos pagos (masterclass, bundle, gravação).", href: "/comprar" },
      ],
    },
    {
      group: "Durante o evento",
      items: [
        { title: "Sessão ao vivo", description: "Página da transmissão em direto do webinar.", href: "/live-video" },
        { title: "Masterclass", description: "Página da masterclass paga.", href: "/masterclass-video", token: true },
      ],
    },
    {
      group: "Após a inscrição",
      items: [
        { title: "Upgrade", description: "Página de proposta dos planos pagos após a inscrição gratuita.", href: "/upgrade-video", token: true },
        { title: "Upgrade da gravação", description: "Página de compra da gravação.", href: "/upgrade-gravacao", token: true },
        { title: "Recursos", description: "Área de recursos para quem comprou.", href: "/recursos-video", token: true },
        { title: "Recursos da masterclass", description: "Materiais da masterclass.", href: "/recursos-masterclass", token: true },
      ],
    },
  ],
  imagens: [
    {
      group: "Páginas de entrada",
      items: [
        { title: "Landing page", description: "Página de inscrição no webinar gratuito.", href: "/" },
        { title: "Convites", description: "Página para partilhar e convidar outras pessoas.", href: "/convites" },
      ],
    },
    {
      group: "Durante o evento",
      items: [
        { title: "Sessão ao vivo", description: "Página da transmissão em direto do webinar.", href: "/live" },
      ],
    },
    {
      group: "Após a inscrição",
      items: [
        { title: "Upgrade", description: "Página de proposta dos planos pagos após a inscrição gratuita.", href: "/upgrade", token: true },
        { title: "Gravação", description: "Página de acesso à gravação.", href: "/gravacao", token: true },
        { title: "Recursos", description: "Área de recursos para quem comprou.", href: "/recursos", token: true },
      ],
    },
  ],
};

function LinkRow({ item }: { item: LinkItem }) {
  const absolute = new URL(item.href, window.location.origin).href;
  async function copy() {
    try { await navigator.clipboard.writeText(absolute); toast.success("Link copiado."); }
    catch { toast.error("Não foi possível copiar. Selecione e copie o endereço apresentado."); }
  }
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-900">{item.title}</h3>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl">{item.description}</p>
        <p className="mt-2 break-all text-xs text-slate-500 select-all">{absolute}</p>
        {item.token && <p className="mt-1 text-xs text-amber-700">Página com ligação pessoal: em produção só abre com o link enviado ao participante.</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" onClick={copy} aria-label={`Copiar link: ${item.title}`}><Copy size={14} className="mr-2" />Copiar</Button>
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 ${focus}`} aria-label={`Abrir: ${item.title} (novo separador)`}>Abrir<ExternalLink size={14} aria-hidden="true" /></a>
      </div>
    </div>
  );
}

/** Ligações pessoais do próprio administrador, para testar as páginas reservadas. */
function useOwnTestTokens() {
  const [tokens, setTokens] = useState<Partial<Record<WebinarKey, string>>>({});
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const email = auth.user?.email;
      if (!email) return;
      const { data } = await supabase
        .from("registrations")
        .select("webinar, edit_token")
        .eq("email", email);
      if (!active || !data) return;
      const map: Partial<Record<WebinarKey, string>> = {};
      for (const row of data) {
        if ((row.webinar === "video" || row.webinar === "imagens") && row.edit_token) {
          map[row.webinar as WebinarKey] = row.edit_token;
        }
      }
      setTokens(map);
    })();
    return () => { active = false; };
  }, []);
  return tokens;
}

function testItems(key: WebinarKey, token: string): LinkItem[] {
  const gated = LINKS[key].flatMap((section) => section.items).filter((item) => item.token);
  const live: LinkItem[] = key === "video"
    ? [{ title: "Sessão ao vivo", description: "Transmissão em direto, com a sua ligação pessoal.", href: "/live-video" }]
    : [{ title: "Sessão ao vivo", description: "Transmissão em direto, com a sua ligação pessoal.", href: "/live" }];
  return [...live, ...gated].map((item) => ({
    title: item.title,
    description: item.description,
    href: `${item.href}?t=${token}`,
  }));
}

export default function WebinarLinks() {
  const { webinarContext } = useWebinarContext();
  const keys: WebinarKey[] = webinarContext === "consolidado" ? ["imagens", "video"] : [webinarContext];
  const tokens = useOwnTestTokens();
  return (
    <section className="px-4 pb-4 pt-16 sm:px-7 sm:pb-7 md:pt-7 lg:p-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Links</h1>
        <p className="mt-2 max-w-2xl text-slate-600">As páginas públicas do webinar selecionado no menu lateral. Copie o endereço ou abra num novo separador.</p>
      </header>
      {keys.some((key) => tokens[key]) && (
        <section aria-label="Ligações de teste" className="mb-9 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
          <h2 className="text-lg font-bold text-slate-900">Ligações de teste (a sua conta)</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-700">Abrem as páginas reservadas já autenticadas com a inscrição de teste do seu email. Não partilhe estes endereços.</p>
          {keys.filter((key) => tokens[key]).map((key) => (
            <div key={key} className="mt-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{WEBINAR_CONFIG[key].emoji} {WEBINAR_CONFIG[key].label}</h3>
              <div className="mt-1 divide-y divide-emerald-200 border-y border-emerald-200">
                {testItems(key, tokens[key] as string).map((item) => <LinkRow key={item.href} item={item} />)}
              </div>
            </div>
          ))}
        </section>
      )}
      {keys.map((key) => (

        <section key={key} aria-label={`Links de ${WEBINAR_CONFIG[key].label}`} className="mb-9">
          {keys.length > 1 && <h2 className="mb-2 text-lg font-bold text-slate-900">{WEBINAR_CONFIG[key].emoji} {WEBINAR_CONFIG[key].label}</h2>}
          {LINKS[key].map((section) => (
            <div key={section.group} className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{section.group}</h3>
              <div className="mt-1 divide-y divide-slate-200 border-y border-slate-200">
                {section.items.map((item) => <LinkRow key={item.href} item={item} />)}
              </div>
            </div>
          ))}
        </section>
      ))}
    </section>
  );
}
