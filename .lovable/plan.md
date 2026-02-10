

# Melhorias: Countdown + Sticky + Modal + Referral + Footer

---

## 1. StickyTopBar -- Corrigir sticky + melhorar visibilidade countdown

### Problema sticky
O `overflow-x-hidden` no `<main>` do Index.tsx interfere com `position: sticky`. Solucao: mover a StickyTopBar para **fora** do `<main>` (antes dele) no Index.tsx, ou usar `fixed top-0` em vez de `sticky`.

Abordagem escolhida: mudar de `sticky top-0` para `fixed top-0` e adicionar padding-top ao `<main>` para compensar a altura da barra.

### Melhorar visibilidade countdown
- Fundo dos blocos: de `bg-white/10` para `bg-white/20`
- Numeros: de `text-[14px]` para `text-[16px]`
- Labels: de `text-white/60` para `text-white/70`
- Separadores `:`: de `text-white/40` para `text-white/60`

**Ficheiros:** `src/components/landing/StickyTopBar.tsx`, `src/pages/Index.tsx`

---

## 2. Modal -- Adicionar campo WhatsApp + checkbox RGPD

### CaptureView -- novo campo e checkbox

Adicionar ao formulario de captura (Step 1):
- Terceiro campo: icone Phone + placeholder "O teu WhatsApp" (type="tel")
- Checkbox RGPD com texto legal completo (texto pequeno, 11px):
  > "Nao utilizo a tua informacao para enviar SPAM. Os teus dados pessoais vao ser tratados pela Fomentar Sonhos., Lda., apos obter o teu consentimento previo, unicamente para o envio de comunicacoes de "Frederico Carvalho". Aceito a politica de privacidade e os termos e condicoes comerciais."
- O botao "Reservar o meu lugar" fica desabilitado ate o checkbox estar marcado
- Validacao: nome, email e checkbox obrigatorios; WhatsApp opcional

### Estado no RegistrationModal
- Novo estado `whatsapp` (string)
- Novo estado `acceptedTerms` (boolean)
- Passar ambos para CaptureView

### Backend -- nova coluna
- Adicionar coluna `whatsapp` (text, nullable) a tabela `registrations`
- Actualizar edge function `register-free` para aceitar e gravar o campo `whatsapp`

**Ficheiros:** `src/components/landing/RegistrationModal.tsx`, `supabase/functions/register-free/index.ts`, + migracao SQL

---

## 3. Referral -- Mudar comportamento do botao "Prefiro convidar 2 amigos"

### Problema actual
O botao "Prefiro convidar 2 amigos e ganhar gratis" vai directamente para a confirmacao com referral widget. Nao incentiva o upgrade.

### Novo comportamento
Ao clicar neste botao:
1. Mostrar a confirmacao (step "confirmation", mode "referral") **mas com uma mensagem extra**:
   - Texto: "Enviamos as instrucoes para o teu email. Entretanto, podes ainda fazer upgrade para Premium."
   - Botao secundario: "Fazer upgrade agora por EUR15+IVA" que navega para `/upgrade?name=...&email=...`
2. Manter o widget de partilha (copiar link, WhatsApp, Email)
3. Manter o link "Ver estado dos convites"

Na pratica, a ConfirmationView em mode "referral" passa a incluir um bloco extra com CTA de upgrade.

**Ficheiro:** `src/components/landing/RegistrationModal.tsx`

---

## 4. Footer -- Adicionar link "Ver os teus convites"

Adicionar ao footer um quarto link: "Ver os teus convites" apontando para `/convites`.

**Ficheiro:** `src/components/landing/FooterSection.tsx`

---

## Resumo de ficheiros alterados

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/StickyTopBar.tsx` | fixed top-0, melhorar contraste countdown |
| `src/pages/Index.tsx` | Mover StickyTopBar para fora do main, ou adicionar pt ao main |
| `src/components/landing/RegistrationModal.tsx` | Campo WhatsApp, checkbox RGPD, CTA upgrade na confirmacao referral |
| `supabase/functions/register-free/index.ts` | Aceitar e gravar campo whatsapp |
| `src/components/landing/FooterSection.tsx` | Link "Ver os teus convites" |
| Migracao SQL | ALTER TABLE registrations ADD COLUMN whatsapp text |

---

## Sequencia de implementacao

1. Migracao SQL (adicionar coluna whatsapp)
2. Actualizar edge function register-free
3. StickyTopBar (fixed + contraste)
4. Index.tsx (padding-top)
5. RegistrationModal (WhatsApp, checkbox, referral CTA)
6. FooterSection (link convites)

