
## Refinamento do Funil de Inscrição — Separador + Design

### Diagnóstico

**Problema 1 — Separador mal posicionado:**
O separador "— Intenção de compra →" está actualmente definido com `separator: true` no passo "Viu oferta Masterclass (Passo 4)" (índice 4 do array). O utilizador correctamente identifica que a intenção de compra começa quando a pessoa **vê a oferta Premium** (Passo 3 do funil, índice 3 do array). Basta mover o `separator: true` do índice 4 para o índice 3.

**Problema 2 — Design plano e sem hierarquia visual:**
A secção actual usa barras horizontais idênticas para todos os passos, sem distinguir visualmente as duas fases do funil (qualificação vs. intenção de compra). A zona de "intenção de compra" merece destaque visual diferenciado.

---

### Alteração 1 — Mover o separador para antes de "Viu oferta Premium"

**Ficheiro:** `src/components/crm/DashboardView.tsx` (linha 204–212)

Mudar `separator: false` → `separator: true` no passo "Viu oferta Premium (Passo 3)" e `separator: true` → `separator: false` no passo "Viu oferta Masterclass (Passo 4)":

```ts
const funnelSteps = [
  { label: "Submeteu inscrição",               ..., separator: false },
  { label: "Chegou ao Passo 1 — Origem",       ..., separator: false },
  { label: "Chegou ao Passo 2 — Dúvida",       ..., separator: false },
  { label: "Viu oferta Premium (Passo 3)",     ..., separator: true  }, // ← AQUI
  { label: "Viu oferta Masterclass (Passo 4)", ..., separator: false }, // ← e aqui
  { label: "Clicou para pagar",                ..., separator: false },
  { label: "Pagamento confirmado",             ..., separator: false },
];
```

---

### Alteração 2 — Redesign visual da secção de "Intenção de compra"

**Ficheiro:** `src/components/crm/DashboardView.tsx` (linhas 276–320)

Actualmente os passos de intenção de compra (4–7) têm exactamente o mesmo visual dos passos de qualificação (1–3). Proposta de melhoria visual:

**A. Separador mais expressivo:**
Substituir o separador actual (linha fina + texto cinzento) por um separador com background tinted âmbar suave, tornando a transição mais clara:

```jsx
{step.separator && (
  <div className="flex items-center gap-2 my-3">
    <div className="flex-1 h-px" style={{ background: "hsl(var(--amber-500)/0.3)" }} />
    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ color: "hsl(var(--amber-500))", background: "hsl(var(--amber-500)/0.08)", border: "1px solid hsl(var(--amber-500)/0.2)" }}>
      Intenção de compra
    </span>
    <div className="flex-1 h-px" style={{ background: "hsl(var(--amber-500)/0.3)" }} />
  </div>
)}
```

**B. Fundo subtil para a zona de intenção de compra:**
Os passos com índice ≥ 3 (após o separador) ficam envoltos num wrapper com `background: hsl(var(--amber-500)/0.03)` e `border-left: 2px solid hsl(var(--amber-500)/0.2)` e `padding-left: 8px`, criando uma zona visualmente distinta.

Para implementar isto, adicionar ao array `funnelSteps` uma propriedade `isConversion: boolean` — `true` para os passos 4–7. O render envolve esses passos num `div` com classe de fundo âmbar subtil.

**C. Labels mais descritivas (sub-labels):**

Adicionar ao array `funnelSteps` uma propriedade `sublabel` opcional para contextualizar:
- "Viu oferta Premium (Passo 3)" → sublabel: `"Viu a oferta de €27"`
- "Viu oferta Masterclass (Passo 4)" → sublabel: `"Viu a oferta de €57,81"`
- "Clicou para pagar" → já tem `note: "preenche dados de faturação"` — manter
- "Pagamento confirmado" → sublabel: `"Receita confirmada"`

As sub-labels aparecem em `text-[11px] text-ink-400` sob o label principal, alinhadas com a barra.

**D. Barra de progresso mais grossa na zona de conversão:**
Os passos de intenção de compra usam `h-3` em vez de `h-2.5` para as barras, e a barra do passo "Pagamento confirmado" usa `h-3.5` com fundo verde — reforçando que é o destino final do funil.

**E. Número de pessoas em destaque na zona de conversão:**
Para os passos 4–7, o número de pessoas (ex: "18") aparece em `text-[15px]` bold em vez de `text-[13px]`, para melhor leitura da progressão de conversão.

---

### Ficheiro alterado

| Ficheiro | Alteração |
|---|---|
| `src/components/crm/DashboardView.tsx` | Mover `separator: true` para o passo Premium; redesign visual da zona de intenção de compra (separador âmbar, fundo subtil, sub-labels, barras mais espessas, números em destaque) |

### O que NÃO muda

- Os dados são todos reais — sem alterações na lógica de cálculo
- Os 7 passos mantêm-se, apenas a apresentação visual muda
- O highlight do maior drop-off (vermelho/âmbar) mantém-se
- O campo editável de visitantes mantém-se
- Todas as outras secções do dashboard ficam intactas
