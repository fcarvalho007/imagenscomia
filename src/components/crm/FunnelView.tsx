import { Check, Zap, Circle, Minus } from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";

interface Props {
  inscrito: Inscrito;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function abbreviateSource(s: string) {
  if (s.startsWith("Instagram")) return "Instagram";
  if (s.startsWith("Podcast")) return "Podcast RFM";
  if (s.includes("Email")) return "Email/Newsletter";
  if (s.includes("WhatsApp")) return "WhatsApp";
  return s;
}

type StepState = "completed" | "interested" | "skipped" | "not_reached";

interface FunnelStep {
  label: string;
  sublabel: string;
  state: StepState;
  detail?: string;
}

/* ── Helpers for plan matching ── */
function includesPremium(p: string | null) {
  return p === "premium" || p === "bundle" || p === "video-premium" || p === "video-bundle";
}
function includesMasterclass(p: string | null) {
  return p === "masterclass" || p === "bundle" || p === "video-masterclass" || p === "video-bundle";
}

/* ── Build steps for IMAGENS webinar ── */
function buildImagensFunnelSteps(i: Inscrito): FunnelStep[] {
  const steps: FunnelStep[] = [];

  // 1. Inscrição — always completed
  steps.push({ label: "Inscrição", sublabel: "Registo", state: "completed", detail: fmtDate(i.timestamp) });

  // 2. Origem (Passo 1)
  if (i.step_reached >= 1) {
    const hasSources = i.source.length > 0;
    steps.push({ label: "Origem", sublabel: "Passo 1", state: hasSources ? "completed" : "skipped", detail: hasSources ? i.source.map(abbreviateSource).join(", ") : "Saltou" });
  } else {
    steps.push({ label: "Origem", sublabel: "Passo 1", state: "not_reached" });
  }

  // 3. Dúvida (Passo 2)
  if (i.step_reached >= 2) {
    const hasDuvida = !!i.duvida;
    steps.push({ label: "Dúvida", sublabel: "Passo 2", state: hasDuvida ? "completed" : "skipped", detail: hasDuvida ? `"${i.duvida.slice(0, 60)}${i.duvida.length > 60 ? "…" : ""}"` : "Saltou" });
  } else {
    steps.push({ label: "Dúvida", sublabel: "Passo 2", state: "not_reached" });
  }

  // 4. Premium (Passo 3)
  if (i.step_reached >= 3) {
    const paid = !!i.paid_at && includesPremium(i.plan);
    const clicked = !!i.upgrade_clicked_at && includesPremium(i.plan_selected);
    const selected = includesPremium(i.plan_selected);
    if (paid) steps.push({ label: "Premium", sublabel: "Passo 3", state: "completed", detail: "Pago · €15" });
    else if (clicked) steps.push({ label: "Premium", sublabel: "Passo 3", state: "interested", detail: "Clicou para pagar" });
    else if (selected) steps.push({ label: "Premium", sublabel: "Passo 3", state: "interested", detail: "Seleccionou plano" });
    else steps.push({ label: "Premium", sublabel: "Passo 3", state: "skipped", detail: "Não converteu" });
  } else {
    steps.push({ label: "Premium", sublabel: "Passo 3", state: "not_reached" });
  }

  // 5. Masterclass (Passo 4)
  if (i.step_reached >= 4) {
    const paid = !!i.paid_at && includesMasterclass(i.plan);
    const clicked = !!i.upgrade_clicked_at && includesMasterclass(i.plan_selected);
    const selected = includesMasterclass(i.plan_selected);
    if (paid) steps.push({ label: "Masterclass", sublabel: "Passo 4", state: "completed", detail: "Pago · €57.81" });
    else if (clicked) steps.push({ label: "Masterclass", sublabel: "Passo 4", state: "interested", detail: "Clicou para pagar" });
    else if (selected) steps.push({ label: "Masterclass", sublabel: "Passo 4", state: "interested", detail: "Seleccionou plano" });
    else steps.push({ label: "Masterclass", sublabel: "Passo 4", state: "skipped", detail: "Não converteu" });
  } else {
    steps.push({ label: "Masterclass", sublabel: "Passo 4", state: "not_reached" });
  }

  // 6. Conclusão (Passo 5)
  if (i.step_reached >= 5) steps.push({ label: "Conclusão", sublabel: "Passo 5", state: "completed", detail: "Concluiu o flow" });
  else steps.push({ label: "Conclusão", sublabel: "Passo 5", state: "not_reached" });

  return steps;
}

/* ── Build steps for VIDEO webinar ── */
function buildVideoFunnelSteps(i: Inscrito): FunnelStep[] {
  const steps: FunnelStep[] = [];

  // 1. Inscrição — always completed
  steps.push({ label: "Inscrição", sublabel: "Registo", state: "completed", detail: fmtDate(i.timestamp) });

  // 2. Qualificação (Passo 1) — role/team_size
  if (i.step_reached >= 1) {
    const hasQual = !!i.role || !!i.team_size;
    const detail = hasQual ? [i.role, i.team_size].filter(Boolean).join(" · ") : "Saltou";
    steps.push({ label: "Qualificação", sublabel: "Passo 1", state: hasQual ? "completed" : "skipped", detail });
  } else {
    steps.push({ label: "Qualificação", sublabel: "Passo 1", state: "not_reached" });
  }

  // 3. Masterclass (Passo 2) — €47
  if (i.step_reached >= 2) {
    const paid = !!i.paid_at && includesMasterclass(i.plan);
    const clicked = !!i.upgrade_clicked_at && includesMasterclass(i.plan_selected);
    const selected = includesMasterclass(i.plan_selected);
    if (paid) steps.push({ label: "Masterclass", sublabel: "Passo 2", state: "completed", detail: "Pago · €47+IVA" });
    else if (clicked) steps.push({ label: "Masterclass", sublabel: "Passo 2", state: "interested", detail: "Clicou para pagar" });
    else if (selected) steps.push({ label: "Masterclass", sublabel: "Passo 2", state: "interested", detail: "Seleccionou plano" });
    else steps.push({ label: "Masterclass", sublabel: "Passo 2", state: "skipped", detail: "Não converteu" });
  } else {
    steps.push({ label: "Masterclass", sublabel: "Passo 2", state: "not_reached" });
  }

  // 4. Premium / Gravação (Passo 3) — €15
  if (i.step_reached >= 3) {
    const paid = !!i.paid_at && includesPremium(i.plan);
    const clicked = !!i.upgrade_clicked_at && includesPremium(i.plan_selected);
    const selected = includesPremium(i.plan_selected);
    if (paid) steps.push({ label: "Gravação", sublabel: "Passo 3", state: "completed", detail: "Pago · €15+IVA" });
    else if (clicked) steps.push({ label: "Gravação", sublabel: "Passo 3", state: "interested", detail: "Clicou para pagar" });
    else if (selected) steps.push({ label: "Gravação", sublabel: "Passo 3", state: "interested", detail: "Seleccionou plano" });
    else steps.push({ label: "Gravação", sublabel: "Passo 3", state: "skipped", detail: "Não converteu" });
  } else {
    steps.push({ label: "Gravação", sublabel: "Passo 3", state: "not_reached" });
  }

  // 5. Dúvida (Passo 4)
  if (i.step_reached >= 4) {
    const hasDuvida = !!i.duvida;
    steps.push({ label: "Dúvida", sublabel: "Passo 4", state: hasDuvida ? "completed" : "skipped", detail: hasDuvida ? `"${i.duvida.slice(0, 60)}${i.duvida.length > 60 ? "…" : ""}"` : "Saltou" });
  } else {
    steps.push({ label: "Dúvida", sublabel: "Passo 4", state: "not_reached" });
  }

  // 6. Conclusão (Passo 5)
  if (i.step_reached >= 5) steps.push({ label: "Conclusão", sublabel: "Passo 5", state: "completed", detail: "Concluiu o flow" });
  else steps.push({ label: "Conclusão", sublabel: "Passo 5", state: "not_reached" });

  return steps;
}

function buildFunnelSteps(i: Inscrito): FunnelStep[] {
  return i.webinar === "video" ? buildVideoFunnelSteps(i) : buildImagensFunnelSteps(i);
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "completed") {
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(var(--green-600))" }}>
        <Check size={14} color="white" strokeWidth={3} />
      </div>
    );
  }
  if (state === "interested") {
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.15)", border: "2px solid hsl(var(--amber-500))" }}>
        <Zap size={14} style={{ color: "hsl(var(--amber-500))" }} />
      </div>
    );
  }
  if (state === "skipped") {
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(var(--surface))", border: "2px solid hsl(var(--ink-200))" }}>
        <Minus size={12} style={{ color: "hsl(var(--ink-300))" }} />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(var(--surface))", border: "2px dashed hsl(var(--ink-200))" }}>
      <Circle size={10} style={{ color: "hsl(var(--ink-200))" }} />
    </div>
  );
}

