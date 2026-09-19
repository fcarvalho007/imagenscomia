import RecursosAccessRequest from "./RecursosAccessRequest";

/** Access recovery for the "Vídeo com IA" resources area. */
export default function RecursosVideoLogin() {
  return (
    <RecursosAccessRequest
      eyebrow="Vídeo com IA"
      title="Recursos do Webinar"
      subtitle="Gravação · Guia de apoio · Biblioteca de prompts"
      footnote="Área privada para participantes pagos."
      inputId="email-video"
      destination="recursos-video"
      buttonClassName="bg-green-600 hover:bg-green-700"
      linkClassName="text-green-600"
      homeHref="/video"
      buyHref="/upgrade-video"
    />
  );
}
