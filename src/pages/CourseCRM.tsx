import DashboardView from "@/components/crm/DashboardView";
import PipelineView from "@/components/crm/PipelineView";
import TableView from "@/components/crm/TableView";
import FaturacaoView from "@/components/crm/FaturacaoView";
import InscritoModal from "@/components/crm/InscritoModal";
import {courseToInscrito, type CourseRow as Row, type CourseMetrics as Metrics} from "@/lib/course/crmAdapter";
import CRMSidebar, { type CRMView } from "@/components/crm/CRMSidebar";
import { WebinarProvider } from "@/contexts/WebinarContext";


import CourseMaterials from "@/components/course/CourseMaterials";
import CourseOperations from "@/components/course/CourseOperations";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import CRMLogin from "@/components/crm/CRMLogin";

import {
  editionNames,
  states,
  taskNames,
  automationSteps,
} from "@/lib/course/editions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
const db = supabase as unknown as SupabaseClient;
const date = (value: string) =>
  new Date(value).toLocaleString("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  });
const selectClass =
  "h-11 rounded-md border border-input bg-background px-3 text-sm";
export default function CourseCRM() { return <WebinarProvider><CourseCRMContent /></WebinarProvider>; }
function CourseCRMContent() {
  const [activeView, setActiveView] = useState<CRMView>("dashboard");


  const [auth, setAuth] = useState<boolean | null>(null),
    [rows, setRows] = useState<Row[]>([]),
    [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [edition, setEdition] = useState(""),
    [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Row | null>(null),
    [saving, setSaving] = useState(false),
    [invoiceRef, setInvoiceRef] = useState("");
  const [period, setPeriod] = useState("all");
  const [operationRefresh, setOperationRefresh] = useState(0);
  const sequence = useRef(0);
  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setAuth(false);
        return;
      }
      const { data: aal } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const { data: admin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      setAuth(aal?.currentLevel === "aal2" && admin === true);
    } catch {
      setAuth(false);
    }
  }, []);
  useEffect(() => {
    void checkAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        sequence.current++;
        setAuth(false);
        setRows([]);
        setMetrics(null);
        setSelected(null);
      }
    });
    return () => {
      sequence.current++;
      subscription.unsubscribe();
    };
  }, [checkAuth]);
  const load = useCallback(
    async () => {
      if (!auth) return;
      const request = ++sequence.current;
      setOperationRefresh(v=>v+1);
      setLoading(true);
      setError("");
      try {
        const fetchRows = async () => {
          const data: any[] = [];
          for (let start = 0; ; start += 500) {
            let query = db.from("course_registrations").select("id,name,email,phone,edition,status,notes,next_followup_at,created_at,marketing_consent,before_session,after_session,attribution,course_editions(starts_at,ends_at),course_payments(state,amount_cents,paid_at),course_invoices(state,document_id),course_tasks(id,task_key,stage,due_at,state)").order("created_at",{ascending:false}).order("id").range(start,start+499);
            if (edition) query=query.eq("edition",edition);
            const batch=await query;
            if (request !== sequence.current || batch.error) return batch;
            data.push(...(batch.data || []));
            if ((batch.data || []).length<500) return {data,error:null};
          }
        };
        const [items, kpis] = await Promise.all([
          fetchRows(),
          db.rpc("course_period_metrics", { edition_id: edition || null, since: period === "all" ? null : new Date(Date.now()-Number(period)*86400000).toISOString() }),
        ]);
        if (request !== sequence.current) return;
        if (items.error || kpis.error) throw new Error("Backend unavailable");
        const received = items.data.map((item) => ({
          ...item,
          course_editions: Array.isArray(item.course_editions) ? item.course_editions[0] || null : item.course_editions,
          course_payments: Array.isArray(item.course_payments)
            ? item.course_payments[0] || null
            : item.course_payments,
          course_invoices: Array.isArray(item.course_invoices)
            ? item.course_invoices[0] || null
            : item.course_invoices,
        })) as Row[];
        setRows(received);
        setMetrics(kpis.data);
      } catch {
        if (request === sequence.current) {
          setRows([]);
          setMetrics(null);
          setError(
            "Não foi possível carregar o curso. Confirme a instalação das migrações e as permissões de administrador com 2FA.",
          );
        }
      } finally {
        if (request === sequence.current) setLoading(false);
      }
    },
    [auth, edition, status, period],
  );
  useEffect(() => {
    setRows([]);
    setSelected(null);
    void load();
  }, [load]);
  async function save() {
    if (!selected) return;
    setSaving(true);
    setError("");
    const { error } = await db.rpc("update_course_request", {
      request_uuid: selected.id,
      new_status: selected.status,
      new_notes: selected.notes,
      followup: selected.next_followup_at || null,
    });
    if (error)
      setError(
        "Não foi possível guardar. A confirmação de inscrição depende do pagamento validado.",
      );
    else {
      setSelected(null);
      await load();
    }
    setSaving(false);
  }
  async function invoice() {
    if (!selected || !invoiceRef.trim()) return;
    setSaving(true);
    const { error } = await db.rpc("record_course_invoice", {
      request_uuid: selected.id,
      external_document_id: invoiceRef.trim(),
    });
    if (error)
      setError(
        "Não foi possível registar a referência. Confirme o pagamento e o documento emitido.",
      );
    else {
      setSelected(null);
      await load();
    }
    setSaving(false);
  }
  async function setSession(phase: string, state: string) {
    if (!selected) return;
    setSaving(true);
    try {
      const { error }=await db.rpc("set_course_session",{request_uuid:selected.id,phase,session_state:state});
      if(error)throw error;
      setSelected(row=>row?{...row,[phase+"_session"]:state}:row);
      setOperationRefresh(v=>v+1);
    } catch { setError("Não foi possível atualizar a sessão. Verifique se a inscrição está confirmada."); }
    finally { setSaving(false); }
  }
  async function finish(id: string) {
    const { error } = await db.rpc("finish_course_task", { task_uuid: id });
    if (error) setError("Não foi possível concluir a tarefa.");
    else await load();
  }
  function open(row: Row) {
    setSelected({ ...row });
    setInvoiceRef(row.course_invoices?.document_id || "");
  }
  const participants = rows.map(row=>courseToInscrito(row));
  const selectParticipant = (item: {id:string}) => {const row=rows.find(r=>r.id===item.id);if(row)open(row);};
  const moveParticipant = async (id:string, state:string) => {
    const row=rows.find(r=>r.id===id);
    if(!row || state==='confirmed' || row.course_payments?.state==='paid') { if(row)open(row); return; }
    const {error}=await db.rpc("update_course_request",{request_uuid:id,new_status:state,new_notes:row.notes,followup:row.next_followup_at});
    if(error)setError("Não foi possível atualizar o estado. Abra a ficha para verificar.");
    else await load();
  };

  if (auth === null)
    return <main className="p-8">A verificar o acesso ao CRM…</main>;
  if (!auth) return <CRMLogin onLogin={() => void checkAuth()} />;
  return (
    <div className="flex min-h-screen bg-off-white">
      <CRMSidebar activeView={activeView} onChangeView={v=>{setActiveView(v);setStatus("");setSelected(null);}} onLogout={()=>void supabase.auth.signOut()} course={{edition,onEditionChange:e=>{setEdition(e);setStatus("");}}} />
      <main className="flex-1 min-w-0 md:ml-[240px] overflow-x-hidden">
      <div className="flex flex-col gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Tabs value={activeView==="tabela"?"inscricoes":activeView==="templates"?"automacoes":activeView} className="w-full">
          <TabsContent value="dashboard" className="mt-0"><DashboardView inscritos={participants} onSelectInscrito={selectParticipant} onRefresh={()=>void load()} course={{metrics,period,onPeriodChange:setPeriod,loading}} /></TabsContent>
          <TabsContent value="pipeline"><PipelineView key={edition} inscritos={participants} onSelectInscrito={selectParticipant} course={{onMove:moveParticipant}} /></TabsContent>
          <TabsContent value="inscricoes"><TableView key={edition} inscritos={participants} onSelectInscrito={selectParticipant} course /></TabsContent>
          <TabsContent value="faturacao"><FaturacaoView inscritos={participants} onRefresh={()=>void load()} course={{edition,onEditionChange:setEdition,onSelectInscrito:selectParticipant}} /></TabsContent>
          <TabsContent value="comunicacao" className="p-7 max-sm:p-4"><CourseOperations edition={edition} refresh={operationRefresh} communicationOnly /></TabsContent>
          <TabsContent value="recursos" className="p-7 max-sm:p-4"><CourseMaterials edition={edition} /></TabsContent>
          <TabsContent value="automacoes" className="p-7 max-sm:p-4">
            <CourseOperations edition={edition} refresh={operationRefresh} />
            <div className="mt-10">
              <div className="flex flex-col gap-5">
                <div>
                  <Badge variant="secondary">
                    Fluxo e tarefas de acompanhamento
                  </Badge>
                  <p className="text-muted-foreground mt-3">
                    {edition
                      ? "Fluxo da edição selecionada."
                      : "Selecione Lisboa, Porto ou Online para ver o contexto de cada edição. O percurso abaixo é comum às edições presenciais."}
                  </p>
                </div>
                <div className="grid lg:grid-cols-3 gap-4">
                  {automationSteps(edition).map((step, i) => (
                    <Card key={step.phase}>
                      <CardHeader>
                        <CardDescription>
                          0{i + 1} · {step.phase}
                        </CardDescription>
                        <CardTitle>{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="flex flex-col gap-3 list-disc pl-5">
                          {step.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <p className="text-sm text-muted-foreground">
                          {step.note}
                        </p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Tarefas de acompanhamento</CardTitle>
                    <CardDescription>
                      Participantes carregados nesta seleção. Marcar como
                      concluída não envia mensagens.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {rows.flatMap((r) =>
                      r.course_tasks
                        .filter((t) => t.state === "pending")
                        .map((t) => (
                          <div
                            key={t.id}
                            className="flex flex-wrap justify-between gap-4 border-b pb-3"
                          >
                            <div>
                              <strong>
                                {taskNames[t.task_key] || t.task_key}
                              </strong>
                              <p className="text-sm text-muted-foreground">
                                {r.name} · {editionNames[r.edition]} ·{" "}
                                {date(t.due_at)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => void finish(t.id)}
                            >
                              Concluir
                            </Button>
                          </div>
                        )),
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {loading && <p role="status">A carregar…</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="text-muted-foreground">
            Ainda não existem inscrições para esta seleção.
          </p>
        )}
        {selected && (
          <InscritoModal inscrito={courseToInscrito(selected)} todos={participants} onClose={()=>setSelected(null)} onSelectInscrito={selectParticipant} courseContent={<div id="course-detail" className="space-y-5">
            <CardContent className="flex flex-col gap-5">
              <p className="text-sm text-muted-foreground">
                Origem: {selected.attribution.utm_source || "Não atribuída"} ·
                Campanha: {selected.attribution.utm_campaign || "—"} ·
                Marketing:{" "}
                {selected.marketing_consent ? "autorizado" : "não autorizado"}.
              </p>
              <Label className="flex flex-col gap-2">
                Estado
                <select
                  className={selectClass}
                  value={selected.status}
                  onChange={(e) =>
                    setSelected({ ...selected, status: e.target.value })
                  }
                >
                  {Object.entries(states)
                    .filter(([v]) =>
                      selected.course_payments?.state === "paid"
                        ? v === "confirmed"
                        : v !== "confirmed",
                    )
                    .map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                </select>
              </Label>
              {selected.status === "confirmed" && <div className="grid gap-4 sm:grid-cols-2">{["before", "after"].map(phase=><label key={phase} className="flex flex-col gap-2 text-sm font-medium">Sessão individual {phase === "before" ? "antes" : "depois"}<select className={selectClass} disabled={saving} value={phase === "before" ? selected.before_session : selected.after_session} onChange={ev=>void setSession(phase,ev.target.value)}><option value="pending">Por agendar</option><option value="booked">Agendada</option><option value="completed">Concluída</option></select></label>)}<p className="text-sm text-muted-foreground sm:col-span-2">Agendada ou concluída: cancela os lembretes ainda por enviar. Voltar a “Por agendar” não reenvia mensagens automaticamente.</p></div>}
              <Label className="flex flex-col gap-2">
                Notas internas
                <Textarea
                  maxLength={4000}
                  rows={4}
                  value={selected.notes}
                  onChange={(e) =>
                    setSelected({ ...selected, notes: e.target.value })
                  }
                />
              </Label>
              <Label className="flex flex-col gap-2">
                Próximo contacto (hora local)
                <Input
                  type="datetime-local"
                  value={
                    selected.next_followup_at
                      ? new Date(
                          new Date(selected.next_followup_at).getTime() -
                            new Date(
                              selected.next_followup_at,
                            ).getTimezoneOffset() *
                              60000,
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      next_followup_at: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                />
              </Label>
              {selected.course_payments?.state === "paid" && (
                <div className="flex flex-col gap-3 border-t pt-5">
                  <Label htmlFor="invoice-ref">
                    Referência da fatura já emitida no InvoiceXpress
                  </Label>
                  <Input
                    id="invoice-ref"
                    maxLength={100}
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    disabled={saving || !invoiceRef.trim()}
                    onClick={() => void invoice()}
                  >
                    Registar referência fiscal
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="gap-3">
              <Button disabled={saving} onClick={() => void save()}>
                {saving ? "A guardar…" : "Guardar acompanhamento"}
              </Button>
              <Button
                variant="ghost"
                disabled={saving}
                onClick={() => setSelected(null)}
              >
                Fechar
              </Button>
            </CardFooter>
          </div>} />
        )}
      </div>
    </main></div>
  );
}
