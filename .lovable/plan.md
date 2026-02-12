

## Simplificar cards do Pipeline e rever espaçamentos

### O que muda

**1. Remover avatar com iniciais e emojis de genero**
- Pipeline cards: remover o circulo colorido com iniciais ("FT") e o emoji de genero (🔵/🌸/⚪) do nome
- Tabela: remover o mesmo avatar e emoji da coluna Nome

**2. Simplificar o conteudo do card no Pipeline**
Cada card passa a ter apenas:
- Nome (sem avatar, sem emoji)
- Email
- Badge do plano (Gratuito / Premium / MC / Bundle)
- Data de inscricao

Elementos removidos do card:
- Avatar com iniciais (circulo colorido)
- Emoji de genero
- Badge "Passo X/5"
- Linha da duvida (icone + texto)
- Icones de notas e link externo
- Botao WhatsApp hover

**3. Rever espaçamentos**
- Reduzir padding interno dos cards de `p-3.5` para `p-3`
- Ajustar gaps verticais entre elementos do card (mt-1.5 / mt-2 para mt-1)
- Na tabela: remover avatar e emoji da coluna Nome, manter restante layout

### Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/PipelineView.tsx` | Simplificar `PipelineCard` removendo avatar, emoji, passo, duvida, notas, WhatsApp. Manter nome, email, badge plano, data. Ajustar spacing. |
| `src/components/crm/TableView.tsx` | Remover avatar com iniciais e emoji de genero da coluna Nome. |

### Estrutura do card simplificado (Pipeline)

```text
+---------------------------+
| Nome Completo             |
| email@exemplo.pt          |
| [Gratuito]                |
| 12 Fev · 17:33            |
+---------------------------+
```
