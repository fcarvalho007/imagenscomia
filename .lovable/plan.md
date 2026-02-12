

## Detectar emails duplicados no modal + garantir captura no CRM

### Problema 1: Modal nao avisa quando o email ja esta registado

A edge function `register-free` ja devolve `alreadyRegistered: true` quando o email existe, mas o modal ignora esse campo e navega sempre para `/upgrade` sem avisar o utilizador.

### Problema 2: CRM pode nao mostrar registos recentes

O CRM carrega os dados uma unica vez ao montar o componente (`useEffect` sem dependencias). Se alguem se regista enquanto o CRM esta aberto, o novo registo so aparece ao recarregar a pagina.

---

### Solucao

#### 1. Modal - mostrar aviso de email duplicado

**Ficheiro:** `src/components/landing/RegistrationModal.tsx`

- Na funcao `registerFree()`, verificar o campo `alreadyRegistered` da resposta
- Se `alreadyRegistered === true`, mostrar uma mensagem de erro no formulario: "Este email ja esta inscrito. Usa outro email ou verifica a tua caixa de entrada."
- Nao navegar para `/upgrade` neste caso - manter o utilizador no formulario para corrigir o email
- Continuar a disparar `fbq('track', 'Lead')` apenas para registos novos

#### 2. CRM - adicionar botao de refresh e/ou auto-refresh

**Ficheiro:** `src/hooks/useInscritos.ts`

- Expor uma funcao `refresh()` que re-executa a query a base de dados
- Adicionar auto-refresh com intervalo de 30 segundos para manter os dados atualizados

**Ficheiro:** `src/components/crm/DashboardView.tsx`

- Adicionar um botao "Atualizar" no topo do dashboard para forcar o refresh manual

---

### Alteracoes tecnicas

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/RegistrationModal.tsx` | Verificar `alreadyRegistered` na resposta e mostrar erro em vez de navegar |
| `src/hooks/useInscritos.ts` | Expor funcao `refresh()` e adicionar auto-refresh a cada 30s |
| `src/components/crm/DashboardView.tsx` | Botao "Atualizar" que chama `refresh()` |
| `src/pages/CRM.tsx` | Passar `refresh` do hook para os componentes |

