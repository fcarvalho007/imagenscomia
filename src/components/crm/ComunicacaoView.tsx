import { Mail, MessageSquare, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Inscrito } from "@/pages/crm/mockData";
import SmsTab from "./comunicacao/SmsTab";
import EmailTab from "./comunicacao/EmailTab";
import HistoricoTab from "./comunicacao/HistoricoTab";

interface ComunicacaoViewProps {
  inscritos: Inscrito[];
}

export default function ComunicacaoView({ inscritos }: ComunicacaoViewProps) {
  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#F8FAFC" }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Comunicação</h1>
        <p className="text-sm mt-1 text-slate-500">
          Envio manual de email ou SMS
        </p>
      </div>

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
          <EmailTab inscritos={inscritos} />
        </TabsContent>
        <TabsContent value="sms">
          <SmsTab inscritos={inscritos} />
        </TabsContent>
        <TabsContent value="historico">
          <HistoricoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
