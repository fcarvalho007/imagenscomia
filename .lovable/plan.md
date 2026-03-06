

# Actualizar fluxo Pós-Evento: sequência de follow-up para inscritos que não pagam

## Problema actual

O fluxo pós-evento (`getPostEventNodes()`) na linha 487-593 assume que toda a gente que se inscreve pós-evento vai pagar. Não existe nenhuma sequência de follow-up para quem se inscreve e **não compra**. O fluxo vai directamente de "Confirmação imediata" para "Confirmação de compra" e "Recursos", ignorando completamente os inscritos gratuitos.

Em contraste, o fluxo pré-evento (linhas 284-440) tem uma sequência completa: Email pós-webinar → Day 1 → Day 3 → Email de fecho (marca como perdido).

## Solução

Adicionar ao `getPostEventNodes()` a sequência de nurturing/follow-up para inscritos gratuitos pós-evento, espelhando a lógica do pré-evento mas adaptada ao contexto (a pessoa inscreveu-se depois do webinar, portanto recebe a gravação como incentivo).

### Novos nodes a adicionar (entre "Confirmação imediata" e "Confirmação de compra"):

| # | Node | Template Key | Timing | Público | Cor |
|---|------|-------------|--------|---------|-----|
| 1 | **Email Day 1 — Gravação + Premium** | `video_postwebinar_day1` | 24h após inscrição | Gratuitos sem pagamento | 🟠 Amber |
| 2 | **Email Day 3 — Última oportunidade** | `video_postwebinar_day3` | 72h após inscrição | Gratuitos sem pagamento | 🟠 Amber |
| 3 | **Email de fecho — Marca como perdido** | `video_postwebinar_closing` | 5 dias após inscrição | Gratuitos sem pagamento | 🔴 Vermelho |

### Também adicionar um SMS de follow-up:

| # | Node | Timing | Público |
|---|------|--------|---------|
| 4 | **SMS follow-up pós-inscrição** | Manual · gratuitos com telefone | Gratuitos que não compraram |

### Alterações no ficheiro `src/components/crm/AutomationFlowTab.tsx`

**`getPostEventNodes()`** — reestruturar para incluir:

1. **Trigger** — Inscrição pós-evento (mantém)
2. **Confirmação imediata** (mantém)
3. **Section: SEQUÊNCIA DE CONVERSÃO** (novo divider)
4. **Email Day 1** — `video_postwebinar_day1` — "24h após inscrição · gravação + Premium Pass" — `audienceFilter: { planFilter: ["free"], excludePaid: true }`
5. **Email Day 3** — `video_postwebinar_day3` — "72h após inscrição · última oportunidade" — `audienceFilter: { planFilter: ["free"], excludePaid: true }`
6. **SMS follow-up** — manual, gratuitos com telefone — "Ola! Ja viste a gravacao do webinar? Tens acesso a 70min de conteudo pratico em imagenscomia.com/video — Frederico"
7. **Email de fecho** — `video_postwebinar_closing` — "5 dias após inscrição · marca como perdido" — com `infoBox` a explicar que o lead é marcado como perdido — `audienceFilter: { planFilter: ["free"], excludePaid: true }`
8. **Section: CLIENTES PAGOS** (novo divider, substitui o actual bloco de pagamento)
9. **Confirmação Premium** (mantém)
10. **Confirmação Masterclass** (mantém)
11. **Section: ACESSO AOS RECURSOS** (mantém)
12. **Recursos Premium/Masterclass/Bundle + SMS** (mantém)
13. **End** (mantém)

### Actualizar também subtítulos desactualizados no pré-evento (linhas 258-397):

- Linha 262: `"Gravação HD · Pack · Q&A 10 Mar"` → `"Sessão 70min · Workbook · GEMs · Áudio"`
- Linha 275: `"Masterclass 12 Mar · 10h00"` → `"Masterclass 12 Mar · 10h–13h · gravação incluída"`
- Linha 295: remover nota `"Só para quem assistiu ao vivo"` (já não é verdade)
- Linha 360: SMS Premium — actualizar smsText para remover referência a "Q&A amanha terca 10 Mar" (já passou)
- Linha 394: SMS Bundle — actualizar smsText para remover referência a "Q&A terca 10 Mar" (já passou)
- Linha 423: SMS pós-webinar — actualizar smsText para ser mais relevante

### Ficheiro único alterado

`src/components/crm/AutomationFlowTab.tsx` — função `getPostEventNodes()` + subtítulos no `getNodes("video")`.

