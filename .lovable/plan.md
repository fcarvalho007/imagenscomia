

# Remover password do CRM Login — acesso apenas por email

## Resumo

Substituir o login com email+password por **Magic Link** (link enviado por email). O utilizador insere apenas o email, recebe um link no email e clica para entrar. Apenas `fredericodigital@gmail.com` e aceite.

## Alteracoes

### 1. `src/components/crm/CRMLogin.tsx`

- Remover campo de password completamente
- Validar no client que o email e exactamente `fredericodigital@gmail.com` antes de enviar (camada extra de proteccao)
- Substituir `signInWithPassword` por `signInWithOtp({ email })` que envia um Magic Link
- Mostrar mensagem de sucesso apos envio ("Verifica o teu email")
- Remover toda a logica de signup (ja nao e necessaria)

### 2. `src/pages/CRM.tsx`

- Sem alteracoes — o fluxo `onAuthStateChange` e `checkAdminRole` ja validam o admin via `user_roles`. Quando o utilizador clica no magic link, o Supabase autentica-o e o `onAuthStateChange` dispara automaticamente.

### 3. Seguranca

- **Client-side**: Rejeita qualquer email diferente de `fredericodigital@gmail.com` antes de enviar o OTP
- **Server-side**: O `user_roles` + RLS continuam a garantir que so admins acedem ao CRM (nao muda nada)
- **Edge functions**: Continuam a validar JWT + admin role (nao muda nada)

## Fluxo do utilizador

1. Acede a `/crm`
2. Insere `fredericodigital@gmail.com`
3. Clica "Entrar"
4. Recebe email com link magico
5. Clica no link → redireccionado para `/crm` ja autenticado

## Detalhe tecnico

A chamada `supabase.auth.signInWithOtp({ email })` envia um email com um link de autenticacao. Quando o utilizador clica, o Supabase cria uma sessao e o `onAuthStateChange` no `CRM.tsx` detecta a sessao, verifica o role admin na tabela `user_roles`, e mostra o dashboard.

