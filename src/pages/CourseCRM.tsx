import CourseMaterials from "@/components/course/CourseMaterials";
import CourseOperations from "@/components/course/CourseOperations";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import CRMLogin from "@/components/crm/CRMLogin";
import { EDITIONS } from "@/lib/course/contract";
import {
  editionNames,
  states,
  taskNames,
  automationSteps,
  money,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
const db = supabase as unknown as SupabaseClient;
type Task = {
  id: string;
  task_key: string;
  stage: string;
  due_at: string;
  state: string;
};
type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  edition: string;
  status: string;
  notes: string;
  next_followup_at: string | null;
  created_at: string;
  marketing_consent: boolean;
  before_session: string;
  after_session: string;
  attribution: Record<string, string>;
  course_payments: {
    state: string;
    amount_cents: number;
    paid_at: string | null;
  } | null;
  course_invoices: { state: string; document_id: string | null } | null;
  course_tasks: Task[];
};
type Metrics = {
  sessions: number;
  quiz_completed: number;
  pricing_sessions: number;
  registration_sessions: number;
  requests: number;
  confirmed: number;
  followups_due: number;
  revenue_cents: number;
  tasks_due: number;
};
const date = (value: string) =>
  new Date(value).toLocaleString("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  });
const selectClass =
  "h-11 rounded-md border border-input bg-background px-3 text-sm";
export default function CourseCRM() {
  const [auth, setAuth] = useState<boolean | null>(null),
    [rows, setRows] = useState<Row[]>([]),
    [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [edition, setEdition] = useState(""),
    [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Row | null>(null),
    [saving, setSaving] = useState(false),
    [hasMore, setHasMore] = useState(false),
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
    async (offset = 0) => {
      if (!auth) return;
      const request = ++sequence.current;
      if (!offset) setOperationRefresh(v=>v+1);
      setLoading(true);
      setError("");
      try {
        let query = db
          .from("course_registrations")
          .select(
            "id,name,email,phone,edition,status,notes,next_followup_at,created_at,marketing_consent,before_session,after_session,attribution,course_payments(state,amount_cents,paid_at),course_invoices(state,document_id),course_tasks(id,task_key,stage,due_at,state)",
          )
          .order("created_at", { ascending: false })
          .order("id")
          .range(offset, offset + 49);
        if (edition) query = query.eq("edition", edition);
        if (status) query = query.eq("status", status);
        const [items, kpis] = await Promise.all([
          query,
          db.rpc("course_period_metrics", { edition_id: edition || null, since: period === "all" ? null : new Date(Date.now()-Number(period)*86400000).toISOString() }),
        ]);
        if (request !== sequence.current) return;
        if (items.error || kpis.error) throw new Error("Backend unavailable");
        const received = items.data.map((item) => ({
          ...item,
          course_payments: Array.isArray(item.course_payments)
            ? item.course_payments[0] || null
            : item.course_payments,
          course_invoices: Array.isArray(item.course_invoices)
            ? item.course_invoices[0] || null
            : item.course_invoices,
        })) as Row[];
        setRows((prev) => (offset ? [...prev, ...received] : received));
        setHasMore(items.data.length === 50);
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
    setTimeout(
      () =>
        document
          .getElementById("course-detail")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      30,
    );
  }
  if (auth === null)
    return <main className="p-8">A verificar o acesso ao CRM…</main>;
  if (!auth) return <CRMLogin onLogin={() => void checkAuth()} />;
  return (
    <main className="min-h-screen bg-background text-foreground p-5 md:p-9">
      <div className="mx-auto max-w-7xl flex flex-col gap-7">
        <header className="flex flex-wrap justify-between gap-5 items-start">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              WebinarCRM / Curso de inteligência artificial
            </p>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-2">
                Projeto
                <select
                  className={selectClass}
                  value="curso-ia"
                  onChange={(e) => {
                    if (e.target.value !== "curso-ia")
                      window.location.assign("/crm?webinar=" + e.target.value);
                  }}
                >
                  <option value="curso-ia">
                    Curso de IA aplicada ao negócio
                  </option>
                  <option value="imagens">Webinar Imagens IA</option>
                  <option value="video">Webinar Vídeo IA</option>
                  <option value="consolidado">Todos os webinars</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                Edição
                <select
                  className={selectClass}
                  value={edition}
                  onChange={(e) => {
                    setEdition(e.target.value);
                    setStatus("");
                  }}
                >
                  <option value="">Visão geral das três edições</option>
                  {EDITIONS.map((id) => (
                    <option value={id} key={id}>
                      {editionNames[id]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <h1 className="text-3xl font-semibold mt-6">
              {edition ? editionNames[edition] : "Um curso. Três edições."}
            </h1>
            <p className="text-muted-foreground mt-2">
              Inscrições, pagamentos e acompanhamento, no mesmo lugar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {import.meta.env.DEV && <Button variant="outline" asChild><a href="/curso-ia/checkout-demonstracao">Ver checkout de demonstração</a></Button>}
            <Button
              variant="outline"
              onClick={() => void load()}
              disabled={loading}
            >
              Atualizar
            </Button>
            <Button
              variant="ghost"
              onClick={() => void supabase.auth.signOut()}
            >
              Sair
            </Button>
          </div>
        </header>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap items-center gap-4"><label className="text-sm font-medium">Período dos indicadores <select className={selectClass + " ml-3"} value={period} onChange={ev=>setPeriod(ev.target.value)}><option value="all">Desde o início</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option></select></label><p className="text-sm text-muted-foreground">Pedidos pela data de entrada; pagamentos pela data de confirmação. Tarefas vencidas: situação atual.</p></div>
        <section
          aria-label="Indicadores da edição"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            ["Inscrições iniciadas", metrics?.requests],
            ["Pagamentos confirmados", metrics?.confirmed],
            [
              "Recebido, com IVA",
              metrics ? money(metrics.revenue_cents) : undefined,
            ],
            ["Tarefas vencidas", metrics?.tasks_due],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle>{value ?? "—"}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </section>
        <Tabs
          onValueChange={(view) => {
            if (view !== "inscricoes") setStatus("");
          }}
          defaultValue="dashboard"
          className="flex flex-col gap-5"
        >
          <div className="overflow-x-auto">
            <TabsList aria-label="Áreas do CRM">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="inscricoes">Inscrições</TabsTrigger>
              <TabsTrigger value="faturacao">Faturação</TabsTrigger>
              <TabsTrigger value="automacoes">Automações</TabsTrigger>
              <TabsTrigger value="recursos">Recursos</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Da visita à inscrição</CardTitle>
                  <CardDescription>
                    Navegação global da landing page, apenas com consentimento.
                    Os pedidos e pagamentos acima seguem a edição escolhida. As tabelas mostram todas as inscrições; o período filtra apenas os indicadores.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="flex flex-col gap-4">
                    {[
                      ["Visitaram a página", metrics?.sessions],
                      ["Concluíram o questionário", metrics?.quiz_completed],
                      ["Consultaram os preços", metrics?.pricing_sessions],
                      [
                        "Abriram a inscrição desta seleção",
                        metrics?.registration_sessions,
                      ],
                    ].map(([label, value]) => (
                      <li
                        className="flex justify-between gap-4 border-b pb-3"
                        key={String(label)}
                      >
                        <span>{label}</span>
                        <strong>{value ?? "—"}</strong>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Próximos passos</CardTitle>
                  <CardDescription>
                    Depois do pagamento, cada participante tem tarefas de pré e
                    pós-evento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    {metrics?.followups_due ?? "—"} contactos agendados estão
                    por realizar. Consulte Automações para as tarefas da turma.
                  </p>
                  <Alert>
                    <AlertDescription>
                      Consulte Automações para configurar os emails de cada
                      edição e acompanhar os envios. Pagamentos, mensagens e
                      faturas têm estados separados para identificar o que falta
                      fazer.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="pipeline">
            <p className="text-sm text-muted-foreground mb-4">
              Percurso comercial. Apresenta os {rows.length} registos
              carregados; use “Carregar mais” para consultar os restantes.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {Object.entries(states).map(([state, label]) => (
                <Card key={state}>
                  <CardHeader>
                    <CardTitle className="text-base">{label}</CardTitle>
                    <CardDescription>
                      {rows.filter((r) => r.status === state).length} carregados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {rows
                      .filter((r) => r.status === state)
                      .map((r) => (
                        <Button
                          key={r.id}
                          variant="outline"
                          className="h-auto text-left justify-start whitespace-normal"
                          onClick={() => open(r)}
                        >
                          {r.name}
                        </Button>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="inscricoes">
            <label className="flex flex-col gap-2 mb-5 max-w-xs">
              Estado
              <select
                className={selectClass}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Todos os estados</option>
                {Object.entries(states).map(([v, l]) => (
                  <option value={v} key={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Inscrições da edição selecionada
                </caption>
                <thead>
                  <tr>
                    {[
                      "Participante",
                      "Edição",
                      "Estado",
                      "Próximo contacto",
                      "",
                    ].map((l, i) => (
                      <th key={i} className="text-left p-4 border-b">
                        {l}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="p-4 border-b">
                        <strong>{r.name}</strong>
                        <span className="block text-muted-foreground">
                          {r.email}
                        </span>
                      </td>
                      <td className="p-4 border-b">
                        {editionNames[r.edition]}
                      </td>
                      <td className="p-4 border-b">{states[r.status]}</td>
                      <td className="p-4 border-b">
                        {r.next_followup_at
                          ? date(r.next_followup_at)
                          : "Por agendar"}
                      </td>
                      <td className="p-4 border-b">
                        <Button variant="ghost" onClick={() => open(r)}>
                          Acompanhar<span className="sr-only"> {r.name}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="faturacao">
            <Alert className="mb-5">
              <AlertDescription>
                Pagamentos e documentos separados por edição. A emissão no
                InvoiceXpress depende dos dados de faturação e da ativação do
                serviço. Operações incertas ficam para verificação, sem repetir
                documentos automaticamente.
              </AlertDescription>
            </Alert>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Faturação da edição</caption>
                <thead>
                  <tr>
                    {[
                      "Participante",
                      "Edição",
                      "Pagamento",
                      "Valor com IVA",
                      "Documento fiscal",
                      "",
                    ].map((l, i) => (
                      <th key={i} className="text-left p-4 border-b">
                        {l}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .filter((r) => r.course_payments)
                    .map((r) => (
                      <tr key={r.id}>
                        <td className="p-4 border-b">{r.name}</td>
                        <td className="p-4 border-b">
                          {editionNames[r.edition]}
                        </td>
                        <td className="p-4 border-b">
                          {r.course_payments?.state === "paid"
                            ? "Pago"
                            : r.course_payments?.state === "refunded"
                              ? "Reembolsado"
                              : r.course_payments?.state === "review"
                                ? "Verificação necessária"
                                : r.course_payments?.state === "expired"
                                  ? "Expirado"
                                  : r.course_payments?.state === "cancelled"
                                    ? "Cancelado"
                                    : "Pendente"}
                        </td>
                        <td className="p-4 border-b">
                          {money(r.course_payments!.amount_cents)}
                        </td>
                        <td className="p-4 border-b">
                          {r.course_invoices?.document_id || "Por emitir"}
                        </td>
                        <td className="p-4 border-b">
                          <Button variant="ghost" onClick={() => open(r)}>
                            Ver detalhe
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="recursos"><CourseMaterials edition={edition} /></TabsContent>
          <TabsContent value="automacoes">
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
        {hasMore && (
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => void load(rows.length)}
          >
            Carregar mais inscrições
          </Button>
        )}
        {selected && (
          <Card id="course-detail" className="scroll-mt-6">
            <CardHeader>
              <CardTitle>{selected.name}</CardTitle>
              <CardDescription>
                {selected.email} · {selected.phone || "Telefone não indicado"} ·{" "}
                {editionNames[selected.edition]}
              </CardDescription>
            </CardHeader>
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
          </Card>
        )}
      </div>
    </main>
  );
}
