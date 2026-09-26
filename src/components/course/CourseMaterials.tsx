import { useEffect, useState, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const db = supabase as unknown as SupabaseClient;
const labels: Record<string, string> = {
  template: "Template",
  checklist: "Checklist",
  guide: "Recurso de apoio",
  video: "Videoaula",
  recording: "Gravação",
};
type Material={id:string;title:string;description:string;url:string;kind:string;available_at:string;enabled:boolean};
const empty = {
  id: null as string | null,
  title: "",
  description: "",
  url: "",
  kind: "guide",
  available_at: "",
  enabled: false,
};
export default function CourseMaterials({ edition }: { edition: string }) {
  const [items, setItems] = useState<Material[]>([]),
    [item, setItem] = useState(empty),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),[loading,setLoading]=useState(false),[failed,setFailed]=useState(false),[search,setSearch]=useState(""),[filter,setFilter]=useState("all");
  const currentEdition=useRef(edition);currentEdition.current=edition;
  useEffect(() => {
    let active = true;
    setItems([]);
    setItem(empty);
    setStatus("");setFailed(false);setLoading(!!edition);setSearch("");setFilter("all");
    if (!edition) return;
    db.from("course_resources")
      .select("*")
      .eq("edition", edition)
      .order("available_at")
      .then(({ data, error }) => {
        if (active) {
          setLoading(false);
          if (error) {setFailed(true);setStatus("Não foi possível carregar os recursos. Volte a selecionar a edição para tentar novamente.");}
          else setItems(data || []);
        }
      });
    return () => {
      active = false;
    };
  }, [edition]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edition) return;
    try {const url=new URL(item.url);if(url.protocol!=="https:" || url.username || url.password)throw new Error();}catch {setStatus("Use um link HTTPS sem utilizador ou palavra-passe.");return;}
    const savingEdition=edition;
    setBusy(true);
    setStatus("");
    const { data, error } = await db.rpc("save_course_resource", {
      resource_id: item.id,
      edition_id: edition,
      resource_title: item.title,
      resource_kind: item.kind,
      resource_url: item.url,
      resource_description: item.description,
      available: item.available_at
        ? new Date(item.available_at).toISOString()
        : new Date().toISOString(),
      active: item.enabled,
    });
    if(currentEdition.current!==savingEdition){setBusy(false);return;}
    if (error)
      setStatus(
        "Não foi possível guardar o recurso. Verifique os campos e tente novamente.",
      );
    else {
      setItems((list) => [
        ...list.filter((x) => x.id !== item.id),
        { ...item, id: data, available_at:item.available_at ? new Date(item.available_at).toISOString() : new Date().toISOString() },
      ]);
      setItem(empty);
      setStatus(
        "Recurso guardado. A disponibilidade respeita a data e a opção de publicação.",
      );
    }
    setBusy(false);
  }
  if (!edition)
    return (
      <p>Selecione uma edição no topo para gerir os materiais da turma.</p>
    );
  return (
    <section className="space-y-6" aria-label="Materiais da edição">
      <div>
        <h2 className="text-xl font-semibold">Recursos e gravações</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Acesso por link privado enviado após a formação. Adicione os
          materiais, sem precisar de criar outra plataforma.
        </p>
      </div>
      <p role="status" className="text-sm">
        {status}
      </p>
      <div className="grid lg:grid-cols-2 gap-8">
        <form className="space-y-4" onSubmit={save}>
          <h3 className="font-semibold">
            {item.id ? "Editar recurso" : "Adicionar recurso"}
          </h3>
          <label className="block text-sm">
            Título
            <Input
              required
              minLength={2}
              maxLength={160}
              value={item.title}
              onChange={(e) => setItem({ ...item, title: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Tipo
            <select
              className="block w-full border rounded-md p-3 bg-background"
              value={item.kind}
              onChange={(e) => setItem({ ...item, kind: e.target.value })}
            >
              {Object.entries(labels)
                .filter(
                  ([key]) => edition.startsWith("online-") || key !== "recording",
                )
                .map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-sm">
            Link do ficheiro ou vídeo
            <Input
              required
              type="url"
              pattern="https://.*"
              value={item.url}
              onChange={(e) => setItem({ ...item, url: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Descrição breve
            <Input
              maxLength={500}
              value={item.description}
              onChange={(e) =>
                setItem({ ...item, description: e.target.value })
              }
            />
          </label>
          <label className="block text-sm">
            Disponível a partir de (hora deste dispositivo)
            <Input
              type="datetime-local"
              value={item.available_at}
              onChange={(e) =>
                setItem({ ...item, available_at: e.target.value })
              }
            />
          </label>
          <label className="flex gap-3 text-sm">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => setItem({ ...item, enabled: e.target.checked })}
            />
            Publicar para participantes desta edição
          </label>
          <div className="flex gap-3">
            <Button disabled={busy} type="submit">
              {busy ? "A guardar…" : "Guardar recurso"}
            </Button>
            {item.id && (
              <Button
                variant="outline"
                type="button"
                onClick={() => setItem(empty)}
              >
                Cancelar edição
              </Button>
            )}
          </div>
        </form>
        <div>
          <h3 className="font-semibold mb-4">Materiais da turma</h3>
          <div className="flex gap-2 mb-4"><Input aria-label="Pesquisar recursos" placeholder="Pesquisar recursos" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Estado dos recursos" className="rounded border bg-background p-2" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todos</option><option value="draft">Rascunhos</option><option value="scheduled">Agendados</option><option value="published">Disponíveis</option></select></div>
          {loading ? <p role="status">A carregar recursos…</p> : failed ? <p role="alert">Recursos indisponíveis. Nenhum dado foi substituído.</p> : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não foram adicionados materiais.
            </p>
          ) : (
            <ul className="divide-y">
              {items.filter(x=>x.title.toLowerCase().includes(search.toLowerCase()) && (filter==="all" || (filter==="draft" ? !x.enabled : filter==="scheduled" ? x.enabled && Date.parse(x.available_at)>Date.now() : x.enabled && Date.parse(x.available_at)<=Date.now()))).sort((a,b)=>Date.parse(a.available_at)-Date.parse(b.available_at)).map((x) => (
                <li key={x.id} className="py-4 flex justify-between gap-4">
                  <div>
                    <strong>{x.title}</strong>
                    <p className="text-sm text-muted-foreground">
                      {labels[x.kind]} ·{" "}
                      {!x.enabled ? "Rascunho" : Date.parse(x.available_at)>Date.now() ? "Agendado" : "Disponível"} · {new Date(x.available_at).toLocaleString("pt-PT")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>setItem({...x,id:null,title:x.title+" (cópia)",enabled:false,available_at:""})}>Duplicar como rascunho</Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setItem({
                        ...x,
                        available_at: x.available_at
                          ? new Date(
                              new Date(x.available_at).getTime() -
                                new Date(x.available_at).getTimezoneOffset() *
                                  60000,
                            )
                              .toISOString()
                              .slice(0, 16)
                          : "",
                      })
                    }
                  >
                    Editar<span className="sr-only"> {x.title}</span>
                  </Button></div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-muted-foreground mt-6">
            A página valida o pagamento no servidor. Para impedir a partilha do
            vídeo ou ficheiro após abertura, configure também as permissões no
            respetivo alojamento.
          </p>
        </div>
      </div>
    </section>
  );
}
