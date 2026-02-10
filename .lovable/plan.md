
# Ajustes de Copy, Programa e Elegancia da Primeira Parte

## 1. PricingCardsSection.tsx — Pacote Premium

**Remover items:**
- Apagar sub "gratis: acesso so durante o webinar" do item "Gravacao HD vitalicia"
- Apagar o item completo "Prioridade nas perguntas durante o Q&A ao vivo"

**Enfase no gratuito incluido:** Reformular a linha "Tudo do gratuito, mais:" para algo mais enfatico, como uma caixa com check verde: "Inclui tudo da participacao gratuita" com destaque visual (fundo green-50, border green-100, check verde)

**Resultado Premium — 4 items:**
1. Gravacao HD vitalicia (sem sub)
2. Sessao Q&A em grupo — 60 minutos (sub: exclusiva, apos o webinar)
3. Guia completo de prompts por tipo de imagem (sub: PDF 30+ paginas, testado em contexto empresarial)
4. App Gerador de Prompts em early access (sub: acesso antes de todos os participantes)

## 2. PricingCardsSection.tsx — Pacote Gratuito

**Substituicoes na lista:**
- "3 demos de criacao de imagens ao vivo" → "Demos ao vivo"
- "Resumo PDF: ferramentas e tipos de imagem" → "Resumo PDF da sessao"
- "App Gerador de Prompts basica" → "Acesso a aplicacoes especializadas"

**Lista final gratuita (6 items):**
1. Webinar ao vivo (75 minutos)
2. Demos ao vivo
3. Acesso a aplicacoes especializadas
4. Resumo PDF da sessao
5. Grupo WhatsApp do evento
6. Certificado digital

## 3. ProgramSection.tsx — Mais persuasivo, menos revelado

Reescrever os 3 cards para gerar curiosidade em vez de detalhar tudo. Manter titulos mas tornar descricoes mais intrigantes e reduzir bullets para 2 por card (sem "O que levas:" — substituir por frases de beneficio).

**Card 1 — "O Metodo do Prompt Perfeito"**
Desc: "Ha uma diferenca entre gerar uma imagem e gerar a imagem certa. Vou mostrar ao vivo o que separa um resultado amador de um resultado profissional."
Bullets:
- Demo ao vivo com 5 tipos de imagem diferentes
- Acesso a uma app exclusiva que constroi prompts por ti

**Card 2 — "Imagens para Redes Sociais e Anuncios"**
Desc: "Vou criar 3 pecas prontas a publicar em direto — e vais perceber como podes fazer o mesmo para a tua marca, em minutos."
Bullets:
- Do briefing a imagem publicavel, passo a passo
- Funciona para feed, stories, anuncios e site

**Card 3 — "Escalar Producao Visual Sem Equipa"**
Desc: "O segredo nao e trabalhar mais — e ter um sistema. Vou construir um ao vivo e mostrar como multiplicar a tua producao visual."
Bullets:
- Quanto custa realmente: IA vs designer externo
- Quando usar IA e quando contratar

## 4. ChallengesSection.tsx — Card 05 mais intuitivo

Substituir a descricao do card 05:
- De: "Midjourney, DALL-E, Firefly, Ideogram. Qual delas? Para que? A que custo? Respondo tudo."
- Para: "Ha dezenas de ferramentas de IA para imagens. Qual escolher, para que situacao e a que custo? Fica claro nesta sessao."

## 5. Primeira parte da pagina — Mais elegante

A primeira parte (MirrorCopy + Hero) pode ser refinada juntando-as visualmente. Proposta:

**MirrorCopySection:**
- Remover os dois botoes CTA desta seccao (ja existem no hero e mais abaixo) — reduz repeticao e torna a entrada mais limpa
- Manter apenas: label + 3 pontos + separador + meta row (data/hora)
- Resultado: seccao mais leve, funciona como qualificacao rapida sem pedir acao imediata

**HeroSection:**
- Adicionar os dois botoes CTA (verde "Inscrever gratis" + ambar "Premium Pass") abaixo do video placeholder
- Assim o hero torna-se o primeiro ponto de conversao real, depois da qualificacao

Isto cria um fluxo mais elegante: qualificacao silenciosa (MirrorCopy) → proposta de valor + CTA (Hero)

## Ficheiros alterados
- `src/components/landing/PricingCardsSection.tsx` — premium e free features + enfase gratuito
- `src/components/landing/ProgramSection.tsx` — copy persuasivo, menos revelado
- `src/components/landing/ChallengesSection.tsx` — card 05 descricao
- `src/components/landing/MirrorCopySection.tsx` — remover botoes CTA
- `src/components/landing/HeroSection.tsx` — adicionar botoes CTA abaixo do video
