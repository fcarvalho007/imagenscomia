

# Implementar Login com Email + Password e 2FA TOTP no CRM

## Situação actual
O CRM usa apenas verificação de email hardcoded (sem password, sem auth real). `sessionStorage` guarda o email — facilmente manipulável.

## Plano

### 1. Criar conta Supabase Auth para o admin
- Usar `supabase.auth.signUp()` com email `fredericodigital@gmail.com` e uma password definida pelo utilizador
- Activar auto-confirm para este signup (ou confirmar manualmente)
- A trigger `auto_assign_admin` já existe e atribui role `admin` automaticamente

### 2. Activar MFA TOTP no Supabase Auth
O Supabase Auth tem suporte nativo a TOTP (RFC 6238). O fluxo:
- Após login com email+pass, chamar `supabase.auth.mfa.enroll({ factorType: 'totp' })` para obter o QR code
- O utilizador digitaliza com Google Authenticator / Authy
- Verificar com `supabase.auth.mfa.challengeAndVerify()`
- Nas sessões seguintes, após login com pass, pedir o código TOTP de 6 dígitos

### 3. Refazer `CRMLogin.tsx` — 3 ecrãs
1. **Ecrã 1 — Email + Password**: campos de email e password, botão "Entrar"
2. **Ecrã 2 — Setup TOTP** (apenas na 1ª vez): mostra QR code + campo para confirmar código
3. **Ecrã 3 — Verificar TOTP** (sessões seguintes): campo de 6 dígitos com o componente InputOTP já existente

### 4. Actualizar `CRM.tsx`
- Substituir a verificação `sessionStorage` por `supabase.auth.getSession()` + `onAuthStateChange`
- Após login, verificar role `admin` via `has_role()` ou query a `user_roles`
- Logout passa a chamar `supabase.auth.signOut()`

### 5. Actualizar Edge Functions
- As Edge Functions que usam `x-crm-admin-email` continuam a funcionar — o header é enviado pelo frontend após autenticação real

### Ficheiros alterados
- `src/components/crm/CRMLogin.tsx` — reescrita completa (3 ecrãs)
- `src/pages/CRM.tsx` — auth state via Supabase Auth em vez de sessionStorage

### Notas
- Não é necessária migração de BD — `user_roles` e `has_role()` já existem
- O componente `InputOTP` já está instalado e disponível para o ecrã TOTP
- Auto-confirm será activado temporariamente para criar a conta, depois desactivado

