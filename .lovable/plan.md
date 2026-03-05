

# Corrigir emails pós-webinar: preço e copy

## Problemas identificados

### 1. `send-video-postwebinar/index.ts` (Day 0) — preço errado + copy desajustado
- **Preço**: €27+IVA em todo o lado → deve ser **€15+IVA** (até 23:59 de hoje, depois aumenta)
- **Copy**: "Queres acesso à gravação completa?" implica que a pessoa não viu → deve ser neutro: o evento já decorreu, pode rever
- **Filtro**: remove `.not("attended_live_at", "is", null)` — envia a todos os inscritos free, independentemente de terem assistido ou não
- **Personalização variante C** (L86): referência a "gravação" → adaptar

### 2. `send-video-postwebinar-day3/index.ts` — preço errado + earlybird + sem Masterclass
- **Preço**: €27+IVA → **€15+IVA**
- **Earlybird**: não existe nenhum earlybird — remover qualquer implicação
- **Masterclass**: adicionar bloco com info da Masterclass (€47+IVA, 3h, 12 Março 10h)
- **Tom**: reforçar que é o último email sobre o Premium Pass

### 3. `send-video-postwebinar-day1/index.ts` — preço errado
- **Preço**: €27+IVA → **€15+IVA**

### 4. `send-video-postwebinar-closing/index.ts` — preço errado
- **Preço**: €27+IVA → **€15+IVA**

---

## Alterações por ficheiro

### `send-video-postwebinar/index.ts`
- L34-71 `buildHtml`: reescrever copy — "O webinar já decorreu. Podes rever a sessão completa (70 min) com o Premium Pass." Preço €15+IVA. CTA "Obter o Premium Pass — €15+IVA". Manter bloco Masterclass (€47+IVA, 12 Março).
- L45: "€27+IVA" → "€15+IVA"
- L51: CTA "€27+IVA" → "€15+IVA"
- L57: Masterclass "€97+IVA" → "€47+IVA"
- L86-88: personalização variante C — adaptar copy sem "gravação"
- L134: **remover** `.not("attended_live_at", "is", null)` — enviar a todos os free

### `send-video-postwebinar-day3/index.ts`
- L14-42 `buildFallbackHtml`: reescrever — "Este é o último email sobre o Premium Pass." Preço €15+IVA. Remover qualquer referência a earlybird. Adicionar bloco Masterclass (€47+IVA, 3h, 12 Março 10h).
- L23: "€27+IVA" → "€15+IVA"
- L28: CTA "€27+IVA" → "€15+IVA"

### `send-video-postwebinar-day1/index.ts`
- L24: "€27+IVA" → "€15+IVA"
- L29: CTA "€27+IVA" → "€15+IVA"

### `send-video-postwebinar-closing/index.ts`
- L27: "€27+IVA" → "€15+IVA"

---

## Resumo
- 4 Edge Functions actualizadas
- Preço corrigido de €27 para €15 em todas
- Day 0: filtro `attended_live_at` removido (envia a todos os free) + copy neutro
- Day 3: earlybird removido + bloco Masterclass adicionado + tom "último email"
- Masterclass corrigida de €97 para €47+IVA onde aplicável

