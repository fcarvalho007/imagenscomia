

# Auditoria Completa: EuPago vs Base de Dados

## Resultados da comparação linha-a-linha

Cruzei todas as 39 transacções "paga" do CSV EuPago (canal "Webinars IA") com os registos na BD. Encontrei **4 categorias de problemas**.

---

## 1. BUG CRÍTICO — Webhook não reconhece formato "ORD-"

As funções `create-payment` e `send-payment-link` geram identificadores no formato **`ORD-{nome}-{planTag}`** (ex: `ORD-Maria Soares-SP`). Mas o webhook só reconhece:
- `ORDER-` (Strategy 2)
- `GROUP-` (Group)
- `WEBINAR-` (Strategy 3b)

O formato `ORD-` cai na Strategy 3 que tenta extrair um email — mas o formato tem nome, não email. **Falha silenciosamente.**

**Impacto imediato:** 2 pagamentos de hoje (€33,21 cada) não foram capturados:
- Maria Soares (mariahelena.diassoares@gmail.com) — video-premium
- Carla Jorge (carla.jorge@appm.pt) — video-premium

**Todos os pagamentos futuros via `create-payment` terão este problema.**

**Fix:** Adicionar Strategy 1b ao webhook — quando o identifier começa com `ORD-`, fazer lookup por `eupago_transaction_id = transactionID` na tabela registrations (o `create-payment` guarda o transactionID como `eupago_ref` ao criar o pagamento).

---

## 2. plan_selected ERRADO — 9 registos

| Nome | ID (curto) | Tem | Deve ser | Razão |
|------|-----------|-----|----------|-------|
| Jorge Isabelinho | bd5ef96e | gravacao | **premium** | Pagou €18,45 (imagens) |
| Jorge Isabelinho | 90feb061 | gravacao | **video-bundle** | Pagou €70,11 (vídeo) |
| Júlio Silva | 56708624 | masterclass | **video-masterclass** | webinar=video, falta prefixo |
| Rita Santiago | 62043e9f | masterclass | **video-masterclass** | webinar=video, grupo |
| Diana Ramos | e49734ad | masterclass | **video-masterclass** | webinar=video, grupo |
| Olga Cruz | 70bd4b09 | masterclass | **video-masterclass** | webinar=video, grupo |
| Inês Pereira | 998935e2 | masterclass | **video-masterclass** | webinar=video, grupo |
| Isabel Martins | 20dfffff | masterclass | **video-masterclass** | webinar=video, grupo |
| Sofia Monteiro | e45e7abc | masterclass | **video-masterclass** | webinar=video, grupo |
| Teresa Juncal | 231a6899 | masterclass | **video-masterclass** | webinar=video, grupo |
| Beatriz Rodrigues | cfac365e | masterclass | **video-masterclass** | webinar=video, grupo |

---

## 3. paid_amount NULL — 17 registos

Registos anteriores à migração de backfill. Valores conhecidos pelo CSV EuPago:

| Nome | Valor EuPago | plan_selected |
|------|-------------|---------------|
| Rita Santiago | 115,62 (grupo) | masterclass→video-masterclass |
| Grupo Olga Cruz (×5) | 312,17 total | masterclass→video-masterclass |
| Bruno Costa | 76,26 | video-bundle |
| Dário Ramos | 18,45 | premium |
| Margarida Pregueiro | 18,45 | premium |
| Ana Pinto | 18,45 | premium |
| Graça Sá da Bandeira | 18,45 | premium |
| Ana Olívia | 18,45 | premium |
| Hericka Santos | 18,45 | premium |
| Sofia Albinski | 18,45 | premium |
| Maria Soares | 76,26 | bundle |
| Pedro Vilarinho | 76,26 | bundle |
| Silvana Curado | 76,26 | bundle |

---

## 4. AMOUNT_TO_PLAN incompleto

Faltam preços antigos (pré-5 março) e cross-context:

```text
imagens: + 76.26 → bundle (preço antigo 62€+IVA)
video:   + 18.45 → video-premium (preço antigo 15€+IVA)
         + 57.81 → video-masterclass (preço antigo 47€+IVA)
         + 70.11 → video-bundle (preço antigo 57€+IVA)
         + 76.26 → video-bundle (preço mais antigo 62€+IVA)
```

---

## Plano de correcção

### Ficheiros a editar

| Ficheiro | Acção |
|----------|-------|
| `supabase/functions/eupago-webhook/index.ts` | Adicionar Strategy 1b (ORD- → lookup por transactionID); completar AMOUNT_TO_PLAN com preços antigos |
| SQL (dados) | Corrigir 9 plan_selected + backfill 17 paid_amount |

### Strategy 1b — match "ORD-" por transactionID

Quando identifier começa com `ORD-` (mas não `ORDER-`):
1. Procurar registo onde `eupago_ref = transactionID` OR `eupago_transaction_id = transactionID`
2. Actualizar paid_at, paid_amount, e derivar plan do montante
3. Extrair planTag do identifier (`SP`/`MC`/`PK`) como validação adicional

### Correcção de dados

```sql
-- Fix plan_selected (video webinar sem prefixo)
UPDATE registrations SET plan_selected = 'video-masterclass'
WHERE id IN ('56708624-...', '62043e9f-...', 'e49734ad-...', 
             '70bd4b09-...', '998935e2-...', '20dfffff-...', 
             'e45e7abc-...', '231a6899-...', 'cfac365e-...');

-- Fix Jorge Isabelinho
UPDATE registrations SET plan_selected = 'premium' WHERE id = 'bd5ef96e-...';
UPDATE registrations SET plan_selected = 'video-bundle' WHERE id = '90feb061-...';

-- Backfill paid_amount (17 records from EuPago CSV)
```

### Captura manual dos 2 pagamentos perdidos

Actualizar Maria Soares e Carla Jorge com paid_at, paid_amount=33.21, plan=video-premium.

