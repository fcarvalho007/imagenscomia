

## Juntar campos de nome no modal e separar no CSV

### 1. Modal de Registo (`RegistrationModal.tsx`)

Substituir os dois campos "Primeiro Nome" e "Ultimo Nome" por um unico campo "Primeiro e Ultimo nome". Ao submeter, o sistema separa automaticamente:
- Primeira palavra = `firstName`
- Resto = `lastName`

Isto simplifica o formulario para o utilizador sem perder a separacao na base de dados.

**Validacao**: Se a pessoa escrever apenas uma palavra, o `lastName` fica vazio (string vazia). A validacao actual muda de "Primeiro nome e ultimo nome sao obrigatorios" para apenas verificar se o campo nao esta vazio.

**Alteracoes**:
- Remover o state `lastName` separado
- Criar um unico state `fullName`
- No submit, fazer split: `firstName = fullName.split(" ")[0]`, `lastName = fullName.split(" ").slice(1).join(" ")`
- Substituir os dois inputs por um unico com placeholder "Primeiro e Ultimo nome"
- Actualizar todas as referencias a `firstName`/`lastName` no componente (close handler, navigate calls, etc.)

### 2. Tipo Inscrito (`mockData.ts`) e mapeamento (`useInscritos.ts`)

Adicionar `primeiro_nome` e `resto_nome` ao tipo `Inscrito` para que o CSV possa aceder a estes campos separadamente.

**mockData.ts**: Adicionar ao tipo:
```
primeiro_nome: string;
resto_nome: string;
```

**useInscritos.ts**: No `mapRegistration`, mapear:
```
primeiro_nome: r.first_name || (r.name || "").split(" ")[0] || "",
resto_nome: r.last_name || (r.name || "").split(" ").slice(1).join(" ") || "",
```

### 3. Exportacao CSV (`TableView.tsx`)

Alterar o header e as rows do CSV para incluir "Primeiro Nome" e "Resto do Nome" como colunas separadas em vez de "Nome".

**Header**: `"Primeiro Nome;Resto do Nome;Email;WhatsApp;Plano;Valor;Passo;Duvida;Inscricao;Notas"`

**Row**: Usar `i.primeiro_nome` e `i.resto_nome` em vez de `i.nome`.

### Resumo de ficheiros

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/RegistrationModal.tsx` | Juntar 2 campos de nome num so; split ao submeter |
| `src/pages/crm/mockData.ts` | Adicionar `primeiro_nome` e `resto_nome` ao tipo |
| `src/hooks/useInscritos.ts` | Mapear `first_name`/`last_name` da DB |
| `src/components/crm/TableView.tsx` | CSV com colunas separadas |

