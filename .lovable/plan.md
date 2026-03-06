

# Auditoria do fluxo "Enviar SMS agora"

## Problema encontrado: Header de autenticação vazio

Na linha 743 do `AutomationFlowTab.tsx`, o código de envio de SMS faz:

```typescript
const adminEmail = sessionStorage.getItem("crm_admin_email") || "";
```

Mas o CRM foi migrado para Supabase Auth — já não guarda nada em `sessionStorage`. O header `x-crm-admin-email` vai vazio (`""`), e a Edge Function `send-sms` valida:

```typescript
const validAdmin = adminEmail?.toLowerCase() === ALLOWED_ADMIN;
```

Resultado: **todos os SMS vão falhar com 401 Unauthorized**.

## Restante fluxo (está correcto)

| Passo | Estado |
|-------|--------|
| Filtragem por plano (`premium`, `masterclass`, `bundle`) | OK — usa `i.plan` e `config.planFilter` |
| Filtragem por webinar (`i.webinar !== webinar`) | OK |
| Filtragem por telefone (`i.whatsapp`) | OK |
| Exclusão de `do_not_contact` | OK |
| Texto da SMS (com drafts localStorage) | OK |
| Provider (`egoi`) | OK — E-goi API configurada |
| Logging em `message_logs` | OK |
| Confirmação antes de enviar | OK |

## Correcção necessária

**Ficheiro**: `src/components/crm/AutomationFlowTab.tsx`, linha ~743

Substituir `sessionStorage.getItem("crm_admin_email")` pelo email da sessão Supabase Auth:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const adminEmail = session?.user?.email || "";
```

Uma única alteração. Sem isto, o botão "Enviar SMS agora" vai devolver 401 para cada destinatário.

