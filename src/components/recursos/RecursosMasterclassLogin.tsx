import RecursosAccessRequest from "./RecursosAccessRequest";

/** Access recovery for the Masterclass resources area. */
export default function RecursosMasterclassLogin() {
  return (
    <RecursosAccessRequest
      eyebrow="Masterclass · Vídeo com IA"
      title="Recursos da Masterclass"
      subtitle="Gravação · Materiais · Exercícios"
      footnote="Área privada para participantes da Masterclass."
      inputId="email-masterclass"
      destination="recursos-masterclass"
      buttonClassName="bg-green-600 hover:bg-green-700"
      linkClassName="text-green-600"
      homeHref="/video"
      buyHref="/upgrade-video"
    />
  );
}
