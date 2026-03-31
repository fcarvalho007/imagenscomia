

# Auditoria Cloud Lovable — Dados reais e optimizações

## Estado actual do projecto

### Base de dados: 22 MB total

| Tabela | Tamanho | Registos | Notas |
|--------|---------|----------|-------|
| `message_logs` | **1.5 MB** | 3 582 | Maior tabela — logs de emails/SMS |
| `email_send_logs` | **960 KB** | 2 628 | Dedup de envios |
| `registrations` | 448 KB | 521 | Dados core |
| `email_templates` | 296 KB | — | HTML dos templates |
| `payment_events` | 184 KB | — | Eventos de pagamento |
| Restantes 6 tabelas | ~170 KB | — | Pequenas |
| **Total dados públicos** | **~3.5 MB** | — | — |
| **Total BD (c/ sistema)** | **22 MB** | — | Maioria é overhead Postgres/auth/extensions |

**Conclusão BD**: Os dados ocupam muito pouco. 22 MB é minúsculo — o $25 de crédito mensal cobre isto sem problema.

### Edge Functions: 48 funções deployadas

São o maior custo variável. Últimos 7 dias mostram actividade mínima (apenas 1 invocação registada de `followup-abandoned`). O pico de actividade foi entre 3-10 de Março (campanha do webinar) com ~2 500 emails enviados. Desde 21 de Março, actividade quase zero.

### Storage: 0 buckets, 0 ficheiros

Não há ficheiros armazenados. Zero custo.

---

## Optimizações recomendadas

### 1. Eliminar edge functions obsoletas (impacto: reduz deploy time)
Funções de uso único que já cumpriram o seu propósito:

| Função | Razão para eliminar |
|--------|-------------------|
| `backfill-sms-logs` | Backfill já executado |
| `backfill-video-confirmations` | Backfill já executado |
| `test-send-email` | Função de teste |
| `bulk-sync-egoi` | Sync em massa já feito |
| `cleanup-egoi-tags` | Limpeza pontual já feita |
| `check-referrals` | Campanha referrals terminada |

**Acção**: Apagar código + chamar `delete_edge_functions` para as 6 funções.

### 2. Limpar logs antigos da BD (~1 MB recuperado)
Os `message_logs` e `email_send_logs` anteriores a Março já não servem para dedup (campanha terminada). Podemos:
- Apagar `email_send_logs` com `created_at < '2026-03-01'` (logs do webinar "imagens" antigo)
- Ou manter tudo — 1.5 MB é irrelevante em termos de custo

### 3. Desactivar cron jobs que já não são necessários
Se existem cron jobs activos (ex: `followup-abandoned` a correr periodicamente, `generate-reminder`), podem ser desactivados via SQL:
```sql
SELECT jobid, schedule, command FROM cron.job;
-- Depois: SELECT cron.unschedule(jobid);
```

### 4. Verificar instance size
Se o projecto está num instance maior que o necessário (micro é suficiente para este volume), reduzir em **Cloud → Overview → Advanced settings**.

---

## Resumo de custos

| Categoria | Uso actual | Custo estimado/mês | Acção |
|-----------|-----------|-------------------|-------|
| BD (22 MB) | Muito baixo | ~$2-3 (compute fixo) | Nenhuma necessária |
| Edge Functions (48) | Quase inactivas | ~$0.50 | Eliminar 6 obsoletas |
| Storage | Zero | $0 | — |
| Bandwidth | Mínimo | ~$0.10 | — |
| **Total** | — | **~$3-4/mês** | **Coberto pelo $25 grátis** |

**Conclusão**: O projecto está bem dentro do crédito gratuito de $25/mês. As optimizações são mais de "higiene" do que de necessidade financeira. A acção com mais impacto prático é eliminar as 6 edge functions obsoletas e desactivar cron jobs desnecessários.

Quer que avance com a eliminação das funções obsoletas e verificação dos cron jobs?

