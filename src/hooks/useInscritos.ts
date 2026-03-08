import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Inscrito, Nota } from "@/pages/crm/mockData";
import { detectGender } from "@/lib/genderDetection";
import { useWebinarSettings, getPlanPrices } from "@/hooks/useWebinarSettings";
import { toast } from "@/hooks/use-toast";

// Fallback only used until DB settings load
const PLAN_VALUES_FALLBACK: Record<string, Record<string, number>> = {
  imagens: { premium: 18.45, masterclass: 57.81, bundle: 76.26 },
  video: { premium: 33.21, masterclass: 82.41, bundle: 115.62 },
};

function mapRegistration(r: any): Inscrito {
  // Show plan_selected even without payment confirmation
  const rawPlan = r.plan_selected || "free";
  let plan = rawPlan.replace(/^video-/, ""); // normalize "video-free" -> "free"
  if (plan === "masterclass-group-pending") plan = "masterclass";
  if (plan === "gravacao") plan = "premium";
  
  // Determine payment status (3 states)
  const payment_status: Inscrito["payment_status"] = r.paid_at
    ? "paid"
    : (r.upgrade_clicked_at || r.eupago_ref) && plan !== "free"
       ? "awaiting_payment"
       : r.plan_selected && r.plan_selected !== "free" && !r.plan_selected.endsWith("-free")
        ? "selected"
        : "free";


  const webinarType = r.webinar === "video" ? "video" : "imagens";
  const planHasVideoPrefix = (r.plan_selected || "").startsWith("video-");
  const pricingContext = planHasVideoPrefix ? "video" : webinarType;
  const planValues = PLAN_VALUES_FALLBACK[pricingContext] || PLAN_VALUES_FALLBACK.imagens;
  const gender = (r.gender_override as "M" | "F" | "U") || detectGender(r.name || "");
  return {
    id: r.id,
    nome: r.name,
    email: r.email,
    whatsapp: r.whatsapp || "",
    timestamp: r.created_at || new Date().toISOString(),
    step_reached: (r.step_reached || 1) as 1 | 2 | 3 | 4 | 5,
    source: r.sources ? r.sources.split(", ").filter(Boolean) : [],
    source_outro: "",
    duvida: r.duvida || "",
    plan: plan as Inscrito["plan"],
    valor: r.paid_at && r.paid_amount != null ? Number(r.paid_amount) : (planValues[plan] || 0),
    paid_at: r.paid_at || null,
    eupago_ref: r.eupago_ref || null,
    notas: [],
    status: "activo",
    follow_up: false,
    gender,
    plan_selected: r.plan_selected ? r.plan_selected.replace(/^video-/, "") : null,
    sources_text: r.sources || null,
    duvida_text: r.duvida || null,
    upgrade_clicked_at: r.upgrade_clicked_at || null,
    primeiro_nome: r.first_name || (r.name || "").split(" ")[0] || "",
    resto_nome: r.last_name || (r.name || "").split(" ").slice(1).join(" ") || "",
    payment_status,
    last_payment_link: r.last_payment_link || null,
    payment_link_created_at: r.payment_link_created_at || null,
    followup_stage: r.followup_stage ?? 0,
    last_followup_at: r.last_followup_at || null,
    next_followup_at: r.next_followup_at || null,
    do_not_contact: r.do_not_contact ?? false,
    last_payment_link_sent_at: r.last_payment_link_sent_at || null,
    registration_source: (r.registration_source as "webinar" | "gravacao") || "webinar",
    invoice_sent: (r as any).invoice_sent ?? false,
    premium_granted_at: (r as any).premium_granted_at || null,
    premium_granted_by: (r as any).premium_granted_by || null,
    webinar: (r.webinar === "video" ? "video" : "imagens") as "imagens" | "video",
    role: (r as any).role || null,
    team_size: (r as any).team_size || null,
    lost_at: (r as any).lost_at || null,
    lost_reason: (r as any).lost_reason || null,
    group_payment_ref: (r as any).group_payment_ref || null,
    invoice_document_id: (r as any).invoice_document_id || null,
    paid_amount: r.paid_amount != null ? Number(r.paid_amount) : null,
  };
}

