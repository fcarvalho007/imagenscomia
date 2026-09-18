export const smsLabels: Record<string, string> = {
  practical_sms: "Informação prática · véspera",
  after_sms: "Acompanhamento · 14 dias depois",
};
export function renderCourseSMS(template: string, edition: string) {
  const place = edition === "online-2026" ? "online" : edition === "porto-2026" ? "no Porto" : "em Lisboa";
  if (template === "practical_sms") return `Curso IA ${place}: consulte no email os horarios e o acesso/local. Leve o seu desafio. Duvidas: 915015508. Frederico Carvalho`;
  if (template === "after_sms") return "Curso IA: a sua sessao individual esta incluida. Agende pelo link no email, ate 30 dias apos o curso. Duvidas: 915015508. Frederico Carvalho";
  throw new Error("unknown_sms_template");
}
export function mobilePhone(raw: string) {
  const n = raw.replace(/\s/g, "").replace(/^(?:\+351|00351)/, "");
  if (!/^9[1236]\d{7}$/.test(n)) throw new Error("invalid_mobile");
  return "351" + n;
}
