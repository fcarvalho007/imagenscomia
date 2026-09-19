import { useState } from "react";
import { ArrowDown, Mail, MessageSquare, Users, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export type FlowCount = { template: string; state: string; count: number };
const steps = [
  { key: "confirmation", title: "Pagamento confirmado", timing: "Após o pagamento", description: "Confirma a inscrição e explica o acompanhamento incluído.", phase: "pre" },
  { key: "individual_before", title: "Agendar a primeira sessão individual", timing: "1 hora após o pagamento", description: "Ajuda a escolher o problema a trabalhar. Apenas enquanto a sessão estiver por agendar.", phase: "pre" },
  { key: "practical_information", title: "Preparar a participação", timing: "48 horas antes", description: "Datas, horário e local ou acesso online. Inscrições tardias recebem esta informação assim que forem elegíveis.", phase: "pre" },
  { key: "practical_sms", title: "Lembrete por SMS", timing: "24 horas antes", description: "Apenas com consentimento e telefone válido; envio entre as 08h e as 20h de Lisboa.", phase: "pre", sms: true },
  { key: "resources", title: "Continuar com os recursos", timing: "1 dia depois", description: "Acesso aos materiais disponibilizados. Na edição online, inclui as gravações disponíveis.", phase: "post" },
  { key: "individual_after", title: "Agendar a sessão de acompanhamento", timing: "7 dias depois", description: "Convite para rever a aplicação e esclarecer dúvidas. Apenas enquanto a sessão estiver por agendar.", phase: "post" },
  { key: "after_sms", title: "Lembrete da sessão individual", timing: "14 dias depois", description: "SMS opcional, apenas se a sessão continuar por agendar. O acompanhamento termina aos 30 dias.", phase: "post", sms: true },
];
export default function CourseAutomationFlow({ counts, registrations, enabled, startsAt, endsAt, onPreview, onPeople }: {
  counts: FlowCount[] | null; registrations: number | null; enabled: boolean; startsAt: string; endsAt: string;
  onPreview: (key: string) => void; onPeople: (key: string, state: string) => void;
}) {
  const [phase, setPhase] = useState("pre");
  const date = (value: string) => value ? new Date(value).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon", dateStyle: "medium", timeStyle: "short" }) : "Data por configurar";
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-1 rounded-lg bg-slate-100 p-1" aria-label="Fase da sequência">{[["pre", "Pré-evento"], ["post", "Pós-evento"]].map(([key,label]) => <Button key={key} variant={phase===key?"default":"ghost"} aria-pressed={phase===key} onClick={()=>setPhase(key)}>{label}</Button>)}</div><span className="text-sm text-slate-600">{enabled ? "Sequência autorizada · sujeita às condições de envio" : "Sequência em pausa"}</span></div>
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[10px] border border-l-4 border-l-violet-600 bg-white p-4 flex gap-3"><Users className="shrink-0 text-violet-600" size={20}/><div><h3 className="font-heading font-bold">0 · Inscrições submetidas</h3><p className="text-sm text-slate-600 mt-1">{registrations===null?"Contagem indisponível":`${registrations} inscrições nesta edição`}. A sequência de mensagens começa após confirmação do pagamento.</p></div></div>
      {phase==="post" && <div className="my-5 rounded-lg bg-slate-100 p-4 text-sm"><strong>Fim da formação</strong><p className="mt-1">{date(endsAt)} · Todos os prazos abaixo contam a partir deste momento.</p></div>}
      {steps.filter(s=>s.phase===phase).map((step,index)=> {
        const Icon=step.sms?MessageSquare:Mail;
        return <div key={step.key}><div className="flex flex-col items-center py-3 text-slate-500"><ArrowDown size={18}/><span className="text-xs mt-1 font-medium">{step.timing}</span></div><article className="rounded-[10px] border border-l-4 border-l-blue-600 bg-white p-4">
          <div className="flex items-start gap-3"><Icon size={19} className="shrink-0 text-blue-600 mt-1"/><div className="min-w-0 flex-1"><h3 className="font-heading font-bold text-[15px]">{index+1} · {step.title}</h3><p className="text-sm text-slate-600 mt-1">{step.description}</p></div></div>
          <div className="mt-4 flex flex-wrap gap-2">{[["queued","Agendados"],["sent","Aceites pelo fornecedor"],["blocked","Bloqueados"],["review","A verificar"]].map(([state,label])=><button key={state} onClick={()=>onPeople(step.key,state)} className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600">{label}: <strong>{counts===null?"—":counts.find(c=>c.template===step.key&&c.state===state)?.count||0}</strong></button>)}</div>
          <Button className="mt-3" size="sm" variant="outline" onClick={()=>onPreview(step.key)}>Ver {step.sms?"SMS":"email"} e template</Button>
        </article></div>;
      })}
      <div className="flex justify-center py-3"><ArrowDown size={18} className="text-slate-400"/></div><div className="rounded-lg border bg-slate-50 p-4 flex gap-3"><CalendarDays size={20} className="shrink-0 text-slate-500"/><div><h3 className="font-semibold">{phase==="pre"?"Durante a formação · sem mensagens automáticas":"Fim do acompanhamento · 30 dias depois"}</h3><p className="text-sm text-slate-600 mt-1">{phase==="pre"?`${date(startsAt)} → ${date(endsAt)}`:"Os lembretes fora do prazo são cancelados; não são recuperados em massa."}</p></div></div>
    </div>
    <p className="text-xs text-slate-600">Os horários são apresentados na hora de Lisboa. Aceitação pelo fornecedor não confirma entrega. Guardar um template não envia mensagens.</p>
  </div>;
}