const STATE_LABEL: Record<StepState, { text: string; color: string }> = {
  completed: { text: "Concluído", color: "hsl(var(--green-600))" },
  interested: { text: "Interesse", color: "hsl(var(--amber-500))" },
  skipped: { text: "Saltou", color: "hsl(var(--ink-400))" },
  not_reached: { text: "Não atingiu", color: "hsl(var(--ink-300))" },
};

export default function FunnelView({ inscrito }: Props) {
  const steps = buildFunnelSteps(inscrito);
  const progressPct = Math.round((inscrito.step_reached / 5) * 100);

  let lastReachedIdx = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].state !== "not_reached") { lastReachedIdx = i; break; }
  }
  const showDropoff = inscrito.step_reached < 5;

  return (
    <div className="bg-off-white border border-border rounded-xl p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-4">Funil do inscrito</p>

      <div className="space-y-0">
        {steps.map((step, idx) => {
          const stateInfo = STATE_LABEL[step.state];
          const isDropoffPoint = showDropoff && idx === lastReachedIdx;

          return (
            <div key={idx}>
              <div className="flex items-start gap-3 py-2">
                <div className="flex flex-col items-center">
                  <StepIcon state={step.state} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink-800">{step.label}</span>
                    <span className="text-[11px] text-ink-300">({step.sublabel})</span>
                    <span className="ml-auto text-[11px] font-medium" style={{ color: stateInfo.color }}>
                      {step.state === "completed" && step.detail?.startsWith("Pago") ? step.detail : stateInfo.text}
                    </span>
                  </div>
                  {step.detail && step.state !== "not_reached" && !(step.state === "completed" && step.detail?.startsWith("Pago")) && (
                    <p className="text-[12px] text-ink-400 mt-0.5 truncate">{step.detail}</p>
                  )}
                </div>
              </div>

              {isDropoffPoint && (
                <div className="flex items-center gap-2 my-1 ml-[14px]">
                  <div className="flex-1 h-px" style={{ background: "hsl(var(--destructive))" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--destructive))" }}>
                    Saiu aqui
                  </span>
                  <div className="flex-1 h-px" style={{ background: "hsl(var(--destructive))" }} />
                </div>
              )}

              {idx < steps.length - 1 && !isDropoffPoint && (
                <div className="ml-[13px] h-2" style={{ borderLeft: `2px solid ${step.state === "not_reached" ? "hsl(var(--ink-100))" : "hsl(var(--ink-200))"}` }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-ink-400">Progresso</span>
          <span className="text-[12px] font-bold text-ink-700">{progressPct}% ({inscrito.step_reached}/5)</span>
        </div>
        <div className="h-2 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: "hsl(var(--blue-600))" }}
          />
        </div>
      </div>
    </div>
  );
}
