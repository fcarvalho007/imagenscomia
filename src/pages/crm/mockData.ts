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
};

export const MOCK_DATA: Inscrito[] = [
  {
    id: "001", nome: "Ana Costa", email: "ana.costa@empresa.pt",
    whatsapp: "+351912345678", timestamp: "2026-02-08T09:15:00Z",
    step_reached: 5, source: ["Instagram (Frederico Carvalho)", "Email / Newsletter"],
    source_outro: "", duvida: "Não sei como descrever o estilo visual da minha marca sem usar palavras técnicas. Os resultados são sempre genéricos.",
    plan: "premium", valor: 15, paid_at: "2026-02-08T09:22:00Z",
    eupago_ref: "EP-2026-001", notas: [], status: "activo", follow_up: false
  },
  {
    id: "002", nome: "Rui Mendes", email: "rui@loja-online.pt",
    whatsapp: "+351965432109", timestamp: "2026-02-08T11:30:00Z",
    step_reached: 5, source: ["Facebook"],
    source_outro: "", duvida: "Preciso de imagens de produto escaláveis para 200 referências. Como fazer isso de forma sistemática?",
    plan: "bundle", valor: 72.81, paid_at: "2026-02-08T11:45:00Z",
    eupago_ref: "EP-2026-002", notas: [
      { id: "n1", texto: "Muito motivado, tem e-commerce de moda. Follow-up após webinar.", timestamp: "2026-02-09T10:00:00Z" }
    ], status: "activo", follow_up: false
  },
  {
    id: "003", nome: "Sofia Pereira", email: "sofia.p@agencia.pt",
    whatsapp: "+351933211456", timestamp: "2026-02-09T14:20:00Z",
    step_reached: 5, source: ["LinkedIn"],
    source_outro: "", duvida: "Tenho 15 clientes que precisam de conteúdo visual. Como usar IA para gerir vários estilos de marca em simultâneo?",
    plan: "masterclass", valor: 57.81, paid_at: "2026-02-09T14:35:00Z",
    eupago_ref: "EP-2026-003", notas: [], status: "activo", follow_up: false
  },
  {
    id: "004", nome: "João Fernandes", email: "joao.f@consultoria.pt",
    whatsapp: "+351912678901", timestamp: "2026-02-09T16:45:00Z",
    step_reached: 5, source: ["Podcast Marketing por Idiotas (RFM)"],
    source_outro: "", duvida: "Já tentei o Midjourney mas ficou frustrado. Qual a diferença entre ferramentas? Qual usar para B2B sério?",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null, notas: [], status: "activo", follow_up: false
  },
  {
    id: "005", nome: "Maria Gomes", email: "maria@startup-tech.pt",
    whatsapp: "+351966789012", timestamp: "2026-02-09T18:00:00Z",
    step_reached: 5, source: ["Email / Newsletter", "Instagram (Frederico Carvalho)"],
    source_outro: "", duvida: "",
    plan: "premium", valor: 15, paid_at: "2026-02-09T18:12:00Z",
    eupago_ref: "EP-2026-005", notas: [], status: "activo", follow_up: false
  },
  {
    id: "006", nome: "Pedro Lopes", email: "pedro@moda-lisboa.pt",
    whatsapp: "+351923456789", timestamp: "2026-02-10T08:30:00Z",
    step_reached: 5, source: ["WhatsApp ou grupo de amigos"],
    source_outro: "", duvida: "Tenho um e-commerce de roupa. Preciso de fotos de produto sem fotógrafo. É possível com IA?",
    plan: "bundle", valor: 72.81, paid_at: "2026-02-10T08:45:00Z",
    eupago_ref: "EP-2026-006", notas: [], status: "activo", follow_up: false
  },
  {
    id: "007", nome: "Carla Rodrigues", email: "carla@restaurante.pt",
    whatsapp: "+351944321098", timestamp: "2026-02-10T10:15:00Z",
    step_reached: 3, source: ["Instagram (Frederico Carvalho)"],
    source_outro: "", duvida: "O stock fotográfico que uso não representa o meu restaurante.",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null,
    notas: [{ id: "n2", texto: "Chegou ao passo 3 mas não avançou para Premium. Candidata a retargeting.", timestamp: "2026-02-10T12:00:00Z" }],
    status: "activo", follow_up: false
  },
  {
    id: "008", nome: "Miguel Santos", email: "miguel@imobiliaria.pt",
    whatsapp: "+351911234567", timestamp: "2026-02-10T11:00:00Z",
    step_reached: 5, source: ["LinkedIn", "Facebook"],
    source_outro: "", duvida: "Preciso de renders e imagens de imóveis sem custos de fotógrafo. A IA consegue resultados convincentes?",
    plan: "masterclass", valor: 57.81, paid_at: "2026-02-10T11:20:00Z",
    eupago_ref: "EP-2026-008", notas: [], status: "activo", follow_up: false
  },
  {
    id: "009", nome: "Inês Faria", email: "ines@clinica.pt",
    whatsapp: "+351967890123", timestamp: "2026-02-10T13:45:00Z",
    step_reached: 5, source: ["Email / Newsletter"],
    source_outro: "", duvida: "",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null, notas: [], status: "activo", follow_up: false
  },
  {
    id: "010", nome: "Tiago Oliveira", email: "tiago@marketing-digital.pt",
    whatsapp: "+351934567890", timestamp: "2026-02-10T15:30:00Z",
    step_reached: 5, source: ["Podcast Marketing por Idiotas (RFM)", "Instagram (Frederico Carvalho)"],
    source_outro: "", duvida: "Trabalho em agência com 20 clientes. Como sistematizar a criação de conteúdo visual com IA de forma escalável?",
    plan: "bundle", valor: 72.81, paid_at: "2026-02-10T15:48:00Z",
    eupago_ref: "EP-2026-010", notas: [], status: "activo", follow_up: false
  },
  {
    id: "011", nome: "Beatriz Nunes", email: "beatriz@escola.pt",
    whatsapp: "+351955678901", timestamp: "2026-02-10T16:20:00Z",
    step_reached: 2, source: ["Facebook"],
    source_outro: "", duvida: "Não percebo a diferença entre as ferramentas de IA para imagens.",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null, notas: [], status: "activo", follow_up: false
  },
  {
    id: "012", nome: "Luís Castro", email: "luis@farmacia.pt",
    whatsapp: "+351912789034", timestamp: "2026-02-11T08:00:00Z",
    step_reached: 5, source: ["WhatsApp ou grupo de amigos"],
    source_outro: "", duvida: "Preciso de imagens para a farmácia: promoções, produtos, campanhas sazonais.",
    plan: "premium", valor: 15, paid_at: "2026-02-11T08:15:00Z",
    eupago_ref: "EP-2026-012", notas: [], status: "activo", follow_up: false
  },
  {
    id: "013", nome: "Helena Ferreira", email: "helena@designers.pt",
    whatsapp: "+351923890145", timestamp: "2026-02-11T09:15:00Z",
    step_reached: 1, source: ["Instagram (Frederico Carvalho)"],
    source_outro: "", duvida: "",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null, notas: [], status: "activo", follow_up: false
  },
  {
    id: "014", nome: "André Martins", email: "andre@automatizacao.pt",
    whatsapp: "+351966901256", timestamp: "2026-02-11T10:00:00Z",
    step_reached: 5, source: ["LinkedIn"],
    source_outro: "", duvida: "Como integrar a criação de imagens com IA nos meus workflows de automação (n8n, Make)?",
    plan: "bundle", valor: 72.81, paid_at: "2026-02-11T10:18:00Z",
    eupago_ref: "EP-2026-014", notas: [
      { id: "n3", texto: "Usa n8n. Potencial parceiro ou case study.", timestamp: "2026-02-11T11:00:00Z" }
    ], status: "activo", follow_up: false
  },
  {
    id: "015", nome: "Patrícia Sousa", email: "patricia@coach.pt",
    whatsapp: "+351911012367", timestamp: "2026-02-11T10:30:00Z",
    step_reached: 5, source: ["Instagram (Frederico Carvalho)", "WhatsApp ou grupo de amigos"],
    source_outro: "", duvida: "Sou coach e preciso de imagens para o meu personal brand sem depender de fotógrafo.",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null, notas: [], status: "activo", follow_up: false
  },
  {
    id: "016", nome: "Ricardo Alves", email: "ricardo@contabilidade.pt",
    whatsapp: "+351934123478", timestamp: "2026-02-11T11:00:00Z",
    step_reached: 4, source: ["Email / Newsletter"],
    source_outro: "", duvida: "O designer que uso demora semanas e custa 300€ por campanha.",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null, notas: [], status: "activo", follow_up: false
  },
  {
    id: "017", nome: "Filomena Costa", email: "filomena@turismo.pt",
    whatsapp: "+351955234589", timestamp: "2026-02-11T11:20:00Z",
    step_reached: 5, source: ["Facebook", "Email / Newsletter"],
    source_outro: "", duvida: "Tenho um alojamento local. Preciso de imagens profissionais para o Airbnb e Instagram.",
    plan: "premium", valor: 15, paid_at: "2026-02-11T11:35:00Z",
    eupago_ref: "EP-2026-017", notas: [], status: "activo", follow_up: false
  },
  {
    id: "018", nome: "Nuno Ferreira", email: "nuno@tech-startup.pt",
    whatsapp: "+351912345690", timestamp: "2026-02-11T12:00:00Z",
    step_reached: 5, source: ["LinkedIn"],
    source_outro: "", duvida: "",
    plan: "masterclass", valor: 57.81, paid_at: "2026-02-11T12:15:00Z",
    eupago_ref: "EP-2026-018", notas: [], status: "activo", follow_up: false
  },
  {
    id: "019", nome: "Vera Antunes", email: "vera@moda-portugal.pt",
    whatsapp: "+351966345701", timestamp: "2026-02-11T12:30:00Z",
    step_reached: 5, source: ["Instagram (Frederico Carvalho)"],
    source_outro: "", duvida: "Como manter consistência visual da marca entre publicações geradas por IA?",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null, notas: [], status: "activo", follow_up: false
  },
  {
    id: "020", nome: "Carlos Mendonça", email: "carlos@construcao.pt",
    whatsapp: "+351923456812", timestamp: "2026-02-11T13:00:00Z",
    step_reached: 3, source: ["Outro"],
    source_outro: "Indicação do Bruno Silva", duvida: "",
    plan: "free", valor: 0, paid_at: null, eupago_ref: null, notas: [], status: "activo", follow_up: false
  }
];
