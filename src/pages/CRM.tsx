import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeView, setActiveView] = useState<CRMView>("dashboard");
  const [selectedInscrito, setSelectedInscrito] = useState<Inscrito | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAdminRole = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (isMounted) setAuthenticated(!!data);
      } catch {
        if (isMounted) setAuthenticated(false);
      }
    };

    // Listener para mudanças CONTÍNUAS de auth (não controla isLoading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setTimeout(() => checkAdminRole(session.user.id), 0);
        } else {
          setAuthenticated(false);
        }
      }
    );

    // Carga INICIAL — controla checkingAuth, aguarda role antes de resolver
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (session?.user) {
          await checkAdminRole(session.user.id);
        }
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const { inscritos, refresh, addNota, removeNota, updateStatus, toggleFollowUp, deleteInscrito, setGender, updateName, toggleDoNotContact, fetchMessageLogs, fetchPaymentEvents, fetchFailedEmailIds, sendBacklogCheckin, fetchMessageLogsSummary, regenerateLink, resendPaymentEmail, updateStepReached, toggleInvoiceSent, grantPremium } = useInscritos();

  const [lastEmailMap, setLastEmailMap] = useState<Map<string, LastEmailInfo>>(new Map());
  useEffect(() => {
    fetchMessageLogsSummary().then(setLastEmailMap);
  }, [fetchMessageLogsSummary]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  }, []);

  const currentInscrito = selectedInscrito
    ? inscritos.find((i) => i.id === selectedInscrito.id) || null
    : null;

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F172A" }}>
        <p className="text-white/40 text-sm">A verificar sessão...</p>
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
            onUpdateStepReached={updateStepReached}
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
            const { data: { user } } = await supabase.auth.getUser();
            await grantPremium(id, user?.email || "admin");
          }}
        />
      )}
    </div>
  );
}
