
# Modal de registo adaptado ao contexto + Footer igual a /inicial

## Resumo

Duas alteracoes:
1. O modal de registo (RegistrationModal) precisa de mostrar a data correcta do webinar de video ("Terca-feira, 3 de Marco, 21h") quando aberto a partir da pagina /video
2. O footer da pagina /video deve ser substituido pelo componente FooterSection reutilizado da /inicial

---

## Ficheiros a modificar

### 1. `src/hooks/useRegistrationModal.tsx`

Adicionar um campo `subtitle` ao contexto para permitir que cada pagina configure o subtitulo do modal:
- Tipo: `string` (opcional)
- Default: `"Quarta-feira, 18 de Fevereiro, 10h"`
- O `RegistrationModalProvider` recebe uma nova prop `subtitle`
- Exposto via `useRegistrationModal()`

### 2. `src/components/landing/RegistrationModal.tsx`

No `CaptureView`:
- Ler `subtitle` do contexto via `useRegistrationModal()`
- Substituir o texto hardcoded `"Quarta-feira, 18 de Fevereiro, 10h"` por `subtitle`
- Passar `subtitle` como prop ao `CaptureView`

### 3. `src/pages/Video.tsx`

Duas alteracoes:

**a) Provider com subtitle:**
- Alterar o `RegistrationModalProvider` no wrapper para incluir `subtitle="Terca-feira, 3 de Marco, 21h"`

**b) Footer — substituir pelo componente FooterSection:**
- Importar `FooterSection` de `@/components/landing/FooterSection`
- Remover o bloco `<footer>` inline (linhas 1007-1020) e os `LegalModal` associados (linhas 1022-1028)
- Remover o state `legalModal` e as importacoes de `LegalModal`, `TermosContent`, `PrivacidadeContent` (ja incluidos no FooterSection)
- Colocar `<FooterSection />` no lugar do footer antigo

---

## Resultado esperado

- Ao clicar em qualquer CTA na /video, o modal abre com:
  - Titulo: "Quero confirmar o meu lugar para o Webinar Gratuito — Ao Vivo"
  - Subtitulo: "Terca-feira, 3 de Marco, 21h"
  - Campos: Nome, Email, WhatsApp
  - Checkbox com texto de autorizacao e links para Privacidade/Termos
  - Botao: "Reservar o meu lugar"
- O footer da /video fica identico ao da /inicial (com links Privacidade, Termos, email, convites, crm)
