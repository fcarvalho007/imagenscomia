
## Refino da Secção "Dúvidas dos Inscritos" — Diferenciação Clara

### Problema Atual
A secção "Dúvidas dos Inscritos" mostra todas as respostas de forma uniforme, com apenas um badge "✍️ Personalizada" para diferenciar respostas que contêm "Outro:". Isto dificulta a identificação visual rápida do tipo de resposta e o seu valor estratégico.

### Análise do Fluxo de Dados
O campo `duvida` armazena um string com:
- **Respostas predefinidas**: concatenadas por ", " (ex: "Não sei descrever o estilo visual que quero, Os resultados ficam sempre genéricos...")
- **Respostas personalizadas**: incluem "Outro: [texto livre]" (ex: "Não sei descrever..., Outro: preciso de feedback visual")

A função `StepPersonalization.tsx` cria estas strings ao juntar as opções selecionadas, e adiciona `Outro: [texto]` se o utilizador escrever texto livre.

### Solução Proposta

**1. Cartão com Fundo Diferenciado**
- **Respostas Predefinidas** (apenas opções selecionadas): 
  - Fundo branco limpo
  - Badge azul com ícone de checkbox (☑️) — indica "seleção predefinida"
  
- **Respostas Personalizadas** (incluem "Outro:"):
  - Fundo amber/laranja sutil (`bg-amber-50`) — destaque visual imediato
  - Badge amber com ícone de lápis (✍️) — "personalizada"
  - Texto "Outro:" em **negrito + cor escura** para destacar a parte personalizada

**2. Reorganização Visual**
- Manter a ordenação: respostas personalizadas no topo
- Adicionar um mini-ícone no início da linha com o nome:
  - 🔵 para seleções predefinidas
  - ✍️ para personalizadas
  
**3. Destacar a Parte Personalizada**
- Na descrição da dúvida, quando houver "Outro:", formatar assim:
  ```
  Não sei descrever..., Os resultados ficam... ✍️ Outro: "preciso de feedback visual personalizado"
  ```
  - Texto antes de "Outro:" em cinza claro
  - "Outro:" + texto em **negrito + cor âmbar/escura**
  - Citação/box ao redor da resposta personalizada para maior destaque

**4. Indicador de Valor Estratégico**
- Adicionar um pequeno label "Insight Estratégico" (opcional) com ícone 💡 para respostas personalizadas, reforçando que estas são mais valiosas

### Ficheiros Afectados

| Ficheiro | Alteração |
|---|---|
| `src/components/crm/DashboardView.tsx` | Refinar a secção "Dúvidas dos Inscritos" (linhas 348-397): (1) Estilizar cartões com cores diferentes, (2) Formatar texto para destacar "Outro:", (3) Adicionar ícones diferenciadores, (4) Melhorar a legibilidade da parte personalizada |

### Detalhes Técnicos

- Usar regex para extrair e formatar a parte "Outro: [texto]" separadamente
- Aplicar `className` condicional baseado em `isCustom`
- Implementar um componente helper para renderizar a dúvida com formatação especial:
  ```
  const renderDuvida = (duvida: string) => {
    // Se contém "Outro:", split e formata
    // Parte predefinida: texto normal
    // "Outro: [texto]": negrito + bgcolor + citação
  }
  ```
- Cores: 
  - Fundo predefinido: branco
  - Fundo personalizado: `bg-amber-50` ou `bg-orange-50`
  - Texto "Outro:": `font-bold text-amber-700` ou similar
  - Box ao redor do texto personalizado: `border-l-2 border-amber-300 pl-2`

