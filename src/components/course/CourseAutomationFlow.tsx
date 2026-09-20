import { ArrowDown, Mail, MessageSquare, Users, CalendarDays, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

export type FlowCount = { template: string; state: string; count: number };

interface StepDef {
  key: string;
  title: string;
  timing: string;
  description: string;
  sms?: boolean;
}

interface GroupDef {
  id: string;
  label: string;
  number: string;
  borderColor: string;
  bgColor: string;
  steps: StepDef[];
}

const LISBON = "Europe/Lisbon";

function dayLabel(value: Date): string {
  return value.toLocaleDateString("pt-PT", { timeZone: LISBON, day: "numeric", month: "short" }).replace(/\s+de\s+/g, " ").replace(/\./g, "").toUpperCase();
}

function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export default function CourseAutomationFlow({ counts, registrations, enabled, startsAt, endsAt, onPreview, onPeople }: {
  counts: FlowCount[] | null; registrations: number | null; enabled: boolean; startsAt: string; endsAt: string;
  onPreview: (key: string) => void; onPeople: (key: string, state: string) => void;
}) {
  const start = startsAt ? new Date(startsAt) : null;
  const end = endsAt ? new Date(endsAt) : null;
  const date = (value: string) => value ? new Date(value).toLocaleString("pt-PT", { timeZone: LISBON, dateStyle: "medium", timeStyle: "short" }) : "Data por configurar";
  const day = (base: Date | null, offset: number, fallback: string) => base ? dayLabel(addDays(base, offset)) : fallback;

  const groups: GroupDef[] = [
    {
      id: "pre", label: "PRÉ-CURSO", number: "0", borderColor: "#3b82f6", bgColor: "#f8fafc",
      steps: [
        { key: "confirmation", title: "Confirmação de pagamento", timing: "Após o pagamento", description: "Confirma a inscrição e explica o acompanhamento incluído." },
        { key: "individual_before", title: "Agendar a primeira sessão individual", timing: "1 hora após o pagamento", description: "Ajuda a escolher o problema a trabalhar. Apenas enquanto a sessão estiver por agendar." },
        { key: "practical_information", title: "Preparar a participação", timing: "48 horas antes", description: "Datas, horário e local ou acesso online. Inscrições tardias recebem esta informação assim que forem elegíveis." },
        { key: "practical_sms", title: "Lembrete por SMS", timing: "24 horas antes", description: "Apenas com consentimento e telefone válido; envio entre as 08h e as 20h de Lisboa.", sms: true },
      ],
    },
    {
      id: "d0", label: `DIA 0 · INÍCIO — ${day(start, 0, "DATA POR CONFIGURAR")}`, number: "D", borderColor: "#8b5cf6", bgColor: "#faf5ff",
      steps: [],
    },
    {
      id: "d1", label: `DIA 1 · PÓS-CURSO — ${day(end, 1, "FIM + 1 DIA")}`, number: "1", borderColor: "#f59e0b", bgColor: "#fffbeb",
      steps: [
        { key: "resources", title: "Continuar com os recursos", timing: "1 dia depois do fim", description: "Acesso aos materiais disponibilizados. Na edição online, inclui as gravações disponíveis." },
      ],
    },
    {
      id: "d7", label: `DIA 7 · ACOMPANHAMENTO — ${day(end, 7, "FIM + 7 DIAS")}`, number: "7", borderColor: "#f59e0b", bgColor: "#fffbeb",
      steps: [
        { key: "individual_after", title: "Agendar a sessão de acompanhamento", timing: "7 dias depois do fim", description: "Convite para rever a aplicação e esclarecer dúvidas. Apenas enquanto a sessão estiver por agendar." },
      ],
    },
    {
      id: "d14", label: `DIA 14 · LEMBRETE — ${day(end, 14, "FIM + 14 DIAS")}`, number: "14", borderColor: "#f59e0b", bgColor: "#fffbeb",
      steps: [
        { key: "after_sms", title: "Lembrete da sessão individual", timing: "14 dias depois do fim", description: "SMS opcional, apenas se a sessão continuar por agendar. O acompanhamento termina aos 30 dias.", sms: true },
      ],
    },
    {
      id: "d30", label: `DIA 30 · FECHO — ${day(end, 30, "FIM + 30 DIAS")}`, number: "✕", borderColor: "#ef4444", bgColor: "#fef2f2",
      steps: [],
    },
  ];

  let stepIndex = 0;

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-heading text-lg font-bold">Fluxo sequencial de contacto</h2>
      <span className="text-sm text-slate-600">{enabled ? "Sequência autorizada · sujeita às condições de envio" : "Sequência em pausa"}</span>
    </div>
    <div className="mx-auto max-w-3xl">
      {groups.map((group, groupIndex) => <section key={group.id} aria-label={group.label} className={groupIndex > 0 ? "mt-6" : ""}>
        <header className="flex items-center gap-3 rounded-lg border px-4 py-2.5" style={{ borderColor: group.borderColor, backgroundColor: group.bgColor }}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: group.borderColor }}>{group.number}</span>
          <h3 className="text-sm font-bold tracking-wide" style={{ color: group.borderColor }}>{group.label}</h3>
        </header>
        <div className="mt-3 space-y-0">
          {group.id === "pre" && <article className="rounded-[10px] border border-l-4 bg-white p-4 flex gap-3" style={{ borderLeftColor: "#8b5cf6" }}>
            <Users className="shrink-0 text-violet-600" size={20} />
            <div>
              <h4 className="font-heading font-bold">Inscrições submetidas</h4>
              <p className="text-sm text-slate-600 mt-1">{registrations === null ? "Contagem indisponível" : `${registrations} inscrições nesta edição`}. A sequência de mensagens começa após confirmação do pagamento.</p>
            </div>
          </article>}
          {group.id === "d0" && <article className="rounded-[10px] border border-l-4 bg-white p-4 flex gap-3" style={{ borderLeftColor: group.borderColor }}>
            <CalendarDays className="shrink-0 text-violet-600" size={20} />
            <div>
              <h4 className="font-heading font-bold">Durante a formação · sem mensagens automáticas</h4>
              <p className="text-sm text-slate-600 mt-1">{date(startsAt)} → {date(endsAt)}</p>
            </div>
          </article>}
          {group.id === "d30" && <article className="rounded-[10px] border border-l-4 bg-white p-4 flex gap-3" style={{ borderLeftColor: group.borderColor }}>
            <Flag className="shrink-0 text-red-600" size={20} />
            <div>
              <h4 className="font-heading font-bold">Fim do acompanhamento</h4>
              <p className="text-sm text-slate-600 mt-1">Os lembretes fora do prazo são cancelados; não são recuperados em massa.</p>
            </div>
          </article>}
          {group.steps.map(step => {
            stepIndex += 1;
            const Icon = step.sms ? MessageSquare : Mail;
            return <div key={step.key}>
              <div className="flex flex-col items-center py-3 text-slate-500"><ArrowDown size={18} /><span className="text-xs mt-1 font-medium">{step.timing}</span></div>
              <article className="rounded-[10px] border border-l-4 bg-white p-4" style={{ borderLeftColor: group.borderColor }}>
                <div className="flex items-start gap-3">
                  <Icon size={19} className="shrink-0 mt-1" style={{ color: group.borderColor }} />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-bold text-[15px]">{stepIndex} · {step.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">{[["queued", "Agendados"], ["sent", "Aceites pelo fornecedor"], ["blocked", "Bloqueados"], ["review", "A verificar"]].map(([state, label]) => <button key={state} onClick={() => onPeople(step.key, state)} className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600">{label}: <strong>{counts === null ? "—" : counts.find(c => c.template === step.key && c.state === state)?.count || 0}</strong></button>)}</div>
                <Button className="mt-3" size="sm" variant="outline" onClick={() => onPreview(step.key)}>Ver {step.sms ? "SMS" : "email"} e template</Button>
              </article>
            </div>;
          })}
        </div>
      </section>)}
    </div>
    <p className="text-xs text-slate-600">Os horários são apresentados na hora de Lisboa. Aceitação pelo fornecedor não confirma entrega. Guardar um template não envia mensagens.</p>
  </div>;
}
