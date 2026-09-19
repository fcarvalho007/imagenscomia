export const emailLabels: Record<string, string> = {
  confirmation: "Inscrição confirmada",
  individual_before: "A sua sessão individual antes do curso",
  practical_information: "Tudo pronto para a formação",
  resources: "Os seus recursos para continuar",
  individual_after: "Vamos rever o que colocou em prática",
};
export type MailContext = {
  name: string;
  edition: string;
  label: string;
  schedule: string;
  venue?: string;
  before_url?: string;
  after_url?: string;
  join_url?: string;
  resources_url?: string;
  recordings_url?: string;
  portal_url: string;
};
export const escapeHTML = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function safeLink(value: string | undefined): string {
  if (!value) throw new Error("missing_link");
  const u = new URL(value);
  if (u.protocol !== "https:" || u.username || u.password)
    throw new Error("invalid_link");
  return u.href;
}
export function renderCourseEmail(template: string, c: MailContext, override?: {subject:string;body:string}) {
  const online = c.edition === "online-2026";
  let paragraphs: string[];
  let label: string;
  let url: string;
  switch (template) {
    case "confirmation":
      paragraphs = [
        `A sua inscrição no curso de inteligência artificial está confirmada: ${c.label}.`,
        `${c.schedule}.`,
        `O acompanhamento começa antes da formação. Vai ter uma sessão individual comigo para escolher um problema real do seu trabalho e definir o que pretende melhorar. Depois do curso, teremos outra sessão para rever a aplicação e esclarecer dúvidas.`,
        `O próximo passo é completar os dados de faturação. Receberá também o acesso ao agendamento da primeira sessão.`,
      ];
      label = "Completar dados de faturação";
      url = c.portal_url;
      break;
    case "individual_before":
      paragraphs = [
        `Antes do curso, vamos conversar individualmente sobre uma tarefa que lhe ocupa tempo ou um problema que gostaria de resolver com IA.`,
        `Escolha o horário para a nossa videochamada. Basta trazer um exemplo do seu dia a dia; não precisa de preparar uma apresentação.`,
        `Na formação, vamos usar esse ponto de partida para desenhar e testar uma solução.`,
      ];
      label = "Agendar a minha sessão";
      url = c.before_url || "";
      break;
    case "practical_information":
      if (!online && !c.venue) throw new Error("missing_venue");
      paragraphs = [
        `A sua formação está quase a começar. ${c.schedule}.`,
        online
          ? `As quatro sessões são online e em direto. Use o acesso abaixo e entre alguns minutos antes para testar o som e a ligação.`
          : `Encontramo-nos em ${c.venue}. Leve o seu computador portátil e o carregador.`,
        `Tenha consigo a tarefa que escolheu trabalhar. Para os exercícios, use exemplos sem dados pessoais ou informação confidencial.`,
        `Vamos diagnosticar o problema, transformar a tarefa num processo e aplicar a IA ao marketing, aos conteúdos e a uma solução funcional.`,
      ];
      label = online ? "Aceder às sessões" : "Consultar a minha inscrição";
      url = online ? c.join_url || "" : c.portal_url;
      break;
    case "resources":
      paragraphs = [
        `O curso terminou, mas o trabalho que começou pode continuar. Reuni os templates, checklists, recursos de apoio e videoaulas de resumo para voltar aos pontos essenciais ao seu ritmo.`,
        online
          ? `As gravações das sessões online ficam disponíveis durante um ano após a formação, juntamente com os recursos.`
          : `Use os materiais para adaptar o que aprendeu ao seu problema e repetir o processo com outras tarefas.`,
        `Comece por um passo pequeno: escolha uma melhoria, teste o resultado e anote as dúvidas para a nossa sessão individual.`,
      ];
      label = "Abrir os meus recursos";
      url = c.resources_url || "";
      if (online && !c.recordings_url) throw new Error("missing_recordings");
      break;
    case "individual_after":
      paragraphs = [
        `Como está a correr a aplicação ao seu trabalho? Vamos conversar individualmente para rever o que funcionou, esclarecer dúvidas e definir o próximo passo.`,
        `A sessão está incluída no curso e deve realizar-se até 30 dias depois da formação. Traga a sua solução, mesmo que ainda esteja em desenvolvimento.`,
        `O objetivo é sair com uma melhoria concreta e um caminho claro para continuar.`,
      ];
      label = "Agendar a sessão de acompanhamento";
      url = c.after_url || "";
      break;
    default:
      throw new Error("unknown_template");
  }
  const defaultBody=paragraphs.join("\n\n");
  if(override) {
    if(override.subject.length<2 || override.subject.length>160 || /[\r\n]/.test(override.subject) || override.body.length<10 || override.body.length>10000)throw new Error("invalid_template");
    paragraphs=override.body.split(/\n\s*\n/);
  }
  const subject = override?.subject || `${emailLabels[template]} · ${c.label}`;
  const link = safeLink(url);
  const greeting = `Olá, ${c.name.split(" ")[0]}.`;
  const recording =
    template === "resources" && online
      ? `<p><a style="color:#124c67" href="${escapeHTML(safeLink(c.recordings_url))}">Ver as gravações das sessões</a></p>`
      : "";
  const html = `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f2f5f7;color:#102c3d;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#fff"><tr><td style="padding:30px 32px;background:#09212f;color:#fff;font-size:20px;font-weight:bold">Frederico Carvalho</td></tr><tr><td style="padding:32px;font-size:17px;line-height:1.65"><h1 style="font-size:27px;line-height:1.2;margin:0 0 24px">${escapeHTML(emailLabels[template])}</h1><p>${escapeHTML(greeting)}</p>${paragraphs.map((p) => `<p>${escapeHTML(p)}</p>`).join("")}<p style="margin:28px 0"><a href="${escapeHTML(link)}" style="display:inline-block;padding:14px 22px;background:#b7e9fa;color:#09212f;text-decoration:none;font-weight:bold;border-radius:8px">${escapeHTML(label)}</a></p>${recording}<p>Até breve,<br><strong>Frederico Carvalho</strong></p></td></tr><tr><td style="padding:24px 32px;background:#eaf1f5;font-size:14px;line-height:1.6">Curso de inteligência artificial · ${escapeHTML(c.label)}<br>Precisa de ajuda? Responda a este email ou ligue <a style="color:#124c67" href="tel:+351915015508">915 015 508</a>.<br>Mensagem de acompanhamento da sua inscrição.</td></tr></table></td></tr></table></body></html>`;
  return {
    subject,
    body:override?.body || defaultBody,
    html,
    text: [
      emailLabels[template],
      greeting,
      ...paragraphs,
      `${label}: ${link}`,
      template === "resources" && online
        ? `Gravações: ${safeLink(c.recordings_url)}`
        : "",
      "Frederico Carvalho · 915 015 508",
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}
