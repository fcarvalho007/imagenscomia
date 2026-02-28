

# Auditoria de Automacoes — Problemas encontrados e correcoes

## Problema encontrado: duracao errada em 4 templates na base de dados

Quatro templates na base de dados dizem **"3 horas"** quando deviam dizer **"45 a 60 minutos"**:

| Template | Texto errado | Contexto |
|---|---|---|
| `video_confirmation` | "3 horas" (na linha de duracao) | Bloco de detalhes do evento |
| `video_confirmation_returning` | "3 horas" (na linha de duracao) | Bloco de detalhes do evento |
| `video_reminder_48h` | "O que vais aprender em 3 horas:" | Titulo da seccao de conteudo |
| `video_reminder_24h` | "sessao ao vivo, 3 horas." | Descricao do webinar |

Nota: os fallbacks em codigo (edge functions) ja estao correctos com "45-60 minutos". O problema e apenas nos templates guardados na tabela `email_templates`.

## O que esta correcto (nao precisa de alteracao)

- **ICS / calendario**: DTSTART 10h00, DTEND 11h00 — 1h, OK
- **Cron schedules**: todos correctos para webinar 5 de Marco as 10h UTC
- **Janelas de tempo**: 48h, 24h, 1h — todas com guards adequados
- **Idempotencia**: todos os emails verificam envios anteriores antes de reenviar
- **Seguranca cron**: todos validam `CRON_SECRET`
- **Sequencia pos-webinar**: Day 0 (12:30), Day 1 (13:00), Day 3 (8 Mar), Closing (10 Mar) — correcto
- **Guard-rail de pagamento**: templates de upsell excluem quem ja pagou
- **Template video_payment_masterclass**: referencia a Masterclass (nao diz "45-60 min" — correcto, porque a Masterclass de 12 de Marco sao 3 horas)

## Correcao: 1 migration SQL com 4 REPLACE

Uma unica query UPDATE por template para substituir "3 horas" pela duracao correcta:

```text
video_confirmation:           "3 horas" -> "45 a 60 minutos"
video_confirmation_returning: "3 horas" -> "45 a 60 minutos"
video_reminder_48h:           "em 3 horas:" -> "em 45 a 60 minutos:"
video_reminder_24h:           "3 horas." -> "45 a 60 minutos."
```

Cada UPDATE usa REPLACE com contexto suficiente para evitar substituicoes acidentais. Nenhum outro template, edge function ou ficheiro e alterado.

## Verificacao pos-correcao

```sql
SELECT template_key,
  CASE WHEN html_body LIKE '%3 horas%' THEN 'ERRO' ELSE 'OK' END as check_3h,
  CASE WHEN html_body LIKE '%45 a 60 minutos%' OR html_body LIKE '%45–60%' THEN 'OK' ELSE 'SEM DURACAO' END as check_duracao
FROM email_templates
WHERE template_key IN ('video_confirmation','video_confirmation_returning','video_reminder_48h','video_reminder_24h');
```

Esperado: todos "OK" / "OK".

