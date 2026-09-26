import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
const labels: Record<string, string> = {
  template: "Template",
  checklist: "Checklist",
  guide: "Recurso de apoio",
  video: "Videoaula",
  recording: "Gravação",
};
export default function CourseResources() {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    document.title = "Os seus recursos · Curso de inteligência artificial";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.append(meta);
    let token = location.hash.slice(1);
    history.replaceState(null, "", location.pathname);
    try {
      if (token) sessionStorage.setItem("course-resource-access", token);
      else token = sessionStorage.getItem("course-resource-access") || "";
    } catch {
      /* Private browsing: the link still works for this visit. */
    }
    (async () => {
      if (!/^[a-f0-9-]{36}$/i.test(token)) {
        if (active) {
          setError("Abra o link privado que recebeu no email de recursos.");
          setLoading(false);
        }
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke(
          "course-resources",
          { headers: { "x-course-access": token } },
        );
        if (error) throw error;
        if (active) setData(data);
      } catch {
        if (active)
          setError(
            "Não foi possível validar o acesso. Volte a abrir o link do email ou contacte o suporte.",
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      meta.remove();
    };
  }, []);
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-5 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">
        <header className="border-b pb-8 mb-10">
          <p className="font-semibold mb-8">Frederico Carvalho</p>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            O que aprendeu, pronto a usar.
          </h1>
          <p className="mt-5 text-lg max-w-2xl text-slate-600">
            Templates, checklists e resumos para continuar a trabalhar no seu
            desafio.
          </p>
          {data && <p className="mt-4 font-medium">{data.edition}</p>}
        </header>
        {loading && <p role="status">A verificar o seu acesso…</p>}
        {error && (
          <p role="alert" className="border rounded-xl p-6">
            {error}
          </p>
        )}
        {data && (
          <>
            <div className="grid md:grid-cols-2 gap-5">
              {data.resources.map((r: any) => (
                <article key={r.id} className="border rounded-xl p-6 bg-white">
                  <p className="text-sm text-slate-600 mb-3">
                    {labels[r.kind]}
                  </p>
                  <h2 className="text-xl font-semibold">{r.title}</h2>
                  <p className="my-4 text-slate-600 leading-relaxed">
                    {r.description}
                  </p>
                  <Button asChild variant="outline">
                    <a
                      href={/^https:\/\//.test(r.url) ? r.url : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                    >
                      {["video", "recording"].includes(r.kind)
                        ? "Ver vídeo"
                        : "Abrir recurso"}
                    </a>
                  </Button>
                </article>
              ))}
            </div>
            {data.resources.length === 0 && (
              <p>
                Os materiais ainda estão a ser preparados. Receberá a indicação
                por email quando estiverem disponíveis.
              </p>
            )}
            {data.edition.toLowerCase().includes("online") && (
              <p className="text-sm text-slate-600 mt-7">
                Gravações disponíveis até{" "}
                {new Date(data.recordings_until).toLocaleDateString("pt-PT")}.
              </p>
            )}
          </>
        )}
        <footer className="border-t mt-12 pt-6 text-sm text-slate-600">
          Precisa de ajuda?{" "}
          <a
            className="underline underline-offset-4"
            href="mailto:info@fredericocarvalho.pt"
          >
            info@fredericocarvalho.pt
          </a>{" "}
          ·{" "}
          <a className="underline underline-offset-4" href="tel:+351915015508">
            915 015 508
          </a>
        </footer>
      </div>
    </main>
  );
}
