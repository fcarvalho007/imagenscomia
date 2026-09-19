import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  emailLabels,
  renderCourseEmail,
} from "../../../supabase/functions/_shared/course/emails";
import { smsLabels, renderCourseSMS } from "../../../supabase/functions/_shared/course/sms";
const db = supabase as unknown as SupabaseClient;
const fields: Record<string, string> = {
  schedule: "Datas e horários",
  venue: "Local e morada",
  before_url: "Agendamento da sessão antes",
  after_url: "Agendamento da sessão depois",
  join_url: "Acesso às sessões online",
  resources_url: "Recursos externos (opcional)",
  recordings_url: "Gravações externas (opcional)",
};
const states: Record<string, string> = {
  queued: "Agendado",
  processing: "Em processamento",
  sent: "Aceite pelo fornecedor",
  blocked: "Falta configuração ou dados",
  review: "Verificação necessária",
  cancelled: "Cancelado",
};
type Edition = {
  id: string;
  label: string;
  automation_enabled: boolean;
  sms_enabled: boolean;
  invoicing_enabled: boolean;
  operations: Record<string, string>;
};
type Job = {
  id: string;
  kind: string;
  template: string;
  state: string;
  due_at: string;
  error_code: string | null;
  course_registrations: { name: string; edition: string };
};
export default function CourseOperations({ edition, refresh = 0, communicationOnly = false }: { edition: string; refresh?: number; communicationOnly?: boolean }) {
  const [view, setView] = useState("pending"), [revision, setRevision] = useState(0), [now, setNow] = useState(Date.now());
  useEffect(() => { const id=setInterval(()=>setNow(Date.now()),60000);return ()=>clearInterval(id); }, []);
  const [editions, setEditions] = useState<Edition[]>([]),
    [jobs, setJobs] = useState<Job[]>([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false),
    [heartbeat, setHeartbeat] = useState<string | null>(null),
    [preview, setPreview] = useState("confirmation");
  const selected = editions.find((e) => e.id === edition);
  useEffect(() => {
    let active = true;
    setLoaded(false);
    setError("");
    setNotice("");
    setJobs([]);
    (async () => {
      try {
        let q = db
          .from("course_jobs")
          .select(
            "id,kind,template,state,due_at,error_code,course_registrations!inner(name,edition)",
          )
          .order("due_at", { ascending: view === "pending" })
          .limit(100);
        q = view === "pending" ? q.in("state", ["queued", "blocked", "review", "processing"]) : q.in("state", ["sent", "cancelled"]);
        if (edition) q = q.eq("course_registrations.edition", edition);
        const [es, js, hs] = await Promise.all([
          db
            .from("course_editions")
            .select("id,label,automation_enabled,sms_enabled,invoicing_enabled,operations")
            .order("starts_at"),
          q,
          db
            .from("course_worker_health")
            .select("last_run_at,result")
            .eq("worker", "course-operations")
            .maybeSingle(),
        ]);
        if (es.error || js.error || hs.error) throw new Error("load");
        if (!active) return;
        setEditions(es.data || []);
        setJobs(
          (js.data || []).map((j) => ({
            ...j,
            course_registrations: Array.isArray(j.course_registrations)
              ? j.course_registrations[0]
              : j.course_registrations,
          })) as Job[],
        );
        setHeartbeat(hs.data?.result === "ok" ? hs.data.last_run_at : null);
        setLoaded(true);
      } catch {
        if (active)
          setError(
            "Não foi possível carregar a operação. Atualize a página para tentar novamente.",
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [edition, refresh, revision, view]);
  async function save() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    const { error } = await db.rpc("configure_course_operation", {
      edition_id: selected.id,
      settings: selected.operations,
      enabled: selected.automation_enabled,
      sms: selected.sms_enabled,
      invoicing: selected.invoicing_enabled,
    });
    if (error)
      setError(
        "Não foi possível guardar. Verifique os horários e use links HTTPS válidos. É necessário acesso de administrador com segundo fator.",
      );
    else
      setNotice(
        "Configuração guardada. Os envios dependem também da ativação do serviço no backend.",
      );
    setBusy(false);
  }
  function update(key: string, value: string) {
    setEditions((es) =>
      es.map((e) =>
        e.id === edition
          ? { ...e, operations: { ...e.operations, [key]: value } }
          : e,
      ),
    );
  }
  let emailHTML = "";
  try {
    if (selected)
      emailHTML = renderCourseEmail(preview, {
        ...selected.operations,
        name: "Participante",
        edition: selected.id,
        label: selected.label,
        schedule: selected.operations.schedule || "",
        resources_url:
          selected.operations.resources_url ||
          "https://imagenscomia.com/curso-ia/recursos",
        recordings_url:
          selected.operations.recordings_url ||
          "https://imagenscomia.com/curso-ia/recursos",
        portal_url:
          "https://fredericocarvalho.pt/curso-de-inteligencia-artificial/",
      }).html;
  } catch {
    /* Missing actual links are shown as a configuration state, never sent as placeholders. */
  }
  const recent = heartbeat && now - Date.parse(heartbeat) < 20 * 60000;
  return (
    <section className="flex flex-col gap-7" aria-label="Operação das automações">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
        <div>
          <h2 className="text-xl font-semibold">{communicationOnly ? "Histórico de comunicação" : "Emails, SMS e faturação"}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Cada edição tem os seus links, calendário e histórico. Sem envios
            automáticos durante a formação.
          </p>
        </div>
        <Badge variant={recent ? "secondary" : "outline"}>
          {recent
            ? "Serviço verificado nos últimos 20 min"
            : "Serviço por verificar"}
        </Badge>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
      {!loaded && !error && <p role="status">A carregar a configuração…</p>}
      {!communicationOnly && !edition && loaded && (
        <div className="grid sm:grid-cols-3 gap-5">
          {editions.map((e) => (
            <div key={e.id} className="border rounded-xl p-5">
              <h3 className="font-semibold">{e.label}</h3>
              <p className="text-sm mt-2">
                {e.automation_enabled
                  ? "Sequência autorizada"
                  : "Sequência em pausa"}
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                Selecione esta edição na barra lateral para configurar e rever os emails.
              </p>
            </div>
          ))}
        </div>
      )}
      {!communicationOnly && selected && <div className="grid gap-3 sm:grid-cols-3" aria-label="Sequência de acompanhamento">
        <div className="rounded-xl border p-4"><h3 className="font-semibold">Antes</h3><p className="text-sm mt-2">Confirmação → sessão individual → informação prática → SMS opcional.</p></div>
        <div className="rounded-xl border p-4"><h3 className="font-semibold">Durante</h3><p className="text-sm mt-2">Sem mensagens automáticas. A formação é o foco.</p></div>
        <div className="rounded-xl border p-4"><h3 className="font-semibold">Depois</h3><p className="text-sm mt-2">Recursos → sessão individual → lembrete SMS, se ainda não estiver agendada.</p></div>
      </div>}
      {!communicationOnly && selected && (
        <div className="grid lg:grid-cols-2 gap-8">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <h3 className="font-semibold">Preparação da edição</h3>
            {Object.entries(fields)
              .filter(([key]) =>
                selected.id === "online-2026"
                  ? key !== "venue"
                  : !["join_url", "recordings_url"].includes(key),
              )
              .map(([key, label]) => (
                <label key={key} className="block text-sm font-medium">
                  {label}
                  <Input
                    className="mt-2"
                    type={key.endsWith("_url") ? "url" : "text"}
                    maxLength={1000}
                    value={selected.operations[key] || ""}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </label>
              ))}
            <label className="flex items-start gap-3 py-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={selected.automation_enabled}
                onChange={(ev) =>
                  setEditions((es) =>
                    es.map((e) =>
                      e.id === edition
                        ? { ...e, automation_enabled: ev.target.checked }
                        : e,
                    ),
                  )
                }
              />
              <span>
                Autorizar a sequência desta edição. Só participantes com
                pagamento confirmado são elegíveis. Mensagens sem os links
                necessários ficam em espera até completar a configuração.
              </span>
            </label>
            <label className="flex items-start gap-3 py-2 text-sm"><input type="checkbox" className="mt-1" checked={selected.sms_enabled} onChange={ev=>setEditions(es=>es.map(e=>e.id===edition?{...e,sms_enabled:ev.target.checked}:e))}/><span>Autorizar SMS opcionais. Apenas com consentimento, entre as 08h e as 20h de Lisboa. Os envios têm custo no fornecedor.</span></label>
            <label className="flex items-start gap-3 py-2 text-sm"><input type="checkbox" className="mt-1" checked={selected.invoicing_enabled} onChange={ev=>setEditions(es=>es.map(e=>e.id===edition?{...e,invoicing_enabled:ev.target.checked}:e))}/><span>Autorizar emissão de faturas após pagamento e dados completos. Controlo independente das mensagens.</span></label>
            <Button disabled={busy} type="submit">
              {busy ? "A guardar…" : "Guardar configuração"}
            </Button>
          </form>
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Pré-visualizar email
              <select
                className="block mt-2 w-full rounded-md border bg-background p-3"
                aria-label="Pré-visualizar email"
                value={preview}
                onChange={(e) => setPreview(e.target.value)}
              >
                {Object.entries(emailLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            {emailHTML ? (
              <iframe
                title="Pré-visualização do email"
                sandbox=""
                srcDoc={emailHTML}
                className="w-full h-[640px] rounded-xl border bg-white"
              />
            ) : (
              <div className="rounded-xl border p-6">
                <p>
                  Preencha os links necessários para pré-visualizar este email
                  com o conteúdo da edição.
                </p>
              </div>
            )}
            <div className="rounded-xl border p-4 space-y-4"><h3 className="font-semibold">SMS opcionais · pré-visualização</h3>{Object.entries(smsLabels).map(([key,label])=><div key={key}><p className="text-sm font-medium">{label}</p><p className="text-sm text-muted-foreground mt-1">{renderCourseSMS(key,selected.id)}</p></div>)}</div>
            <p className="text-sm text-muted-foreground">
              Pré-visualização apenas. Nenhum email é enviado ao guardar ou ao
              abrir esta vista.
            </p>
          </div>
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Histórico e próximos envios
        </h3>
        <div className="flex flex-wrap gap-3 mb-4"><label className="text-sm">Mostrar<select aria-label="Filtrar operações" className="mt-2 block w-full min-w-0 max-w-full rounded border bg-background p-2 sm:ml-3 sm:mt-0 sm:inline-block sm:w-auto" value={view} onChange={e=>setView(e.target.value)}><option value="pending">Pendentes e problemas</option><option value="history">Histórico: concluídos e cancelados</option></select></label><Button variant="outline" onClick={()=>setRevision(v=>v+1)}>Atualizar operações</Button></div>
        <p className="text-sm text-muted-foreground mb-4">
          Até 100 operações desta seleção. “Aceite pelo
          fornecedor” não confirma a entrega na caixa de entrada.
        </p>
        {loaded && jobs.length === 0 ? (
          <p className="border rounded-xl p-6">
            Não existem operações nesta vista. A sequência é criada após confirmação
            do pagamento; pode consultar também o histórico.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["Participante", "Operação", "Previsto", "Estado"].map(
                    (x) => (
                      <th key={x} className="text-left border-b p-3">
                        {x}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="p-3 border-b">
                      {j.course_registrations.name}
                    </td>
                    <td className="p-3 border-b">
                      {j.kind === "invoice"
                        ? "Fatura-recibo"
                        : (j.kind === "sms" ? smsLabels[j.template] : emailLabels[j.template]) || j.template}
                    </td>
                    <td className="p-3 border-b whitespace-nowrap">
                      {new Date(j.due_at).toLocaleString("pt-PT", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-3 border-b">
                      {states[j.state]}
                      {j.error_code && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          {j.error_code === "billing_data_missing"
                            ? "A aguardar dados de faturação"
                            : j.error_code === "edition_content_missing"
                              ? "Preencher os links desta edição"
                              : ["pre_event_window_closed", "followup_window_closed"].includes(j.error_code)
                                ? "O prazo desta mensagem terminou"
                                : j.state === "review"
                                  ? "Consultar o fornecedor antes de repetir"
                                  : "Verificar configuração do serviço"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
