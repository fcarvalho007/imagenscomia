

## Correcoes na secção Dificuldades e Duvidas

### Bug 1: "Outro (texto livre)" inflacionado a 21

**Causa raiz**: O campo `duvida` e dividido com `.split(", ")`, mas a opcao predefinida `"Nao percebo que ferramenta usar (ChatGPT, Google, outros...)"` contem virgulas internas. Ao dividir, gera fragmentos como `"ChatGPT"`, `"Google"`, `"outros...)"` que nao correspondem a nenhuma opcao predefinida e sao todos contados como "Outro".

**Solucao**: Em vez de split por virgula, usar uma logica de matching que procura as 5 opcoes predefinidas no texto e remove-as progressivamente. O que sobrar (se comecar com "Outro:") e o texto personalizado real.

Algoritmo:
1. Para cada `duvida`, comecar com o texto completo
2. Para cada opcao predefinida, verificar se esta presente no texto (com `includes`)
3. Se sim, incrementar o contador e remover do texto
4. O que sobrar apos remover todas as predefinidas, se conter "Outro:", conta como personalizado

### Bug 2: 0 personalizadas vs 21 "Outro"

Consequencia directa do Bug 1. Nenhum registo real contem "Outro:" no texto — a contagem "Outro" vinha dos fragmentos partido por virgula. A correcao do Bug 1 resolve automaticamente ambos os problemas.

### Melhoria 1: Remover icone checkbox

Remover o `span` com `☑️` que aparece antes de cada entrada na lista de "Duvidas dos Inscritos". So manter o `✍️` para personalizadas (via o fundo amber e badge ja existentes).

### Melhoria 2: Duvidas em paragrafos separados

Quando um utilizador seleccionou mais do que uma duvida, em vez de mostrar tudo numa linha so separada por virgulas, mostrar cada opcao como um paragrafo/bullet separado para melhor legibilidade.

---

### Ficheiro afectado

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/DashboardView.tsx` | (1) Corrigir parsing de dificuldades — usar `includes` por opcao em vez de split por virgula. (2) Remover icone checkbox da lista de duvidas. (3) Renderizar cada duvida seleccionada como paragrafo separado. |

