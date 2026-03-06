

# Auditoria EuPago vs Pipeline — Resultado

## Conclusão: Sem discrepâncias

Cruzei as 24 transações do ficheiro EuPago com a base de dados. **Todos os 15 pagamentos confirmados ("paga") já têm `paid_at` correctamente preenchido na base de dados.** O webhook está a funcionar bem.

## Detalhe por estado

### Pagos (15) — Todos sincronizados ✅
Vanessa Amaral, Jorge Isabelinho, José Moreira, Susana Vieira, Jessica Castro, André Cunha, Diogo Nunes, Andreia Amaral, Né Eme, Marisa Jordão, Soraia Silva, Hermana Noronha, Daniela Panta, Nuno Carvalho, Júlio Silva (grupo) — todos com `paid_at` na DB.

### Expirados (3) — Correctos ✅
- **Lúcia Furtado** — MBWay expirou, `paid_at = null` na DB. Tem `plan_selected = video-premium`, aparece na coluna "Premium" como "Aguarda pgto".
- **Frederico Correia** — MBWay expirou, `paid_at = null`. Mesma situação.
- **Ana Lagos** — MBWay expirou, `paid_at = null`. Mesma situação.

### Pendentes Multibanco (3) — Sem acção necessária
- **GROUP-698019e6** (€115.62) — Rita e Diana Ramos (Sinmetro), `masterclass-group-pending`. Referência MB ainda válida, aguarda pagamento.
- **Ref 219389530** e **219301434** (€66.42 cada) — Canal "SMSonline.pt", não são do sistema de webinars. Provavelmente outro produto/serviço.

## Acção recomendada

Não há nenhuma actualização a fazer na pipeline. Os dados estão consistentes entre a EuPago e a base de dados. As 3 pessoas com pagamentos expirados (Lúcia, Frederico, Ana Lagos) já aparecem correctamente como "Aguarda pgto" no Pipeline e são candidatas a follow-up de recobrança.

