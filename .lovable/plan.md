

# Envio de 15 SMS correctivos via edge function send-sms

## Textos

**Correcção (10 premium que receberam SMS errado):**
> Ola! Correcao: o link correto para os teus recursos e imagenscomia.com/recursos-video — entra com o email de registo. Desculpa o engano! — Frederico

**Recursos (4 bundle + 1 premium que não receberam nada):**
> Ola! Ja tens acesso a sessao completa (70min), workbook, guia GEMs e audio em imagenscomia.com/recursos-video — usa o email de registo. Ate ja! — Frederico

## Execução

Invocar `curl_edge_functions` 15 vezes no endpoint `send-sms` com:
- `provider: "egoi"`
- `registrationId` de cada contacto (para log em `message_logs`)
- `template_key` será `sms_manual` (default do edge function)
- Header `x-cron-secret` para autenticação

### Lista completa de envios

**Correcção (10):**
1. Ana — 938096825 — id: b54eee29
2. Andreia — 969379507 — id: ddb185f3
3. Diogo — 919181702 — id: d31b8f97
4. Inês — 919128025 — id: 43c00f22
5. Jessica — 911187000 — id: d0abffd1
6. José — 968336088 — id: c5e7a022
7. Né — 914766482 — id: 6b2f13fd
8. Pedro — 917193648 — id: f3c8453b
9. Soraia — 926420327 — id: 2f481bfc
10. Vanessa — 914000502 — id: 4afaebe2

**Recursos (5):**
11. Carla — 910874845 — id: ac11f833
12. Daniela — 927418365 — id: ff4abaa0
13. Hermana — 933416383 — id: 88f8f55b
14. Nuno — 917250772 — id: f4668662
15. ANDRE — 963486616 — id: 139b7ee7

Nenhum código será alterado. Apenas invocações directas da edge function existente.

