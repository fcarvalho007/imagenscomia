

# Pagamento directo por URL + Registo no CRM

## Contexto
Actualmente o botao "Confirmar e pagar" chama a edge function `create-payment` para gerar um link EuPago dinamicamente. O pedido e substituir isso por redirecionamento directo para URLs fixos, e registar a escolha na base de dados para o CRM visualizar.

## Alteracoes

### 1. Mapeamento de planos para URLs

| Plano interno | URL EuPago |
|---------------|------------|
| premium | `https://clientes.eupago.pt/api/extern/paybylink/form/f92e7b5a02894539ac7528aaa56d08a5` |
| masterclass | `https://clientes.eupago.pt/api/extern/paybylink/form/d3e170f1d73546ca96b5267e25ac12e2` |
| premium-masterclass (bundle) | `https://clientes.eupago.pt/api/extern/paybylink/form/04fcd2e6b72947f6a71f05bc96b213f3` |

### 2. Ficheiro `src/pages/Upsell.tsx`
- Substituir `handlePayment` para:
  1. Guardar dados de upgrade na tabela `registrations` (update por email): `plan_selected`, `sources`, `duvida`, `upgrade_clicked_at`
  2. Redirigir directamente para o URL EuPago correspondente ao plano
  3. Remover dependencia da edge function `create-payment` (manter o ficheiro mas deixar de o chamar)

### 3. Migracao de base de dados
Adicionar colunas a tabela `registrations`:
- `plan_selected` (text, nullable) — "premium", "masterclass", ou "bundle"
- `sources` (text, nullable) — canais de origem do step 1
- `duvida` (text, nullable) — pergunta do step 2
- `upgrade_clicked_at` (timestamptz, nullable) — quando clicou em pagar

### 4. CRM — Visibilidade no modal (`InscritoModal.tsx`)
- Na seccao "Detalhes", adicionar um card com:
  - "Plano seleccionado" — mostra o plano escolhido no upgrade
  - "Clicou em pagar" — timestamp de quando clicou
- Na seccao de timeline, adicionar evento "Clicou para pagar (Premium/Masterclass/Bundle)"

### 5. Tipo `Inscrito` (`mockData.ts`)
- Adicionar campos `plan_selected`, `sources_text`, `duvida_text`, `upgrade_clicked_at` ao tipo para compatibilidade com o CRM

## Ficheiros a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/pages/Upsell.tsx` | Substituir handlePayment por redirect directo + save DB |
| `src/pages/crm/mockData.ts` | Adicionar campos ao tipo Inscrito |
| `src/components/crm/InscritoModal.tsx` | Mostrar plan_selected e upgrade_clicked_at nos detalhes |
| Migracao SQL | Adicionar colunas a registrations |

