
# Correcao: Telefone duplicado +351 no E-goi

## Problema encontrado

Os logs mostram o erro:

```
'+351351915015508' is not a valid phone format
```

O prefixo `+351` esta a ser adicionado **duas vezes**:

1. `register-free/index.ts` (linha 203) envia: `phone: "+351915015508"`
2. `egoi-sync/index.ts` (linha 100) recebe e faz: `+351` + `351915015508` = `+351351915015508`

O E-goi rejeita com erro 422 e o contacto nao e criado, logo a tag nunca e aplicada.

---

## Solucao

**Ficheiro:** `supabase/functions/egoi-sync/index.ts`, linha 98-101

Alterar a logica de formatacao do telefone para primeiro remover qualquer prefixo `+351` existente antes de re-aplicar:

```typescript
const digits = phone.replace(/\D/g, "");
// Remove leading 351 country code if already present
const localDigits = digits.startsWith("351") ? digits.slice(3) : digits;
const cellphone = localDigits.length >= 9
  ? `+351${localDigits}`
  : undefined;
```

Isto garante que independentemente de o telefone chegar como `915015508`, `+351915015508`, ou `351915015508`, o resultado sera sempre `+351915015508`.

---

## Alternativa mais simples

Alterar `register-free` para enviar o telefone **sem prefixo** (apenas digitos locais), e deixar o `egoi-sync` adicionar o `+351`:

**Ficheiro:** `supabase/functions/register-free/index.ts`

Nas 2 chamadas a egoi-sync (linhas ~87 e ~203), mudar de:
```typescript
phone: cleanPhone ? `+351${cleanPhone.replace(/\D/g, "")}` : ""
```
para:
```typescript
phone: cleanPhone || ""
```

E manter o `egoi-sync` a adicionar o prefixo. Mas a primeira opcao e mais robusta.

---

## Recomendacao

Usar a primeira opcao (normalizar no `egoi-sync`) porque protege contra qualquer formato de entrada. Depois re-deploy de `egoi-sync`.

Nenhum outro ficheiro precisa de ser alterado.
