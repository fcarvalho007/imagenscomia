

## Refinamentos no CRM para Precisao e Clareza

### Problemas identificados

**1. Cores inconsistentes no Dashboard vs Pipeline/Tabela**

No card "Pipeline Pendente" do Dashboard, os estados usam cores diferentes das usadas no Pipeline kanban e Tabela:
- Dashboard: "Seleccionaram" = azul (emoji azul, bg-blue-50), "Aguardam pagamento" = amarelo (emoji amarelo, bg-amber-100)
- Pipeline/Tabela: "Seleccionou e saiu" = laranja (bg-orange-100), "Aguarda pgto" = vermelho (bg-red-100)

Isto cria confusao visual. Devem ser alinhados.

**2. Dado inconsistente na base de dados**

Existe 1 registo com `eupago_ref` preenchido mas `upgrade_clicked_at` a NULL. Isto significa que a referencia EuPago foi gerada mas o timestamp nao foi guardado (possivelmente dados anteriores a implementacao do campo). No CRM, este registo aparece como "Seleccionou e saiu" em vez de "Aguarda pagamento", o que e incorrecto.

**3. Descritor "Seleccionou e saiu" no Dashboard pouco claro**

A descricao "Nao clicaram 'Confirmar e pagar'" e precisa, mas com o novo modal de confirmacao, vale a pena reforcar que estas pessoas confirmaram intencao real no modal.

### Alteracoes propostas

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/DashboardView.tsx` | Alinhar cores do Pipeline Pendente: laranja para "Seleccionaram", vermelho para "Aguardam pgto". Melhorar descricoes. |
| `src/hooks/useInscritos.ts` | Corrigir logica de `payment_status`: se `eupago_ref` existe e `paid_at` nao, tratar como "awaiting_payment" mesmo sem `upgrade_clicked_at`. |

### Detalhe das alteracoes

**Dashboard — cores alinhadas:**
```text
Antes:                          Depois:
Azul "Seleccionaram"     ->     Laranja (bg-orange-50, border-orange-200)
Amarelo "Aguardam pgto"  ->     Vermelho (bg-red-50, border-red-200)
```

Descricoes actualizadas:
- "Seleccionaram": "Confirmaram no modal mas nao avancaram para pagamento"
- "Aguardam pagamento": "Referencia EuPago gerada — contactar"

**useInscritos — logica corrigida:**
A determinacao de `payment_status` passa a considerar tambem `eupago_ref`:
- Se `paid_at` existe: "paid"
- Se `upgrade_clicked_at` existe OU `eupago_ref` existe (sem `paid_at`): "awaiting_payment"
- Se `plan_selected` existe e != "free": "selected"
- Caso contrario: "free"

Isto garante que nenhum registo com referencia EuPago activa seja classificado incorrectamente como "Seleccionou e saiu".

