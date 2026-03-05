

# Resultado da auditoria EuPago vs Base de Dados

## Conclusão: Todos os pagamentos estão correctamente reconciliados

Cruzei as 20 linhas do ficheiro EuPago com a base de dados. Todos os 14 pagamentos com estado "paga" no canal "Webinars IA" têm `paid_at` preenchido na base de dados.

## Detalhe por transacção

### Pagamentos confirmados (OK)
- **Jessica Castro** (€18.45 premium) — paga ✓
- **ACBC / Andre Cunha** (€18.45 premium) — paga ✓
- **Diogo Nunes** (€18.45 premium) — paga ✓
- **Júlio Silva / GROUP** (€57.81 masterclass) — paga ✓
- **Andreia Amaral** (€18.45 premium) — paga ✓
- **Né Eme** (€18.45 premium) — paga ✓
- **Marisa Jordao** (€57.81 masterclass) — paga ✓ (paid_at: 05/03 10:31)
- **Soraia Silva** (€18.45 premium) — paga ✓
- **Hermana Noronha** (€70.11 bundle) — paga ✓
- **Daniela Panta** (€70.11 bundle) — paga ✓
- **Nuno Carvalho** (€70.11 bundle) — paga ✓
- **Pedro Marques** (€18.45 premium) — paga ✓
- **jorge isabelinho** (€70.11 bundle) — paga ✓
- **GROUP-efbe272406c3** (€312.17, 6 pessoas) — paga ✓

### Pendente/Expirado (correcto não ter paid_at)
- **Susana Vieira** (ORDER-c120bc5bed9a, €70.11) — "pendente" no EuPago, sem paid_at ✓
  - Nota: tem 2 registos com emails diferentes (`susana.vieira@` e `susana.vieira3@`), nenhum pago
- **Frederico Correia** (ORDER-feddbdd1850e) — "expirada" no EuPago ✓
- **Ana Lagos** (ORDER-0d159f6211e2) — "expirada" no EuPago ✓

### Transacções SMSonline.pt (não são deste sistema)
- Refs 2428, 2429, 2430 — são de outro serviço, não se aplicam

## Resultado
Nenhuma acção necessária. O webhook de reconciliação funcionou correctamente para todos os pagamentos, incluindo os da página `/comprar`. A Marisa Jordao está correctamente marcada como paga com masterclass.

