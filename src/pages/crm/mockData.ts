export type Nota = {
  id: string;
  texto: string;
  timestamp: string;
};

export type Inscrito = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  timestamp: string;
  step_reached: 1 | 2 | 3 | 4 | 5;
  source: string[];
  source_outro: string;
  duvida: string;
  plan: "free" | "premium" | "masterclass" | "bundle";
  valor: number;
  paid_at: string | null;
  eupago_ref: string | null;
  notas: Nota[];
  status: "activo" | "arquivado" | "perdido";
  follow_up: boolean;
  gender: "M" | "F" | "U";
  plan_selected: string | null;
  sources_text: string | null;
  duvida_text: string | null;
  upgrade_clicked_at: string | null;
  primeiro_nome: string;
  resto_nome: string;
};

export const MOCK_DATA: Inscrito[] = [];
