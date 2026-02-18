
Vou adaptar o modal de captura para a realidade da página `/live`. Quando o utilizador clica nos botões de upgrade (Premium ou Masterclass), o modal passará a apresentar um contexto de "Upgrade" em vez de "Inscrição Gratuita", mantendo no entanto a recolha de dados e o aviso de RGPD conforme solicitado.

### Alterações Planeadas

#### 1. Sidebar do Webinar (`src/components/webinar/WebinarSidebar.tsx`)
- Alterar as chamadas da função `open("free")` para `open("premium")` em ambos os botões ("Garantir Premium Pass" e "Garantir lugar na Masterclass").
- Isto permite que o modal identifique que o objetivo do utilizador é um upgrade e não apenas a inscrição gratuita inicial.

#### 2. Modal de Registo (`src/components/landing/RegistrationModal.tsx`)
- **Deteção da Variante**: Vou extrair o valor `variant` do hook `useRegistrationModal`.
- **Passagem de Props**: Passar a `variant` para o componente interno `CaptureView`.
- **Conteúdo Dinâmico no CaptureView**:
    - **Título**: Se a variante for `premium`, o título mudará para "Upgrade para Premium & Masterclass" (ou similar), removendo a menção a "Webinar Gratuito".
    - **Subtítulo**: Em vez da data do evento, mostrará algo como "Indique os seus dados para aceder à gravação, prompts e bónus exclusivos".
    - **Botão de Submissão**: O texto mudará de "Reservar o meu lugar" para "Sim, avançar para o upgrade", mantendo a estratégia de micro-compromisso ("Sim").
- **Manutenção**: Todos os campos (Nome, Email, WhatsApp) e a caixa de aceitação de termos/RGPD permanecerão inalterados.

### Lógica de Fluxo
Ao submeter os dados no modal, o fluxo continuará a redirecionar o utilizador para a página `/upgrade`, que é o funil de checkout completo onde o utilizador finaliza a compra do Premium ou da Masterclass. Esta abordagem garante que capturamos os dados do utilizador (caso ele tenha chegado à página `/live` por link direto) antes de o enviar para o checkout.

---

### Detalhes Técnicos

#### WebinarSidebar.tsx
Modificar os botões para usar a variante correta:
```tsx
// ...
onCtaClick={() => open("premium")}
// ...
```

#### RegistrationModal.tsx
Atualizar o `CaptureView` para lidar com a variante:
```tsx
const CaptureView = ({ ..., variant }: { ..., variant: "free" | "premium" }) => {
  const isPremium = variant === "premium";
  return (
    <>
      <h3 className="...">
        {isPremium ? (
          "Upgrade para Premium & Masterclass"
        ) : (
          <>Quero confirmar o meu lugar para o Webinar <span className="...">Gratuito</span> — Ao Vivo</>
        )}
      </h3>
      <p className="...">
        {isPremium 
          ? "Preencha os dados abaixo para aceder à gravação e bónus exclusivos."
          : "Quarta-feira, 18 de Fevereiro, 10h"}
      </p>
      {/* ... campos iguais ... */}
      <button ...>
        {loading ? "A processar..." : (isPremium ? "Sim, avançar para o upgrade" : "Reservar o meu lugar")}
      </button>
    </>
  );
}
```
