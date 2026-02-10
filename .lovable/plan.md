

# Reorganizacao da Landing Page + Remocoes

## Resumo

Remover a seccao Masterclass, apagar 2 pontos do Mirror Copy, e reorganizar a ordem das seccoes para um fluxo de conversao mais direto e eficaz.

## O que muda

### 1. Remover MasterclassSection
- Apagar o ficheiro `src/components/landing/MasterclassSection.tsx`
- Remover o import e o componente de `src/pages/Index.tsx`

### 2. Apagar 2 pontos do MirrorCopySection
Remover estes dois itens da lista:
- "Pagas designer ou agencia para criar materiais visuais e sabes que ha forma mais rapida"
- "Ja ouviste falar de Midjourney ou DALL-E mas nunca conseguiste resultados utilizaveis"

Ficam 3 pontos:
1. "Ja tentaste gerar imagens com IA mas os resultados ficaram longe do que querias"
2. "Precisas de imagens para redes sociais ou anuncios e o stock fotografico nao representa a marca"
3. "Queres produzir mais conteudo visual sem depender de terceiros para cada peca"

### 3. Reorganizar ordem das seccoes

A ordem atual e:
1. StickyTopBar
2. MirrorCopy (hook)
3. Hero
4. Pricing
5. Presenter
6. Challenges
7. Program
8. Audience
9. Masterclass (remover)
10. FAQ
11. CTA Final
12. Footer

Nova ordem proposta (fluxo de conversao otimizado):

1. **StickyTopBar** — urgencia sempre visivel
2. **MirrorCopy** — qualificacao imediata ("isto e para mim?")
3. **HeroSection** — proposta de valor principal + video
4. **PresenterSection** — credibilidade (quem e este?)
5. **ChallengesSection** — dor (identificacao com o problema)
6. **ProgramSection** — solucao (o que vou aprender)
7. **AudienceSection** — confirmacao final ("e para mim, sim")
8. **PricingCardsSection** — decisao de compra (agora que ja entende o valor)
9. **FAQSection** — objecoes finais
10. **CTAFinalSection** — ultimo empurrao
11. **FooterSection**

**Logica da mudanca:**
- Pricing passa de posicao 4 para posicao 8. Motivo: o utilizador deve primeiro entender o valor (quem apresenta, que problemas resolve, o que vai aprender) antes de ver precos. Mostrar precos cedo demais causa abandono em quem ainda nao percebeu o beneficio.
- Presenter sobe para logo apos o hero, para construir confianca antes de apresentar a dor.
- Audience fica antes do pricing como ultimo filtro de qualificacao.

### Ficheiros alterados
- `src/pages/Index.tsx` — nova ordem de componentes + remover import MasterclassSection
- `src/components/landing/MirrorCopySection.tsx` — remover 2 pontos da lista
- `src/components/landing/MasterclassSection.tsx` — apagar ficheiro

