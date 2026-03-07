import { useState, useCallback, useEffect } from "react";

import CRMLogin from "@/components/crm/CRMLogin";
import CRMSidebar, { type CRMView } from "@/components/crm/CRMSidebar";
import DashboardView from "@/components/crm/DashboardView";
import PipelineView from "@/components/crm/PipelineView";
import TableView from "@/components/crm/TableView";
import TrashView from "@/components/crm/TrashView";
import FollowUpView from "@/components/crm/FollowUpView";
import ComunicacaoView from "@/components/crm/ComunicacaoView";
import FaturacaoView from "@/components/crm/FaturacaoView";
import InscritoModal from "@/components/crm/InscritoModal";
import { useInscritos } from "@/hooks/useInscritos";
import type { Inscrito } from "@/pages/crm/mockData";
import type { LastEmailInfo } from "@/components/crm/templateLabels";
import { WebinarProvider, useWebinarContext } from "@/contexts/WebinarContext";
import { filterByWebinar } from "@/config/webinarConfig";
import { supabase } from "@/integrations/supabase/client";

function CRMInner() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<CRMView>("dashboard");
  const [selectedInscrito, setSelectedInscrito] = useState<Inscrito | null>(null);
  const { webinarContext } = useWebinarContext();

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setAuthenticated(false);
        return;
      }

      // Check AAL level (MFA verified?)
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel !== aal?.nextLevel) {
        // MFA required but not verified
        setAuthenticated(false);
        return;
      }

      // Check admin role
      const { data: hasRole } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });

      setAuthenticated(!!hasRole);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const { inscritos, refresh, addNota, removeNota, updateStatus, toggleFollowUp, deleteInscrito, setGender, updateName, toggleDoNotContact, fetchMessageLogs, fetchPaymentEvents, fetchFailedEmailIds, sendBacklogCheckin, fetchMessageLogsSummary, regenerateLink, resendPaymentEmail, updateStepReached, toggleInvoiceSent, grantPremium, updatePlan, markAsPaid, markAsLost } = useInscritos();

  const filteredInscritos = filterByWebinar(inscritos, webinarContext);

  const [lastEmailMap, setLastEmailMap] = useState<Map<string, LastEmailInfo>>(new Map());
  const [missingNifIds, setMissingNifIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMessageLogsSummary().then(setLastEmailMap);
  }, [fetchMessageLogsSummary]);

  // Fetch paid registrations missing invoice_details (NIF)
  useEffect(() => {
    const paidIds = inscritos.filter(i => i.paid_at && i.plan !== "free").map(i => i.id);
    if (paidIds.length === 0) { setMissingNifIds(new Set()); return; }
    supabase
      .from("invoice_details")
      .select("registration_id")
      .in("registration_id", paidIds)
      .then(({ data }) => {
        const withNif = new Set((data || []).map((d: any) => d.registration_id));
        setMissingNifIds(new Set(paidIds.filter(id => !withNif.has(id))));
      });
  }, [inscritos]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  }, []);

  const currentInscrito = selectedInscrito
    ? inscritos.find((i) => i.id === selectedInscrito.id) || null
    : null;

  // Loading state
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F172A" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

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
          <PipelineView inscritos={filteredInscritos} onSelectInscrito={setSelectedInscrito} onUpdatePlan={updatePlan} onMarkAsPaid={markAsPaid} onMarkAsLost={markAsLost} onToggleFollowUp={toggleFollowUp} onUpdateStepReached={updateStepReached} />
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
            missingNifIds={missingNifIds}
          />
        )}
        {activeView === "faturacao" && (
          <FaturacaoView inscritos={inscritos} onRefresh={refresh} />
        )}
        {activeView === "templates" && (
          <FollowUpView inscritos={filteredInscritos} onSelectInscrito={setSelectedInscrito} />
        )}
        {activeView === "comunicacao" && (
          <ComunicacaoView inscritos={inscritos} />
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
           onUpdatePlan={updatePlan}
           onMarkAsPaid={markAsPaid}
           onMarkAsLost={markAsLost}
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
