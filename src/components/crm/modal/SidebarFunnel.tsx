import { Check, ArrowRight, Circle } from "lucide-react";

const STEPS_IMAGENS = [
  { num: 1, name: "Origem" },
  { num: 2, name: "Dúvida" },
  { num: 3, name: "Premium" },
  { num: 4, name: "Masterclass" },
  { num: 5, name: "Conclusão" },
];

const STEPS_VIDEO = [
  { num: 1, name: "Qualificação" },
  { num: 2, name: "Masterclass" },
  { num: 3, name: "Gravação" },
  { num: 4, name: "Dúvida" },
  { num: 5, name: "Conclusão" },
];

interface SidebarFunnelProps {
  stepReached: number;
  webinar?: "imagens" | "video";
}

export default function SidebarFunnel({ stepReached, webinar }: SidebarFunnelProps) {
  const STEPS = webinar === "video" ? STEPS_VIDEO : STEPS_IMAGENS;

  return (
    <div className="space-y-0.5">
      {STEPS.map((step, idx) => {
        const completed = step.num <= stepReached;
        const isCurrent = step.num === stepReached;
        const isExitPoint = step.num === stepReached && stepReached < 5;

        let icon: React.ReactNode;
        let statusText: string;
        let statusColor: string;

        if (completed && !isCurrent) {
          icon = <Check size={13} className="text-green-400" />;
          statusText = "Concluído";
          statusColor = "rgba(255,255,255,0.35)";
        } else if (isCurrent) {
          icon = <ArrowRight size={13} style={{ color: "#60a5fa" }} />;
          statusText = stepReached >= 5 ? "Concluído" : "Actual";
          statusColor = "#60a5fa";
        } else {
          icon = <Circle size={11} style={{ color: "rgba(255,255,255,0.15)" }} />;
          statusText = "Não atingiu";
          statusColor = "rgba(255,255,255,0.2)";
        }

        return (
          <div key={step.num}>
            {isExitPoint && idx < STEPS.length - 1 && (
              <div className="flex items-center gap-2 py-1.5 pl-1">
                <div className="flex-1 h-px" style={{ background: "#ef4444" }} />
                <span className="text-[10px] font-bold tracking-wider" style={{ color: "#ef4444" }}>SAIU AQUI</span>
                <div className="flex-1 h-px" style={{ background: "#ef4444" }} />
              </div>
            )}
            <div className="flex items-center gap-2.5 py-1.5">
              <div className="w-5 flex items-center justify-center shrink-0">{icon}</div>
              <span className="text-[12px] flex-1" style={{ color: isCurrent ? "#60a5fa" : "rgba(255,255,255,0.5)" }}>
                {step.name}
              </span>
              <span className="text-[11px]" style={{ color: statusColor }}>{statusText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
