import ActivityTimeline from "./ActivityTimeline";
import type { Inscrito } from "@/pages/crm/mockData";

interface TabActividadeProps {
  messageLogs: any[];
  paymentEvents: any[];
  loading: boolean;
  inscrito: Inscrito;
}

export default function TabActividade({ messageLogs, paymentEvents, loading, inscrito }: TabActividadeProps) {
  const emailCount = messageLogs.filter(l => l.status === "sent" || l.status === "delivered").length;
  const paymentCount = paymentEvents.length;
  const errorCount = messageLogs.filter(l => l.status === "failed" || l.error).length;
  const total = messageLogs.length + paymentEvents.length;

  return (
    <div>
      {/* Summary bar */}
      <div className="mb-3 text-[11px]" style={{ color: "#888" }}>
        {total} eventos · {emailCount} emails · {paymentCount} pagamentos · {errorCount} erros
      </div>

      <ActivityTimeline
        messageLogs={messageLogs}
        paymentEvents={paymentEvents}
        loading={loading}
        inscrito={inscrito}
      />
    </div>
  );
}
