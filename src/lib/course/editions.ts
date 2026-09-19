export const editionNames: Record<string, string> = {
  "lisboa-2026": "Lisboa · 29–30 outubro",
  "porto-2026": "Porto · 19–20 novembro",
  "online-2026": "Online · 2–11 dezembro",
};
export const states: Record<string, string> = {
  new: "Novo pedido",
  contacted: "Contactado",
  awaiting_payment: "A aguardar pagamento",
  confirmed: "Inscrição confirmada",
  cancelled: "Cancelado",
};
export const taskNames: Record<string, string> = {
  individual_before: "Agendar sessão individual antes",
  practical_information: "Preparar informações práticas",
  resources: "Disponibilizar recursos",
  individual_after: "Agendar sessão individual depois",
};
export function automationSteps(edition: string) {
  const online = edition === "online-2026";
  return [
    {
      phase: "Pré-evento",
      title: "Preparar a participação",
      items: [
        "Pagamento validado → inscrição confirmada",
        "Agendar a sessão individual e definir o desafio",
        online
          ? "Enviar acesso às quatro sessões e preparação técnica"
          : "Enviar local, horários e preparação para os dois dias",
      ],
      note: "Pagamento confirmado inicia a sequência. Cada envio respeita a configuração desta edição.",
    },
    {
      phase: "Durante o evento",
      title: online ? "Quatro sessões em direto" : "Dois dias de formação",
      items: [
        "Acompanhar a participação",
        "Trabalhar o desafio e guardar os recursos",
      ],
      note: "Sem emails ou SMS automáticos nesta fase.",
    },
    {
      phase: "Pós-evento",
      title: "Ajudar a continuar",
      items: [
        online
          ? "Disponibilizar recursos e gravações durante um ano"
          : "Disponibilizar os recursos da formação",
        "Agendar a segunda sessão individual até 30 dias depois",
      ],
      note: "As tarefas são calculadas a partir do fim da edição.",
    },
  ];
}
export const money = (cents: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
