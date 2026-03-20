

# Adicionar email admin `comunicacao@fredericocarvalho.pt` às 3 páginas de recursos

## Problema
O email `comunicacao@fredericocarvalho.pt` não tem registo na base de dados, logo não consegue fazer login nas páginas de recursos. É preciso permitir acesso directo como "admin bypass".

## Solução

Adicionar uma lista de emails admin que fazem bypass à validação de base de dados nos 3 componentes de login. Quando o email inserido está na lista, o login é concedido imediatamente com dados simulados (nome "Equipa", plan "bundle"), sem consultar a base de dados.

## Ficheiros alterados

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/recursos/RecursosLogin.tsx` | Adicionar bypass para `comunicacao@fredericocarvalho.pt` antes da query à BD |
| `src/components/recursos/RecursosVideoLogin.tsx` | Idem |
| `src/components/recursos/RecursosMasterclassLogin.tsx` | Idem |

## Lógica do bypass (igual nos 3 ficheiros)

Dentro de `handleSubmit`, antes da query à BD:

```typescript
const ADMIN_EMAILS = ["comunicacao@fredericocarvalho.pt"];
const normalizedEmail = email.toLowerCase().trim();

if (ADMIN_EMAILS.includes(normalizedEmail)) {
  // Set sessionStorage + call onAuthed with simulated data
  // name: "Equipa", plan: "bundle", token: "admin"
  return;
}
```

Isto permite partilhar o email com colegas de equipa sem criar registos fictícios na base de dados.

