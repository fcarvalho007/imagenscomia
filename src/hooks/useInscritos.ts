import { useState, useCallback, useEffect } from "react";
import { MOCK_DATA, type Inscrito, type Nota } from "@/pages/crm/mockData";

// TODO: substituir MOCK_DATA por fetch() da API

const STORAGE_KEY = "crm_data";

function loadInscritos(): Inscrito[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return MOCK_DATA;
}

export function useInscritos() {
  const [inscritos, setInscritos] = useState<Inscrito[]>(loadInscritos);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inscritos));
  }, [inscritos]);

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

  return { inscritos, addNota, removeNota, updateStatus, toggleFollowUp };
}
