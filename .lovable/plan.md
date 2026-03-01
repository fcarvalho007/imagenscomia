
# Correcao: registo apagado tratado como utilizador existente

## Problema

O `register-free` verifica se o email ja existe na tabela `registrations` **sem filtrar por webinar** (linha 43-49). Quando se apaga um registo do webinar "video" pelo CRM, o registo antigo do webinar "imagens" continua a existir. Ao re-registar para "video", a funcao encontra o registo de "imagens" e devolve `alreadyRegistered: true`, o que activa o modal "Ola de novo" e envia o template `video_confirmation_returning` em vez do `video_confirmation`.

## Analise detalhada

1. **`register-free` (linha 43-49)**: faz `.eq("email", ...)` sem `.eq("webinar", webinar)` — encontra qualquer registo do email, incluindo de outros webinars
2. **`send-video-confirmation` (linha 28-38)**: verifica historico do webinar "imagens" para decidir se e "returning" — isto e intencional para personalizar o email, mas o flag `alreadyRegistered` na resposta do `register-free` e que causa o problema do modal
3. **Frontend (`RegistrationModal.tsx`, linha 61-66)**: quando recebe `alreadyRegistered: true`, redireciona para o upgrade com parametros de utilizador existente, o que activa o ecrã "Welcome Back"

## Correcao

### Ficheiro 1: `supabase/functions/register-free/index.ts`

Alterar a query de verificacao de existencia (linhas 43-49) para filtrar pelo webinar especifico:

```text
// ANTES (linha 43-49):
const { data: existing } = await supabase
  .from("registrations")
  .select("referral_code, premium_unlocked, first_name, last_name, whatsapp, webinar")
  .eq("email", email.toLowerCase().trim())
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

// DEPOIS:
const targetWebinar = webinar || "imagens";
const { data: existing } = await supabase
  .from("registrations")
  .select("referral_code, premium_unlocked, first_name, last_name, whatsapp, webinar")
  .eq("email", email.toLowerCase().trim())
  .eq("webinar", targetWebinar)
  .maybeSingle();
```

Isto garante que:
- Se apagaste o registo "video", ao re-registar nao encontra o registo "imagens"
- O registo e tratado como novo e cria-se uma nova entrada para o webinar correcto
- O email de confirmacao sera o `video_confirmation` (novo utilizador) e nao o `video_confirmation_returning`

### Impacto no fluxo existente

A logica de criar registo "video" para utilizadores que ja tinham "imagens" (linhas 93-138) continua a funcionar correctamente porque:
- Se o email tem registo "imagens" mas nao "video", a query agora nao encontra nada → cria registo novo
- Dentro do bloco de novo registo (linha 241+), ja existe a logica de video confirmation e egoi-sync

A unica perda e que utilizadores que vem do webinar "imagens" ja nao terao os dados (nome, whatsapp) copiados automaticamente do registo anterior. Mas como estao a preencher o formulario de inscricao, esses dados ja vem no request body.

### Nenhuma alteracao no frontend

O frontend ja funciona correctamente — o problema estava apenas no backend a devolver `alreadyRegistered: true` incorrectamente.

## Verificacao pos-correcao

1. Apagar o registo `fredericodigital@gmail.com` / `video` do CRM
2. Registar novamente na landing page do video
3. Confirmar que o sistema trata como novo utilizador (sem modal "Ola de novo")
4. Confirmar que o email recebido e o `video_confirmation` (e nao `video_confirmation_returning`)
