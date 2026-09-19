import { Mail, MessageSquare, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Inscrito } from "@/pages/crm/mockData";
import SmsTab from "./comunicacao/SmsTab";
import EmailTab from "./comunicacao/EmailTab";
import HistoricoTab from "./comunicacao/HistoricoTab";

interface ComunicacaoViewProps {
  inscritos: Inscrito[];
  course?: {queue:(channel:"email"|"sms",ids:string[],subject:string,body:string,date:Date|null)=>Promise<void>; smsRecipients:Inscrito[]; history:React.ReactNode};
}

export default function ComunicacaoView({ inscritos, course }: ComunicacaoViewProps) {
  return (
    <div className={`min-h-screen p-4 md:p-8 ${course ? "pt-14" : ""}`} style={{ background: "#F8FAFC" }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Comunicação</h1>
        <p className="text-sm mt-1 text-slate-500">
          {course ? "Comunicações de acompanhamento para participantes pagos. A fila respeita a pausa de contactos, os canais autorizados e o calendário da edição. Não use esta sequência para campanhas promocionais." : "Envio manual de email ou SMS"}
        </p>
      </div>

      {course && <div className="mb-5 rounded-lg border bg-white p-4 text-sm text-slate-700"><strong>Destinatários disponíveis nesta edição</strong><p className="mt-1">Email: {inscritos.length} · SMS com consentimento: {course.smsRecipients.length}</p><p className="mt-2">{inscritos.length ? "Selecione os participantes, reveja a mensagem e escolha quando colocar em fila. Consulte o resultado em Histórico." : "Selecione uma edição na barra lateral. Só aparecem participantes com pagamento confirmado e contacto autorizado."}</p></div>}
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="bg-white border border-slate-200 mb-6">
          <TabsTrigger value="email" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500 gap-1.5">
            <Mail size={14} /> Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500 gap-1.5">
            <MessageSquare size={14} /> SMS
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500 gap-1.5">
            <Clock size={14} /> Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <EmailTab inscritos={inscritos} courseQueue={course ? (...args)=>course.queue("email",...args) : undefined} />
        </TabsContent>
        <TabsContent value="sms">
          <SmsTab inscritos={course?.smsRecipients || inscritos} courseQueue={course ? (...args)=>course.queue("sms",...args) : undefined} />
        </TabsContent>
        <TabsContent value="historico">
          {course?.history || <HistoricoTab />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
