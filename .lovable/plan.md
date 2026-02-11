

# Simplificar botoes CTA e formatar precos no painel lateral

## Resumo

Remover os valores dos botoes CTA (Premium e Masterclass), e no painel lateral (SummaryPanel) mostrar os precos base "+ IVA" em vez dos totais com IVA ja incluido. O total final continua a mostrar o valor com IVA incluido.

---

## Alteracoes

### 1. `src/components/upgrade/StepPremium.tsx`

- Linha 78: Mudar de `Adicionar Premium Pass — €18,45 →` para `Adicionar Premium Pass →`

### 2. `src/components/upgrade/StepMasterclass.tsx`

- Linha 87: Mudar de `Reservar Masterclass — €57,81 →` para `Reservar Masterclass →`

### 3. `src/components/upgrade/SummaryPanel.tsx`

- Linha 66-67 (Premium line): Mudar subtexto para "Gravacao . Q&A . Guia" e preco para "€15 + IVA" em vez de "€18,45"
- Linha 83-84 (Masterclass line): Mudar preco para "€47 + IVA" em vez de "€57,81"
- Linhas 95-113 (IVA lines separadas): Remover — ja nao sao necessarias porque os precos base + IVA estao indicados nas linhas principais
- O TOTAL continua a mostrar o valor com IVA incluido (€18,45 / €57,81 / €76,26) via `formatPrice(total)` — sem alteracao

### 4. `src/components/upgrade/StepConfirmation.tsx`

- Linha 159: Premium mostra "€15" — adicionar texto "+ IVA" ao lado
- Linhas 161-164: Remover a linha separada de IVA Premium (€3,45) — ja indicado no preco
- Linha 174: Masterclass mostra "€47" — adicionar texto "+ IVA" ao lado
- Linhas 176-179: Remover a linha separada de IVA Masterclass (€10,81) — ja indicado no preco
- O TOTAL continua a mostrar o valor total com IVA incluido, e deve indicar "(c/ IVA)" ao lado

---

## Resultado visual esperado

**Painel lateral (SummaryPanel):**
```text
Premium Pass
Gravacao . Q&A . Guia          €15 + IVA

Masterclass Online
3h . Online . Max. 30          €47 + IVA

────────────────────────────────
TOTAL                          €76,26
```

**Step 5 (Confirmacao com pagamento):**
```text
Premium Pass                   €15 + IVA
Masterclass Online             €47 + IVA
────────────────────────────────
TOTAL (c/ IVA)                 €76,26
```

---

## Ficheiros a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/upgrade/StepPremium.tsx` | Remover preco do botao CTA |
| `src/components/upgrade/StepMasterclass.tsx` | Remover preco do botao CTA |
| `src/components/upgrade/SummaryPanel.tsx` | Precos base + IVA, remover linhas IVA separadas |
| `src/components/upgrade/StepConfirmation.tsx` | Precos base + IVA, remover linhas IVA separadas, total c/ IVA |

Sem dependencias novas.
