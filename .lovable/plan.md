

# Mostrar valores + IVA e remover "Reembolso 14 dias"

## Resumo

Adicionar a notacao "+ IVA" ao Premium Pass (que actualmente mostra apenas "€15") para consistencia com a Masterclass, e remover todas as mencoes a "Reembolso 14 dias" na pagina /upgrade.

---

## Alteracoes

### 1. `src/components/upgrade/StepPremium.tsx`

- Linha 46: Mudar `€15` para `€15 + IVA`
- Linha 47: Adicionar subtexto `€18,45 total · pagamento unico` (15 * 1.23 = 18.45)
- Linha 78 (botao CTA): Mudar `€15` para `€18,45`

### 2. `src/components/upgrade/SummaryPanel.tsx`

- Linha 70: Premium mostra `€15` — mudar para `€15 + IVA` ou mostrar `€18,45`
- Linha 87: Masterclass mostra `€47` — ja esta correcto mas adicionar sub-texto `+ IVA` se nao tiver
- Linhas 95-104: Reformular a linha de IVA para cobrir Premium tambem (IVA Premium €3,45 + IVA Masterclass €10,81)
- Linha 123: Remover `· Reembolso 14 dias` da linha de seguranca, ficando apenas `🔒 Pagamento seguro EuPago`

### 3. `src/pages/Upsell.tsx`

- Linha 18: Actualizar `getTotal` — Premium passa de 15 para 18.45 (15 + 23% IVA): `(o.premium ? 18.45 : 0) + (o.masterclass ? 57.81 : 0)`

### 4. `src/components/upgrade/StepConfirmation.tsx`

- Linha 158: Premium mostra `€15` — mudar para `€15 + IVA` com sub-linha de IVA (€3,45), tal como ja existe para Masterclass
- Linha 181: O total ja usa `getTotal()` portanto actualiza automaticamente
- Linha 202: Remover `· Reembolso 14 dias`, ficando apenas `🔒 Pagamento seguro EuPago`

---

## Resumo dos valores actualizados

| Produto | Base | IVA (23%) | Total |
|---------|------|-----------|-------|
| Premium Pass | €15 | €3,45 | €18,45 |
| Masterclass | €47 | €10,81 | €57,81 |
| Ambos | €62 | €14,26 | €76,26 |

---

## Ficheiros a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/upgrade/StepPremium.tsx` | Precos com "+ IVA", total €18,45 |
| `src/components/upgrade/SummaryPanel.tsx` | IVA no Premium, remover "Reembolso 14 dias" |
| `src/pages/Upsell.tsx` | getTotal: premium = 18.45 |
| `src/components/upgrade/StepConfirmation.tsx` | IVA no Premium, remover "Reembolso 14 dias" |

Sem dependencias novas.

