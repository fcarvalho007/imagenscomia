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
import { WebinarProvider, useWebinarContext } from "@/contexts/WebinarContext";
import { filterByWebinar } from "@/config/webinarConfig";

function CRMInner() {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem("crm_admin_email") === "fredericodigital@gmail.com";
  });
  const [activeView, setActiveView] = useState<CRMView>("dashboard");
  const [selectedInscrito, setSelectedInscrito] = useState<Inscrito | null>(null);
  const { webinarContext } = useWebinarContext();

  const { inscritos, refresh, addNota, removeNota, updateStatus, toggleFollowUp, deleteInscrito, setGender, updateName, toggleDoNotContact, fetchMessageLogs, fetchPaymentEvents, fetchFailedEmailIds, sendBacklogCheckin, fetchMessageLogsSummary, regenerateLink, resendPaymentEmail, updateStepReached, toggleInvoiceSent, grantPremium } = useInscritos();

  const filteredInscritos = filterByWebinar(inscritos, webinarContext);

  const [lastEmailMap, setLastEmailMap] = useState<Map<string, LastEmailInfo>>(new Map());
  useEffect(() => {
    fetchMessageLogsSummary().then(setLastEmailMap);
  }, [fetchMessageLogsSummary]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("crm_admin_email");
    setAuthenticated(false);
  }, []);

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

      <div className="flex-1 md:ml-[240px] overflow-y-auto">
        {activeView === "dashboard" && (
          <DashboardView inscritos={filteredInscritos} onSelectInscrito={setSelectedInscrito} onRefresh={refresh} />
        )}
        {activeView === "pipeline" && (
          <PipelineView inscritos={filteredInscritos} onSelectInscrito={setSelectedInscrito} />
        )}
        {activeView === "tabela" && (
          <TableView
            inscritos={filteredInscritos}
            onSelectInscrito={setSelectedInscrito}
            onToggleFollowUp={toggleFollowUp}
            onArchive={(id) => updateStatus(id, "arquivado")}
            onDelete={deleteInscrito}
            fetchFailedEmailIds={fetchFailedEmailIds}
            lastEmailMap={lastEmailMap}
            onUpdateStepReached={updateStepReached}
          />
        )}
        {activeView === "templates" && (
          <FollowUpView inscritos={filteredInscritos} onSelectInscrito={setSelectedInscrito} />
        )}
        {activeView === "lixo" && (
          <TrashView
            inscritos={filteredInscritos}
            onDelete={deleteInscrito}
            onRestore={(id) => updateStatus(id, "activo")}
          />
        )}
      </div>

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
          onUpdateStepReached={updateStepReached}
          onToggleInvoiceSent={toggleInvoiceSent}
          onGrantPremium={async (id) => {
            await grantPremium(id, "fredericodigital@gmail.com");
          }}
        />
      )}
    </div>
  );
}

export default function CRM() {
  return (
    <WebinarProvider>
      <CRMInner />
    </WebinarProvider>
  );
}
