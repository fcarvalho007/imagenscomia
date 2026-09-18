// Illustrative catalog only. Never import into payment creation or provider functions.
export const demoEditions = {
  "lisboa-2026": {
    label: "Lisboa · presencial",
    schedule: "29 e 30 de outubro de 2026",
    format: "2 dias de formação",
    net: 49700,
  },
  "porto-2026": {
    label: "Porto · presencial",
    schedule: "19 e 20 de novembro de 2026",
    format: "2 dias de formação",
    net: 49700,
  },
  "online-2026": {
    label: "Online · em direto",
    schedule: "2, 4, 9 e 11 de dezembro de 2026",
    format: "4 sessões online",
    net: 39700,
  },
} as const;
export type DemoEdition = keyof typeof demoEditions;
export const demoComplement = {
  title: "Imagem e vídeo com IA — da ideia à publicação",
  net: 6700,
};
export function demoTotal(edition: DemoEdition, complement: boolean) {
  const subtotal =
    demoEditions[edition].net + (complement ? demoComplement.net : 0);
  const vat = Math.round((subtotal * 23) / 100);
  return { subtotal, vat, total: subtotal + vat };
}