export function useInscritos() {
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [loading, setLoading] = useState(true);

  const prevCountRef = useRef<number | null>(null);
  const prevPaidRef = useRef<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.error("Error fetching registrations:", error);
    } else {
      const mapped = (data || []).map(mapRegistration);

      // Detect new registrations
      if (prevCountRef.current !== null && mapped.length > prevCountRef.current) {
        const diff = mapped.length - prevCountRef.current;
        toast({
          title: `${diff} novo${diff > 1 ? "s" : ""} inscrito${diff > 1 ? "s" : ""}`,
          description: `Total: ${mapped.length} inscritos`,
        });
      }

      // Detect new payments
      const currentPaid = new Set(mapped.filter((i) => i.paid_at).map((i) => i.id));
      if (prevCountRef.current !== null) {
        const newPayments = [...currentPaid].filter((id) => !prevPaidRef.current.has(id));
        if (newPayments.length > 0) {
          const names = newPayments
            .map((id) => mapped.find((i) => i.id === id))
            .filter(Boolean)
            .map((i) => i!.primeiro_nome)
            .slice(0, 3)
            .join(", ");
          toast({
            title: `💰 ${newPayments.length} novo${newPayments.length > 1 ? "s" : ""} pagamento${newPayments.length > 1 ? "s" : ""}`,
            description: names,
          });
        }
      }

      prevCountRef.current = mapped.length;
      prevPaidRef.current = currentPaid;
      setInscritos(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const addNota = useCallback((inscritoId: string, texto: string) => {
    const nota: Nota = {
      id: crypto.randomUUID(),
      texto,
      timestamp: new Date().toISOString(),
    };
    setInscritos((prev) =>
      prev.map((i) =>
        i.id === inscritoId ? { ...i, notas: [...i.notas, nota] } : i
      )
    );
  }, []);

  const removeNota = useCallback((inscritoId: string, notaId: string) => {
    setInscritos((prev) =>
      prev.map((i) =>
        i.id === inscritoId
          ? { ...i, notas: i.notas.filter((n) => n.id !== notaId) }
          : i
      )
    );
  }, []);

  const updateStatus = useCallback(
    (inscritoId: string, status: Inscrito["status"]) => {
      setInscritos((prev) =>
        prev.map((i) => (i.id === inscritoId ? { ...i, status } : i))
      );
    },
    []
  );

  const toggleFollowUp = useCallback((inscritoId: string) => {
    setInscritos((prev) =>
      prev.map((i) =>
        i.id === inscritoId ? { ...i, follow_up: !i.follow_up } : i
      )
    );
  }, []);

  const deleteInscrito = useCallback(async (inscritoId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = session?.user?.email || "";
      const { data, error } = await supabase.functions.invoke("delete-registration", {
        body: { registration_id: inscritoId },
        headers: { "x-crm-admin-email": adminEmail },
      });
      if (error) {
        console.error("Error deleting registration:", error);
        return;
      }
    } catch (err) {
      console.error("Error deleting registration:", err);
      return;
    }
    setInscritos((prev) => prev.filter((i) => i.id !== inscritoId));
  }, []);

  const setGender = useCallback(async (inscritoId: string, gender: "M" | "F" | "U") => {
    const { error } = await supabase
      .from("registrations")
      .update({ gender_override: gender } as any)
      .eq("id", inscritoId);
    if (error) {
      console.error("Error updating gender:", error);
      return;
    }
    setInscritos((prev) =>
      prev.map((i) => (i.id === inscritoId ? { ...i, gender } : i))
    );
  }, []);

  const updateName = useCallback(async (inscritoId: string, fullName: string) => {
    const firstName = fullName.trim().split(" ")[0] || "";
    const lastName = fullName.trim().split(" ").slice(1).join(" ");
    const { error } = await supabase
      .from("registrations")
      .update({ name: fullName.trim(), first_name: firstName, last_name: lastName })
      .eq("id", inscritoId);
    if (error) {
      console.error("Error updating name:", error);
      return;
    }
    setInscritos((prev) =>
      prev.map((i) =>
        i.id === inscritoId
          ? { ...i, nome: fullName.trim(), primeiro_nome: firstName, resto_nome: lastName }
          : i
      )
    );
  }, []);

  const toggleDoNotContact = useCallback(async (inscritoId: string) => {
    let newVal: boolean;
    setInscritos((prev) => {
      const current = prev.find((i) => i.id === inscritoId);
      newVal = current ? !current.do_not_contact : true;
      return prev;
    });
    const { error } = await supabase
      .from("registrations")
      .update({ do_not_contact: newVal! } as any)
      .eq("id", inscritoId);
    if (error) {
      console.error("Error toggling do_not_contact:", error);
      return;
    }
    setInscritos((prev) =>
      prev.map((i) => (i.id === inscritoId ? { ...i, do_not_contact: newVal! } : i))
    );
  }, []);

  const fetchMessageLogs = useCallback(async (registrationId: string) => {
    const { data, error } = await supabase
      .from("message_logs")
      .select("*")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("Error fetching message_logs:", error);
      return [];
    }
    return data || [];
  }, []);

  const fetchPaymentEvents = useCallback(async (registrationId: string) => {
    const { data, error } = await supabase
      .from("payment_events")
      .select("*")
      .eq("registration_id", registrationId)
      .order("received_at", { ascending: false })
      .limit(10);
    if (error) {
      console.error("Error fetching payment_events:", error);
      return [];
    }
    return data || [];
  }, []);

  const fetchFailedEmailIds = useCallback(async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("status", "failed")
      .gte("created_at", since);
    if (error) {
      console.error("Error fetching failed emails:", error);
      return new Set<string>();
    }
    return new Set((data || []).map((r) => r.registration_id));
  }, []);

  const fetchMessageLogsSummary = useCallback(async () => {
    const { data, error } = await supabase
      .from("message_logs")
      .select("registration_id, template_key, status, provider_message_id, created_at, provider")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) {
      console.error("Error fetching message_logs summary:", error);
      return new Map();
    }
    // Keep only the latest log per registration_id
    const map = new Map<string, { template_key: string; status: string; provider_message_id: string | null; created_at: string; provider: string }>();
    for (const row of data || []) {
      if (!map.has(row.registration_id)) {
        map.set(row.registration_id, {
          template_key: row.template_key,
          status: row.status,
          provider_message_id: row.provider_message_id,
          created_at: row.created_at,
          provider: row.provider,
        });
      }
    }
    return map;
  }, []);

  const sendBacklogCheckin = useCallback(async (registrationId: string, templateKey: string = "followup_backlog_checkin") => {
    const { data, error } = await supabase.functions.invoke("followup-abandoned", {
      body: { mode: "manual_send", registration_id: registrationId, template_key: templateKey },
    });
    if (error) {
      console.error("Error sending backlog checkin:", error);
      throw error;
    }
    return data;
  }, []);

  const regenerateLink = useCallback(async (inscritoId: string) => {
    const reg = inscritos.find((i) => i.id === inscritoId);
    if (!reg) throw new Error("Inscrito não encontrado");
    const { data, error } = await supabase.functions.invoke("generate-reminder", {
      body: { email: reg.email, plan: reg.plan, nome: reg.nome },
    });
    if (error) throw error;
    // Refresh to get updated last_payment_link
    await fetchData();
    return data;
  }, [inscritos, fetchData]);

  const resendPaymentEmail = useCallback(async (inscritoId: string) => {
    const { data, error } = await supabase.functions.invoke("followup-abandoned", {
      body: { mode: "manual_send", registration_id: inscritoId, template_key: "reminder_manual" },
    });
    if (error) throw error;
    return data;
  }, []);

  const updateStepReached = useCallback(async (inscritoId: string, step: 1 | 2 | 3 | 4 | 5) => {
    const { error } = await supabase
      .from("registrations")
      .update({ step_reached: step })
      .eq("id", inscritoId);
    if (error) {
      console.error("Error updating step_reached:", error);
      return;
    }
    setInscritos((prev) =>
      prev.map((i) => (i.id === inscritoId ? { ...i, step_reached: step } : i))
    );
  }, []);

  const toggleInvoiceSent = useCallback(async (inscritoId: string) => {
    let newVal: boolean;
    setInscritos((prev) => {
      const current = prev.find((i) => i.id === inscritoId);
      newVal = current ? !current.invoice_sent : true;
      return prev;
    });
    const { error } = await supabase
      .from("registrations")
      .update({ invoice_sent: newVal! } as any)
      .eq("id", inscritoId);
    if (error) { console.error("Error toggling invoice_sent:", error); return; }
    setInscritos((prev) =>
      prev.map((i) => (i.id === inscritoId ? { ...i, invoice_sent: newVal! } : i))
    );
  }, []);

  const grantPremium = useCallback(async (inscritoId: string, adminEmail: string) => {
    let isGranted = false;
    setInscritos((prev) => {
      const current = prev.find((i) => i.id === inscritoId);
      isGranted = !!current?.premium_granted_at;
      return prev;
    });
    const now = new Date().toISOString();
    const updateData = isGranted
      ? { premium_granted_at: null, premium_granted_by: null }
      : { premium_granted_at: now, premium_granted_by: adminEmail };
    const { error } = await supabase
      .from("registrations")
      .update(updateData as any)
      .eq("id", inscritoId);
    if (error) { console.error("Error updating premium grant:", error); return; }
    await supabase.from("message_logs").insert({
      registration_id: inscritoId,
      template_key: "crm_premium_granted",
      status: "sent",
      provider: "internal",
      channel: "email",
    } as any);
    // Apply E-goi premium tag (32 imagens / 35 video) when granting (not when revoking)
    if (!isGranted) {
      const { error: egoiErr } = await supabase.functions.invoke("grant-premium-egoi", {
        body: { registration_id: inscritoId },
      });
      if (egoiErr) console.error("Error applying E-goi premium tag:", egoiErr);
    }
    setInscritos((prev) =>
      prev.map((i) =>
        i.id === inscritoId
          ? { ...i, premium_granted_at: isGranted ? null : now, premium_granted_by: isGranted ? null : adminEmail }
          : i
      )
    );
  }, []);

  const updatePlan = useCallback(async (inscritoId: string, newPlan: string, markAsPaid?: boolean) => {
    let prefix = "";
    let webinarType = "imagens";
    setInscritos((prev) => {
      const reg = prev.find((i) => i.id === inscritoId);
      if (reg) {
        prefix = reg.webinar === "video" ? "video-" : "";
        webinarType = reg.webinar === "video" ? "video" : "imagens";
      }
      return prev;
    });
    const dbPlan = newPlan === "free" ? null : `${prefix}${newPlan}`;
    const updateData: Record<string, any> = { plan_selected: dbPlan, lost_at: null, lost_reason: null };
    if (markAsPaid) updateData.paid_at = new Date().toISOString();
    const { error } = await supabase.from("registrations").update(updateData).eq("id", inscritoId);
    if (error) { console.error("Error updating plan:", error); return; }
    const valor = (PLAN_VALUES_FALLBACK[webinarType] || PLAN_VALUES_FALLBACK.imagens)[newPlan] || 0;
    setInscritos((prev) =>
      prev.map((i) => i.id === inscritoId ? {
        ...i,
        plan_selected: newPlan === "free" ? null : newPlan,
        plan: newPlan as Inscrito["plan"],
        valor,
        lost_at: null,
        lost_reason: null,
        ...(markAsPaid ? { paid_at: new Date().toISOString(), payment_status: "paid" as const } : {}),
      } : i)
    );
  }, []);

  const markAsPaid = useCallback(async (inscritoId: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("registrations").update({ paid_at: now }).eq("id", inscritoId);
    if (error) { console.error("Error marking as paid:", error); return; }
    setInscritos((prev) =>
      prev.map((i) => i.id === inscritoId ? { ...i, paid_at: now, payment_status: "paid" as const } : i)
    );
  }, []);

  const markAsLost = useCallback(async (inscritoId: string, reason?: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("registrations").update({ lost_at: now, lost_reason: reason || null } as any).eq("id", inscritoId);
    if (error) { console.error("Error marking as lost:", error); return; }
    setInscritos((prev) =>
      prev.map((i) => i.id === inscritoId ? { ...i, lost_at: now, lost_reason: reason || null } : i)
    );
  }, []);

  return { inscritos, loading, refresh: fetchData, addNota, removeNota, updateStatus, toggleFollowUp, deleteInscrito, setGender, updateName, toggleDoNotContact, fetchMessageLogs, fetchPaymentEvents, fetchFailedEmailIds, sendBacklogCheckin, fetchMessageLogsSummary, regenerateLink, resendPaymentEmail, updateStepReached, toggleInvoiceSent, grantPremium, updatePlan, markAsPaid, markAsLost };
}
