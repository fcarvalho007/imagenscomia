import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Report = {
  checks: Record<string, boolean>;
  switches: Record<string, boolean | string>;
  worker: { last_run_at: string | null; result: string | null };
  cron_installed: boolean | null;
  jobs?: { totals: Record<string, number>; per_edition: Record<string, Record<string, number>> };
};

const jobStateLabels: Record<string, string> = {
  queued: "em fila",
  processing: "a processar",
  sent: "enviados",
  blocked: "retidos",
  review: "em revisão",
  cancelled: "cancelados",
};

const editionLabels: Record<string, string> = { lisboa: "Lisboa", porto: "Porto", online: "Online" };

const STALE_MINUTES = 15;

const checkLabels: Record<string, string> = {
  email_configured: "Envio de email configurado",
  sms_configured: "Envio de SMS configurado",
  invoice_configured: "Faturação configurada",
  worker_secret_configured: "Chave do processo automático",
  public_url_configured: "Endereços públicos definidos",
};

const switchLabels: Record<string, string> = {
  email_enabled: "Emails automáticos",
  sms_enabled: "SMS automáticos",
  invoicing_enabled: "Faturação automática",
  payments_enabled: "Pagamentos",
};

export default function CourseDiagnostics() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cronBusy, setCronBusy] = useState(false);
  const [cronState, setCronState] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: invokeError } = await supabase.functions.invoke("course-diagnostics", { body: {} });
    if (invokeError) setError("Não foi possível ler o diagnóstico.");
    else setReport(data as Report);
    setLoading(false);
  }, []);

  const runCron = useCallback(
    async (action: "install" | "uninstall") => {
      setCronBusy(true);
      setCronState(null);
      const { data, error: invokeError } = await supabase.functions.invoke("course-cron-setup", { body: { action } });
      const result = data as { state?: string; error?: string } | null;
      if (invokeError || result?.error) setCronState("não foi possível concluir");
      else setCronState(result?.state || "concluído");
      setCronBusy(false);
      await load();
    },
    [load],
  );

  useEffect(() => {
    load();
  }, [load]);

  const disabledChannels = report
    ? (Object.entries(switchLabels) as [string, string][]).filter(([key]) => !report.switches[key]).map(([, label]) => label)
    : [];
  const workerStale = (() => {
    if (!report?.worker.last_run_at) return false;
    return Date.now() - new Date(report.worker.last_run_at).getTime() > STALE_MINUTES * 60_000;
  })();
  const workerFailed = Boolean(report?.worker.result && report.worker.result !== "ok");

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Diagnóstico da operação</h3>
          <p className="text-xs text-slate-500">Apenas leitura. Mostra o que está configurado, nunca as chaves.</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Atualizar
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {report && disabledChannels.length > 0 && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          <AlertTriangle size={13} className="text-amber-500" />
          Canais desligados: {disabledChannels.join(" · ")}. Nada é enviado ou cobrado enquanto estiverem assim.
        </p>
      )}

      {report && report.cron_installed && (workerStale || workerFailed) && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <XCircle size={13} />
          {workerFailed
            ? `A última execução do processo terminou com resultado "${report.worker.result}".`
            : "O processo automático está atrasado: sem execução há mais de 15 minutos."}
        </p>
      )}

      {report && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Configuração</p>
            <ul className="mt-2 space-y-1.5">
              {Object.entries(report.checks).map(([key, ok]) => (
                <li key={key} className="flex items-center gap-2 text-sm text-slate-700">
                  {ok ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-red-500" />}
                  {checkLabels[key] || key}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado dos canais</p>
            <ul className="mt-2 space-y-1.5">
              {Object.entries(switchLabels).map(([key, label]) => (
                <li key={key} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className={`h-2 w-2 rounded-full ${report.switches[key] ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {label}: {report.switches[key] ? "ativo" : "desligado"}
                </li>
              ))}
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Ambiente de pagamento: {String(report.switches.payment_environment)}
              </li>
            </ul>
          </div>
          <div className="md:col-span-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <p className="flex items-center gap-2">
              {report.cron_installed ? (
                <CheckCircle2 size={14} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={14} className="text-amber-500" />
              )}
              Agendamento automático: {report.cron_installed === null ? "indeterminado" : report.cron_installed ? "instalado" : "por instalar"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Última execução do processo:{" "}
              {report.worker.last_run_at ? new Date(report.worker.last_run_at).toLocaleString("pt-PT") : "ainda não correu"}
              {report.worker.result ? ` · ${report.worker.result}` : ""}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              A instalação usa a chave já guardada. Nenhuma chave é criada, mostrada ou registada.
            </p>
            {cronState && <p className="mt-1 text-xs text-slate-600">Resultado: {cronState}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => runCron("install")}
                disabled={cronBusy}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {cronBusy ? "A processar…" : "Instalar agendamento"}
              </button>
              <button
                onClick={() => runCron("uninstall")}
                disabled={cronBusy}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
              >
                Remover agendamento
              </button>
            </div>
          </div>
          {report.jobs && (
            <div className="md:col-span-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Envios por edição</p>
              {Object.keys(report.jobs.per_edition).length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">Sem mensagens agendadas ou enviadas — ainda não há inscritos.</p>
              ) : (
                <table className="mt-2 w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <th className="py-1 pr-2">Edição</th>
                      {Object.keys(jobStateLabels).map((state) => (
                        <th key={state} className="py-1 pr-2">{jobStateLabels[state]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(report.jobs.per_edition).map(([edition, counts]) => (
                      <tr key={edition} className="border-t border-slate-200">
                        <td className="py-1 pr-2 font-semibold">{editionLabels[edition] || edition}</td>
                        {Object.keys(jobStateLabels).map((state) => (
                          <td key={state} className="py-1 pr-2">{counts[state] ?? 0}</td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-t border-slate-300 font-semibold">
                      <td className="py-1 pr-2">Total</td>
                      {Object.keys(jobStateLabels).map((state) => (
                        <td key={state} className="py-1 pr-2">{report.jobs!.totals[state] ?? 0}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
