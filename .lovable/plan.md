

# Refinar email `video_masterclass_day1` — tom neutro (não assume presença)

## Problema
O copy actual assume que o destinatário esteve na Masterclass ("Foram 3 horas e espero que o conteúdo tenha sido útil"). Metade dos compradores não compareceu, logo o tom deve ser inclusivo.

## Copy refinado (proposta)

**Assunto:** `{{fname}}, os teus recursos da Masterclass estão prontos`

**Header:** `📦 Masterclass · Vídeo Profissional com IA` → mantém  
**Título H1:** `Os teus recursos estão prontos`

**Corpo:**

> Olá {{fname}},
>
> A Masterclass de Vídeo Profissional com IA já decorreu e a gravação completa, juntamente com todos os materiais de apoio, está disponível na tua área de recursos.
>
> **O que tens disponível:**
> ✅ Gravação completa da Masterclass (3h)
> ✅ Workbook Resumo de Apoio
> ✅ Links dos Exercícios
> ✅ Lista de ferramentas recomendadas
>
> [Aceder aos meus recursos →]
>
> O meu conselho: não tentes fazer tudo ao mesmo tempo. Escolhe um dos fluxos que abordámos, pega no telemóvel e faz um vídeo de 30 segundos. O sistema funciona — mas só se o usares.

**Bloco avaliação (amarelo):**
> ⭐ **A tua opinião conta**
> Se a Masterclass te foi útil, ficaria muito grato se deixasses uma avaliação rápida no Google. Demora menos de 1 minuto e ajuda-me a continuar a criar este tipo de conteúdo.
> [Deixar avaliação no Google →] (podes.entrar.pt/avaliar)

**Fecho:** `Bom trabalho e boas produções.`

## Alterações técnicas

### `supabase/functions/send-video-masterclass-day1/index.ts`
- Reescrever `buildFallbackHtml()` com o copy refinado acima
- Remover o bloco "Resumo do que foi abordado" (5 capítulos) — demasiado longo para email, já está na página de recursos
- Remover bloco "Recursos anteriores" (links para /recursos e /recursos-video) — foco é a Masterclass
- Adicionar bloco de avaliação Google com CTA para `podes.entrar.pt/avaliar`
- Actualizar subject para `{{fname}}, os teus recursos da Masterclass estão prontos`
- Manter: header verde, lista de recursos, CTA principal, assinatura, footer

### `src/components/crm/AutomationFlowTab.tsx` (linha ~631)
- Actualizar `subtitle` do nó para reflectir o novo conteúdo: `"14 de Março · 10h · gravação + recursos + avaliação Google"`

### `src/components/crm/templateLabels.ts` (linha ~54)
- Actualizar label: `"Masterclass Day 1 — Recursos + Avaliação Google"`

