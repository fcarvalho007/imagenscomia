import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Inscrito, Nota } from "@/pages/crm/mockData";
import { detectGender } from "@/lib/genderDetection";

function loadGenderOverrides(): Record<string, "M" | "F" | "U"> {
  try {
    return JSON.parse(localStorage.getItem("crm_gender_overrides") || "{}");
  } catch { return {}; }
}

function saveGenderOverride(id: string, gender: "M" | "F" | "U") {
  const overrides = loadGenderOverrides();
  overrides[id] = gender;
  localStorage.setItem("crm_gender_overrides", JSON.stringify(overrides));
}

const PLAN_VALUES: Record<string, number> = {
  premium: 15,
  masterclass: 57.81,
  bundle: 72.81,
};

function mapRegistration(r: any): Inscrito {
  const plan = r.paid_at
    ? (r.plan_selected || "free")
    : "free";
  const overrides = loadGenderOverrides();
  const gender = overrides[r.id] || detectGender(r.name || "");
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
    valor: PLAN_VALUES[plan] || 0,
    paid_at: r.paid_at || null,
    eupago_ref: r.eupago_ref || null,
    notas: [],
    status: "activo",
    follow_up: false,
    gender,
    plan_selected: r.plan_selected || null,
    sources_text: r.sources || null,
    duvida_text: r.duvida || null,
    upgrade_clicked_at: r.upgrade_clicked_at || null,
    primeiro_nome: r.first_name || (r.name || "").split(" ")[0] || "",
    resto_nome: r.last_name || (r.name || "").split(" ").slice(1).join(" ") || "",
  };
}

export function useInscritos() {
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.error("Error fetching registrations:", error);
    } else {
      setInscritos((data || []).map(mapRegistration));
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
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", inscritoId);

    if (error) {
      console.error("Error deleting registration:", error);
      return;
    }
    setInscritos((prev) => prev.filter((i) => i.id !== inscritoId));
  }, []);

  const setGender = useCallback((inscritoId: string, gender: "M" | "F" | "U") => {
    saveGenderOverride(inscritoId, gender);
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

  return { inscritos, loading, refresh: fetchData, addNota, removeNota, updateStatus, toggleFollowUp, deleteInscrito, setGender, updateName };
}
