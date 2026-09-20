import CourseAutomationFlow, {type FlowCount} from "./CourseAutomationFlow";
import EmailEditorPanel,{type EmailTemplate} from "@/components/crm/EmailEditorPanel";
import CourseDiagnostics from "@/components/course/CourseDiagnostics";
import {AutomationTabs} from "@/components/crm/FollowUpView";
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
  starts_at: string;
  ends_at: string;
  label: string;
  automation_enabled: boolean;
  sms_enabled: boolean;
  invoicing_enabled: boolean;
  operations: Record<string, string>;
};
type Job = {
  id: string;
  attempts:number;
  kind: string;
  template: string;
  state: string;
  due_at: string;
  error_code: string | null;
  course_registrations: { name: string; edition: string };
};
export default function CourseOperations({ edition, refresh = 0, communicationOnly = false, onEditionChange }: { edition: string; refresh?: number; communicationOnly?: boolean; onEditionChange?: (edition: string) => void }) {
  const [smsTemplates,setSmsTemplates]=useState<Record<string,{body:string;updated_at:string}>>({}),[smsEditing,setSmsEditing]=useState(""),[smsBody,setSmsBody]=useState(""),[smsError,setSmsError]=useState(""),[smsReady,setSmsReady]=useState(false);
  const [flowCounts,setFlowCounts]=useState<FlowCount[]|null>(null),[registrationCount,setRegistrationCount]=useState<number|null>(null),[templateFilter,setTemplateFilter]=useState(""),[stateFilter,setStateFilter]=useState("");
  const [editing,setEditing]=useState<EmailTemplate|null>(null),[overrides,setOverrides]=useState<Record<string,{subject:string;body:string;updated_at:string;format?:"text"|"html"}>>({});
  const [tab,setTab]=useState("fluxo"),[page,setPage]=useState(0),[counts,setCounts]=useState<Record<string,number>|null>(null),[channel,setChannel]=useState("all");
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
    setJobs([]);setCounts(null);setOverrides({});
    (async () => {
      try {
        let q = db
          .from("course_jobs")
          .select(
            "id,kind,template,state,due_at,error_code,attempts,course_registrations!inner(name,edition)",
          )
          .order("due_at", { ascending: view === "pending" })
          .order("id").range(page*50,page*50+49);
        q = view === "pending" ? q.in("state", ["queued", "blocked", "review", "processing"]) : q.in("state", ["sent", "cancelled"]);
        if(templateFilter)q=q.eq("template",templateFilter);
        if(stateFilter)q=q.eq("state",stateFilter);
        if(channel!=="all")q=q.eq("kind",channel);
        if (edition) q = q.eq("course_registrations.edition", edition);
        const [es, js, hs, totals, templates] = await Promise.all([
          db
            .from("course_editions")
            .select("id,label,starts_at,ends_at,automation_enabled,sms_enabled,invoicing_enabled,operations")
            .order("starts_at"),
          q,
          db
            .from("course_worker_health")
            .select("last_run_at,result")
            .eq("worker", "course-operations")
            .maybeSingle(),
          db.rpc("course_operation_counts",{edition_id:edition||null}),
          db.from("course_email_templates").select("template,subject,body,updated_at,format").eq("edition",edition),
        ]);
        if (es.error || js.error || hs.error || templates.error) throw new Error("load");
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
        setCounts(totals.error ? null : totals.data);
        setOverrides(Object.fromEntries((templates.data||[]).map(x=>[x.template,x])));
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
  }, [edition, refresh, revision, view, page,channel,templateFilter,stateFilter]);
  useEffect(()=>{setPage(0);},[edition,view,channel,templateFilter,stateFilter]);
  useEffect(()=>{setEditing(null);setSmsEditing("");},[edition]);
  useEffect(()=>{
    let active=true;setFlowCounts(null);setRegistrationCount(null);
    if(!edition)return;
    (async()=>{
      const result=await db.from("course_registrations").select("id",{count:"exact",head:true}).eq("edition",edition);
      if(active&&!result.error)setRegistrationCount(result.count);
      const totals=new Map<string,FlowCount>();
      for(let offset=0;;offset+=1000){
        const result=await db.from("course_jobs").select("id,template,state,course_registrations!inner(edition)").eq("course_registrations.edition",edition).order("id").range(offset,offset+999);
        if(!active||result.error)return;
        for(const row of result.data||[]){const key=row.template+":"+row.state;const count=totals.get(key)||{template:row.template,state:row.state,count:0};count.count++;totals.set(key,count);}
        if((result.data||[]).length<1000)break;
      }
      if(active)setFlowCounts([...totals.values()]);
    })().catch(()=>{ /* An unavailable count stays unknown, never zero. */ });
    return()=>{active=false;};
  },[edition,refresh,revision]);
  useEffect(()=>{
    let active=true;setSmsReady(false);setSmsTemplates({});
    db.from("course_sms_templates").select("template,body,updated_at").eq("edition",edition).then(({data,error})=>{if(active&&!error){setSmsTemplates(Object.fromEntries((data||[]).map(t=>[t.template,t])));setSmsReady(true);}});
    return()=>{active=false;};
  },[edition,revision]);
  async function saveSMS(){
    setBusy(true);setSmsError("");
    try{
      const {error}=await db.rpc("save_course_sms_template",{edition_id:edition,template_key:smsEditing,sms_body:smsBody,expected_updated_at:smsTemplates[smsEditing]?.updated_at||null});
      if(error)throw error;
      setSmsEditing("");setRevision(v=>v+1);setNotice("Template SMS guardado. Nenhuma mensagem foi enviada.");
    }catch{setSmsError("Não foi possível guardar. Atualize os templates e tente novamente; outro administrador pode ter alterado este texto.");}
    finally{setBusy(false);}
  }
  async function manage(id:string,action:string) {
    setBusy(true);setError("");
    try {const {error}=await db.rpc("manage_course_job",{job_uuid:id,action});if(error)throw error;setRevision(v=>v+1);}
    catch {setError("A operação não foi alterada. Pode já ter sido processada; atualize para confirmar.");}
    finally {setBusy(false);}
  }
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
  let emailHTML = "",defaultBody="",defaultSubject="";
  try {
    if (selected) {
      const rendered = renderCourseEmail(preview, {
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
      },overrides[preview]);
      emailHTML=rendered.html;defaultBody=rendered.body;defaultSubject=rendered.subject;
    }
  } catch {
    /* Missing actual links are shown as a configuration state, never sent as placeholders. */
  }
  const recent = heartbeat && now - Date.parse(heartbeat) < 20 * 60000;
  return (
    <section className="flex flex-col gap-7 pt-10 md:pt-0" aria-label="Operação das automações">
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
      {loaded && counts && <div className="flex flex-wrap gap-3 text-sm" aria-label="Estado das operações">{[["queued","Agendadas"],["sent","Aceites pelo fornecedor"],["blocked","Bloqueadas"],["review","A verificar"]].map(([key,label])=><button key={key} className="rounded-lg border bg-white px-4 py-3 text-left hover:bg-slate-50" onClick={()=>{setStateFilter(key);setTemplateFilter("");setChannel("all");setView(key==="sent"?"history":"pending");setTab("pessoas");}}><strong className="mr-2">{counts[key]||0}</strong>{" "}{label}</button>)}</div>}
      {loaded && counts && ((counts.blocked||0)+(counts.review||0)>0) && <Alert variant="destructive"><AlertDescription>Há operações que precisam de atenção. Abra «Bloqueadas» para completar a configuração ou «A verificar» para confirmar o resultado no fornecedor antes de repetir um envio.</AlertDescription></Alert>}
      {!communicationOnly && <AutomationTabs value={tab} onChange={setTab} configuration />}
      {!communicationOnly && tab==="metricas" && <div><h3 className="font-semibold mb-4">Operações · total da edição</h3>{counts ? <div className="grid sm:grid-cols-3 gap-4">{Object.entries(states).map(([state,label])=><button key={state} className="rounded-xl border bg-white p-5 text-left" onClick={()=>{setView(["sent","cancelled"].includes(state)?"history":"pending");setStateFilter(state);setTemplateFilter("");setChannel("all");setTab("pessoas");}}><span className="text-sm text-muted-foreground">{label}</span><strong className="block text-2xl mt-2">{counts[state]||0}</strong></button>)}</div>:<p>Contagens indisponíveis. Atualize para tentar novamente.</p>}<p className="text-sm text-muted-foreground mt-3">Aceitação pelo fornecedor não é entrega. Aberturas e cliques não são estimados.</p></div>}
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
      {!communicationOnly && tab==="fluxo" && selected && <CourseAutomationFlow counts={flowCounts} registrations={registrationCount} enabled={selected.automation_enabled} startsAt={selected.starts_at} endsAt={selected.ends_at} onPreview={key=>{if(key in emailLabels)setPreview(key);setTab("templates");if(key in smsLabels)requestAnimationFrame(()=>document.getElementById("course-sms-templates")?.scrollIntoView({block:"start"}));}} onPeople={(key,state)=>{setTemplateFilter(key);setStateFilter(state);setChannel("all");setView(["sent","cancelled"].includes(state)?"history":"pending");setTab("pessoas");}} />}
      {!communicationOnly && tab==="config" && <div className="mb-6"><CourseDiagnostics /></div>}
      {!communicationOnly && selected && ["templates","config"].includes(tab) && (
        <div className="grid lg:grid-cols-2 gap-8">
          {tab==="config" && <form
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
          </form>}
          {tab==="templates" && <div className="space-y-4 lg:col-span-2">
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
            <Button variant="outline" disabled={!emailHTML} onClick={()=>setEditing({template_key:preview,name:emailLabels[preview],subject:defaultSubject,html_body:defaultBody,updated_at:overrides[preview]?.updated_at||"",updated_by:null})}>Editar este template</Button>
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
            <div className="rounded-xl border p-4 space-y-5" id="course-sms-templates"><h3 className="font-semibold">SMS opcionais</h3>{!smsReady&&<p role="status" className="text-sm">Templates SMS indisponíveis. A edição fica disponível após carregar a configuração do backend.</p>}{Object.entries(smsLabels).map(([key,label])=><div key={key} className="border-t pt-4"><h4 className="text-sm font-semibold">{label}</h4><p className="text-sm text-slate-600 mt-2 break-words">{smsReady?(smsTemplates[key]?.body||renderCourseSMS(key,selected.id)):"A aguardar o template guardado."}</p>{smsEditing===key?<div className="mt-3 space-y-3"><label className="block text-sm">Texto do SMS<textarea className="mt-2 w-full rounded-md border p-3 text-sm" rows={4} maxLength={160} value={smsBody} onChange={e=>setSmsBody(e.target.value)}/></label><p className="text-xs text-slate-600">{smsBody.length}/160 caracteres · um SMS. Utilize texto sem acentos nem caracteres especiais.</p>{smsError&&<p role="alert" className="text-sm text-red-700">{smsError}</p>}<div className="flex gap-2"><Button disabled={busy||smsBody.trim().length<10||/[^ -~]|[\[\]{}^~|\\]/.test(smsBody)} onClick={()=>void saveSMS()}>Guardar SMS</Button><Button variant="ghost" onClick={()=>setSmsEditing("")}>Cancelar</Button></div></div>:<Button variant="outline" size="sm" className="mt-3" disabled={!smsReady} onClick={()=>{setSmsEditing(key);setSmsBody(smsTemplates[key]?.body||renderCourseSMS(key,selected.id));setSmsError("");}}>Editar SMS</Button>}</div>)}</div>
            <p className="text-sm text-muted-foreground">
              Pré-visualização apenas. Nenhum email é enviado ao guardar ou ao
              abrir esta vista.
            </p>
          </div>}
        </div>
      )}
      {(communicationOnly || tab==="pessoas") && <div>
        <h3 className="text-lg font-semibold mb-4">
          Histórico e próximos envios
        </h3>
        {(templateFilter||stateFilter)&&<div className="mb-4 flex flex-wrap items-center gap-3 text-sm"><span>{emailLabels[templateFilter]||smsLabels[templateFilter]||"Todas as mensagens"} · {states[stateFilter]||"Todos os estados"}</span><Button variant="ghost" onClick={()=>{setTemplateFilter("");setStateFilter("");}}>Limpar filtros</Button></div>}
        <div className="flex flex-wrap gap-3 mb-4"><label className="text-sm">Mostrar<select aria-label="Filtrar operações" className="mt-2 block w-full min-w-0 max-w-full rounded border bg-background p-2 sm:ml-3 sm:mt-0 sm:inline-block sm:w-auto" value={view} onChange={e=>{setView(e.target.value);setStateFilter("");}}><option value="pending">Pendentes e problemas</option><option value="history">Histórico: concluídos e cancelados</option></select></label><label className="text-sm">Canal<select aria-label="Canal das operações" className="ml-2 rounded border bg-background p-2" value={channel} onChange={e=>setChannel(e.target.value)}><option value="all">Todos</option><option value="email">Email</option><option value="sms">SMS</option><option value="invoice">Faturação</option></select></label><Button variant="outline" onClick={()=>setRevision(v=>v+1)}>Atualizar operações</Button></div>
        <p className="text-sm text-muted-foreground mb-4">
          50 operações por página, filtradas no servidor. “Aceite pelo
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
                  {["Participante", "Operação", "Previsto", "Estado", "Ações"].map(
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
                        : (j.kind === "sms" ? smsLabels[j.template] : emailLabels[j.template]) || (j.template.startsWith("manual_") ? "Comunicação manual" : j.template)}
                    </td>
                    <td className="p-3 border-b whitespace-nowrap">
                      {new Date(j.due_at).toLocaleString("pt-PT", {
                        dateStyle: "short",
                        timeZone: "Europe/Lisbon",
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
                    <td className="p-3 border-b">{j.attempts===0 && ["queued","blocked"].includes(j.state) && <div className="flex flex-wrap gap-2">{j.state==="blocked" && <Button variant="outline" size="sm" disabled={busy} onClick={()=>void manage(j.id,"retry")}>Voltar à fila</Button>}<Button variant="ghost" size="sm" disabled={busy} onClick={()=>{if(window.confirm("Cancelar esta operação ainda não tentada?"))void manage(j.id,"cancel");}}>Cancelar</Button></div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <div className="flex items-center gap-3 mt-4"><Button variant="outline" disabled={page===0 || !loaded} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span className="text-sm">Página {page+1}</span><Button variant="outline" disabled={jobs.length<50 || !loaded} onClick={()=>setPage(p=>p+1)}>Seguinte</Button></div>
      </div>}
      {selected && <EmailEditorPanel template={editing} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);setRevision(v=>v+1);}} course={{label:selected.label,format:(overrides[editing?.template_key||""]?.format as "text"|"html")||"text",save:async(subject,body,format)=>{const {data,error}=await db.rpc("save_course_email_template",{edition_id:selected.id,template_key:editing!.template_key,email_subject:subject,email_body:body,expected_updated_at:editing!.updated_at||null,body_format:format});if(error)throw error;return data;},render:(subject,body,format)=>{try{return renderCourseEmail(editing!.template_key,{...selected.operations,name:"Participante",edition:selected.id,label:selected.label,schedule:selected.operations.schedule||"",portal_url:"https://fredericocarvalho.pt/curso-de-inteligencia-artificial/",resources_url:selected.operations.resources_url||"https://imagenscomia.com/curso-ia/recursos",recordings_url:selected.operations.recordings_url||"https://imagenscomia.com/curso-ia/recursos"},{subject,body,format}).html;}catch{return "Pré-visualização indisponível: verifique os campos e a configuração da edição.";}}}} />}
    </section>
  );
}
