

# Reescrita dos Emails de Venda Masterclass — Copy Melhorado

## O que muda

Reescrita completa do copy dos 2 email templates (`video_mc_sales_invite` e `video_mc_sales_closing`) com técnicas de copywriting mais fortes, mantendo o design Navy-Indigo existente e o tom pessoal do Frederico.

## Técnicas aplicadas

- **Open loop** no assunto (curiosidade sem revelar tudo)
- **Reciprocidade** — agradecer antes de pedir
- **Especificidade** — "prompts que levei meses a afinar" vs genérico
- **Contraste** — "No webinar tocámos na superfície. Na Masterclass, vamos mergulhar."
- **Escassez honesta** — grupo pequeno, formato único
- **Fecho empático** — sem pressão agressiva, respeitar a decisão

## Email 1 — Convite (`video_mc_sales_invite`)

**Assunto (antes):** `{{nome}}, a Masterclass é na quinta — e tens lugar reservado`
**Assunto (depois):** `{{nome}}, preparei algo especial para quem já tem o Premium Pass`

Mudanças no corpo:
- Header: título mais emocional ("3 horas que podem mudar a forma como trabalhas com vídeo")
- Abertura com gratidão genuína pelo Premium Pass
- Open loop: "vou fazer algo que nunca fiz antes"
- Bloco "O que torna esta sessão diferente" com linguagem mais específica
- Novo bloco de upgrade em caixa indigo destacada
- CTA mais suave: "Quero saber mais sobre a Masterclass →"
- Fecho convidativo a responder

## Email 2 — Última oportunidade (`video_mc_sales_closing`)

**Assunto (antes):** `{{nome}}, amanhã às 10h — último dia para garantir lugar`
**Assunto (depois):** `{{nome}}, amanhã às 10h — a Masterclass não volta a acontecer`

Mudanças no corpo:
- Header mais directo: "Amanhã às 10h. Depois disto, não volta."
- Copy curto e assertivo ("Vou ser directo")
- Contraste claro: "Não é uma repetição do webinar. É o nível seguinte."
- Prova social mais credível (perspectiva de Premium Pass)
- Checklist Bundle com item extra (preço exclusivo de upgrade)
- Fecho empático em caixa cinza: "Se decidires que não é para agora, tudo bem"
- Sem pressão excessiva — respeita a decisão

## Implementação

1. Criar edge function temporária `update-mc-sales-templates` que faz UPDATE dos 2 templates com service role key
2. Deploy e invocar via curl
3. Verificar resultado na DB
4. Apagar a edge function temporária

Apenas 1 ficheiro novo (temporário): `supabase/functions/update-mc-sales-templates/index.ts`

