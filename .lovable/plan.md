
Objetivo: voltar o `/crm` para acesso apenas por email (sem password), restringido exclusivamente a `fredericodigital@gmail.com`, sem voltar a quebrar ações críticas como apagar registos.

1) Reverter o login do CRM para modelo “email-only” (frontend)
- Ficheiro: `src/components/crm/CRMLogin.tsx`
- Alterações:
  - Remover dependência de autenticação por password:
    - retirar `supabase.auth.signInWithPassword`
    - retirar campo de password, estado `password`, `showPassword`, `loading` e ícones Eye/EyeOff
  - Manter apenas:
    - input de email
    - validação `email.toLowerCase().trim() === "fredericodigital@gmail.com"`
    - `sessionStorage.setItem("crm_admin_email", ALLOWED_EMAIL)` + `onLogin()`
  - Mensagem de erro continua simples: “Acesso restrito.”

2) Ajustar o estado de logout para não depender de sessão autenticada
- Ficheiro: `src/pages/CRM.tsx`
- Alterações:
  - `handleLogout` deixa de chamar `supabase.auth.signOut()`
  - mantém apenas limpeza de `sessionStorage` + `setAuthenticated(false)`
- Motivo:
  - no modo email-only não existe sessão de autenticação para terminar.

3) Evitar regressão no “apagar registo” (delete) após remover password
- Problema atual:
  - `registrations` não tem policy de DELETE pública, por isso o delete depende da função backend `delete-registration`.
  - hoje essa função exige JWT + `user_roles` (logo, exige login com password).
- Correção:
  - Ficheiro frontend: `src/hooks/useInscritos.ts`
    - `deleteInscrito` deixa de pedir `supabase.auth.getSession()`
    - envia o email admin da sessão local (ex.: header `x-crm-admin-email`) ao chamar `delete-registration`
  - Ficheiro backend: `supabase/functions/delete-registration/index.ts`
    - remover validação por JWT/user_roles
    - validar apenas allowlist do email admin (`fredericodigital@gmail.com`) recebido no pedido
    - manter o delete com credencial de serviço (como já existe)
- Resultado:
  - continua sem password no `/crm`
  - apagar volta a funcionar com o modelo pedido (email-only).

4) Pequeno ajuste de consistência no “grant premium”
- Ficheiro: `src/pages/CRM.tsx`
- Alteração:
  - onde hoje usa `supabase.auth.getUser()` para obter email do admin, passar diretamente o email permitido (`fredericodigital@gmail.com`) no `grantPremium`.
- Motivo:
  - evitar dependência de sessão autenticada num fluxo que volta a ser email-only.

5) Validação final (checklist)
- `/crm` mostra apenas campo de email (sem password).
- `fredericodigital@gmail.com` entra com sucesso.
- qualquer outro email é bloqueado.
- logout limpa acesso local e volta ao login.
- apagar registo funciona novamente no CRM sem exigir password.
- não há mudanças em templates de email, páginas públicas ou outras funções fora do necessário.

Notas técnicas importantes
- O modelo email-only é de conveniência e menos robusto que autenticação completa.
- A implementação seguirá exatamente o comportamento que pediste (como antes), com foco em manter o fluxo operacional do CRM sem password.
