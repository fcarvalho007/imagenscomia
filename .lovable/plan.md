

# Bug: /recursos dá "Erro de ligação" para utilizadores com inscrição em dois webinars

## Causa raiz

A query em `RecursosLogin.tsx` (e em `Recursos.tsx` na re-validação) usa `.maybeSingle()` sem filtrar por webinar. Utilizadores inscritos em **ambos** os webinars (imagens + vídeo) têm 2 linhas na tabela `registrations`. O `.maybeSingle()` do Supabase retorna **erro** quando há mais de 1 resultado — e o código interpreta esse erro como "network", mostrando "Erro de ligação".

Isto afecta todos os utilizadores com inscrição dupla (confirmado: fredericodigital@gmail.com, amargaridapregueiro@gmail.com, e muitos outros).

## Solução

A página de recursos pertence ao webinar de **imagens**. Adicionar `.eq("webinar", "imagens")` à query garante que retorna no máximo 1 linha. Adicionalmente, como fallback para utilizadores que só têm inscrição no webinar de vídeo com acesso pago, podemos tentar o outro webinar se o primeiro não tiver acesso.

**Abordagem mais simples e robusta:** trocar `.maybeSingle()` por `.limit(1)` com ordenação que priorize registos com acesso pago, sem filtrar por webinar — assim funciona para qualquer utilizador com acesso em qualquer webinar.

### Ficheiros a alterar

**1. `src/components/recursos/RecursosLogin.tsx`** (linhas 34-38)
- Substituir `.maybeSingle()` por `.order("paid_at", { ascending: false, nullsFirst: false }).order("premium_granted_at", { ascending: false, nullsFirst: false }).limit(1)` e usar `data[0]`
- Isto prioriza o registo que tem `paid_at` ou `premium_granted_at` preenchido

**2. `src/pages/Recursos.tsx`** (linhas 33-38, re-validação silenciosa)
- Mesma correcção: trocar `.maybeSingle()` por query com `.limit(1)` e ordenação que priorize acesso pago

### Detalhe técnico

```typescript
// Antes (falha com 2+ linhas):
.eq("email", email).maybeSingle()

// Depois (prioriza registo com acesso):
.eq("email", email)
.order("paid_at", { ascending: false, nullsFirst: false })
.order("premium_granted_at", { ascending: false, nullsFirst: false })
.limit(1)
// e usar data?.[0] em vez de data
```

