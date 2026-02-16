import { useState, useCallback, useEffect } from "react";
import CRMLogin from "@/components/crm/CRMLogin";
import CRMSidebar, { type CRMView } from "@/components/crm/CRMSidebar";
import DashboardView from "@/components/crm/DashboardView";
import PipelineView from "@/components/crm/PipelineView";
import TableView from "@/components/crm/TableView";
import TrashView from "@/components/crm/TrashView";
import FollowUpView from "@/components/crm/FollowUpView";
import InscritoModal from "@/components/crm/InscritoModal";
import { useInscritos } from "@/hooks/useInscritos";
import type { Inscrito } from "@/pages/crm/mockData";
import type { LastEmailInfo } from "@/components/crm/templateLabels";

export default function CRM() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("crm_auth") === "1"
  );
  const [activeView, setActiveView] = useState<CRMView>("dashboard");
  const [selectedInscrito, setSelectedInscrito] = useState<Inscrito | null>(null);

  const { inscritos, refresh, addNota, removeNota, updateStatus, toggleFollowUp, deleteInscrito, setGender, updateName, toggleDoNotContact, fetchMessageLogs, fetchPaymentEvents, fetchFailedEmailIds, sendBacklogCheckin, fetchMessageLogsSummary, regenerateLink, resendPaymentEmail } = useInscritos();

  // Fetch last email map for table enrichment
  const [lastEmailMap, setLastEmailMap] = useState<Map<string, LastEmailInfo>>(new Map());
  useEffect(() => {
    fetchMessageLogsSummary().then(setLastEmailMap);
  }, [fetchMessageLogsSummary]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("crm_auth");
    sessionStorage.removeItem("crm_data");
    setAuthenticated(false);
  }, []);

  // Keep slide-over in sync with latest data
  const currentInscrito = selectedInscrito
    ? inscritos.find((i) => i.id === selectedInscrito.id) || null
    : null;

  if (!authenticated) {
    return <CRMLogin onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen">
      <CRMSidebar
        activeView={activeView}
        onChangeView={setActiveView}
        onLogout={handleLogout}
      />

      {/* Main content with sidebar offset */}
      <div className="flex-1 md:ml-[240px] overflow-y-auto">
        {activeView === "dashboard" && (
          <DashboardView inscritos={inscritos} onSelectInscrito={setSelectedInscrito} onRefresh={refresh} />
        )}
        {activeView === "pipeline" && (
          <PipelineView inscritos={inscritos} onSelectInscrito={setSelectedInscrito} />
        )}
        {activeView === "tabela" && (
          <TableView
            inscritos={inscritos}
            onSelectInscrito={setSelectedInscrito}
            onToggleFollowUp={toggleFollowUp}
            onArchive={(id) => updateStatus(id, "arquivado")}
            onDelete={deleteInscrito}
            fetchFailedEmailIds={fetchFailedEmailIds}
            lastEmailMap={lastEmailMap}
          />
        )}
        {activeView === "templates" && (
          <FollowUpView inscritos={inscritos} onSelectInscrito={setSelectedInscrito} />
        )}
        {activeView === "lixo" && (
          <TrashView
            inscritos={inscritos}
            onDelete={deleteInscrito}
            onRestore={(id) => updateStatus(id, "activo")}
          />
        )}
      </div>

      {/* Modal */}
      {currentInscrito && (
        <InscritoModal
          inscrito={currentInscrito}
          todos={inscritos.filter((i) => i.status === "activo")}
          onClose={() => setSelectedInscrito(null)}
          onSelectInscrito={setSelectedInscrito}
          onAddNota={addNota}
          onRemoveNota={removeNota}
          onToggleFollowUp={toggleFollowUp}
          onArchive={(id) => {
            updateStatus(id, "arquivado");
            setSelectedInscrito(null);
          }}
          onDelete={(id) => {
            deleteInscrito(id);
            setSelectedInscrito(null);
          }}
          onSetGender={setGender}
          onUpdateName={updateName}
          onToggleDoNotContact={toggleDoNotContact}
          fetchMessageLogs={fetchMessageLogs}
          fetchPaymentEvents={fetchPaymentEvents}
          sendBacklogCheckin={sendBacklogCheckin}
          regenerateLink={regenerateLink}
          resendPaymentEmail={resendPaymentEmail}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
