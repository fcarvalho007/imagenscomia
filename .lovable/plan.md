

# Reajuste dos 3 emails pós-webinar

## Resumo das alterações

### 1. `video_postwebinar` (enviar hoje às 13h)

**Assunto actual:** "Obrigado por estares presente 🙏 — e o que vem a seguir"
**Novo assunto:** "O webinar já decorreu — e o que vem a seguir"

**Corpo — alterações principais:**
- Remover "Obrigado por teres estado presente hoje" (não sabemos se estiveram)
- Substituir por: "O webinar 'Cria Vídeo Profissional com IA' já decorreu. Em breve receberás um email com o workbook-resumo da sessão."
- **Preço early-bird hoje:** Premium Pass a **€15+IVA** (apenas até ao final do dia de hoje)
- Mencionar que amanhã o preço sobe para €27+IVA
- Manter bloco Masterclass (12 Março, €97+IVA, 3 horas)
- Manter personalização por variante (A/B/C/D)
- Actualizar CTA: "Obter acesso à gravação — €15+IVA (só hoje) →"

**Filtro:** Remover `.not("attended_live_at", "is", null)` — enviar a TODOS os inscritos não-pagos (não sabemos quem esteve presente)

**Cron:** Reagendar para as 13:00 UTC de hoje (5 Março)

---

### 2. `video_postwebinar_day1` (enviar amanhã, 6 Março)

**Assunto actual:** "O webinar de hoje, {{fname}}"
**Novo assunto:** "A gravação do webinar, {{fname}}"

**Corpo — alterações principais:**
- Remover "O webinar de hoje foi intenso — cobrimos muito terreno em pouco tempo"
- Substituir por contexto pós-evento: "Ontem fizemos uma sessão de 70 minutos sobre vídeo com IA — desde briefing até clip publicável."
- **Preço:** €27+IVA (preço normal, já não é early-bird)
- Destacar benefícios do Premium Pass:
  - Gravação HD completa (70 min)
  - Sessão Q&A ao vivo (10 Março, 14h30)
  - Guia de prompts para vídeo (PDF)
- Adicionar menção à **Masterclass de 3 horas** (12 Março) como opção para quem quer ir mais fundo
- Actualizar CTA: "Obter acesso à gravação — €27+IVA →"

---

### 3. `video_postwebinar_day3` (enviar 8 Março)

**Assunto actual:** "Antes que feche, {{fname}}"
**Novo assunto:** "Último email sobre o Premium Pass, {{fname}}"

**Corpo — alterações principais:**
- Remover referência a "early bird" (não existe)
- Tom de reforço final: este é o último email sobre o Premium Pass
- Manter preço €27+IVA
- Destacar datas importantes:
  - Q&A ao vivo: 10 Março, 14h30
  - Masterclass Vídeo com IA (3h): 12 Março, 10h00
- Incluir benefícios resumidos do Premium Pass
- CTA: "Garantir o Premium Pass — €27+IVA →"

---

## Alterações técnicas

| Ficheiro | O que muda |
|---|---|
| `send-video-postwebinar/index.ts` | Novo HTML fallback, novo subject, remover filtro `attended_live_at` |
| `send-video-postwebinar-day1/index.ts` | Novo HTML fallback, novo subject |
| `send-video-postwebinar-day3/index.ts` | Novo HTML fallback, novo subject |
| Cron job `postwebinar` | Reagendar de 12:30 para 13:00 UTC |

Nenhuma alteração estrutural nas funções (auth, logging, dedup mantêm-se).

