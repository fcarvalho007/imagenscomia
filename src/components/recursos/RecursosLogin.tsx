import RecursosAccessRequest from "./RecursosAccessRequest";

/** Access recovery for the "Imagens com IA" resources area. */
export default function RecursosLogin() {
  return (
    <RecursosAccessRequest
      eyebrow="Imagens com IA"
      title="Recursos do Webinar"
      subtitle="Gravação · Guia de apoio · Biblioteca de prompts"
      footnote="Área privada para participantes pagos."
      inputId="email"
      destination="recursos"
      homeHref="/"
      buyHref="/gravacao"
    />
  );
}
