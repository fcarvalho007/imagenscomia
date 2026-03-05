

# Auditoria: Referências a "Gratuito" que devem ser removidas/actualizadas

O webinar já decorreu — todas as referências a "gratuito", "grátis" e "€0" nas páginas públicas e nos funis de upgrade são inconsistentes e prejudicam a imagem do projecto. Segue a lista completa de ficheiros afectados e as correcções propostas.

---

## Ficheiros a corrigir (13 ficheiros, ~40 ocorrências)

### 1. `src/components/landing/RegistrationModal.tsx` (modal partilhado — screenshot do user)
- **L254**: Título "Webinar **Gratuito** — Ao Vivo" → adaptar para contexto pós-webinar (ex: "Quero aceder à **Gravação** — Vídeo com IA")
- **L371**: "Na participação gratuita…" → remover bloco ou adaptar
- **L416**: "Continuar com participação gratuita" → remover
- **L448/452**: Mensagens de partilha WhatsApp/email com "webinar gratuito" → actualizar copy
- **L505**: "Ou ganha Premium grátis!" → remover referral path (já não se aplica)

### 2. `src/pages/VideoLP.tsx` (landing page /video — 10+ ocorrências)
- **L200-201**: Meta title/description "Webinar Gratuito" → "Webinar Vídeo com IA"
- **L246/264**: Botões "Garantir inscrição gratuita" → "Garantir acesso à gravação"
- **L291**: Badge "WEBINAR GRATUITO · AO VIVO" → "WEBINAR · VÍDEO COM IA"
- **L343**: Box "INVESTIMENTO: Gratuito" → remover ou mostrar preço
- **L367-368**: "inscrever-me grátis/gratuitamente" → adaptar CTA
- **L677**: "inscrever-me grátis!" → adaptar
- **L857/869**: Footer CTA "inscrição gratuita" → adaptar

### 3. `src/pages/WebinarLiveVideo.tsx`
- **L45**: "Webinar gratuito" → "Webinar · Vídeo com IA"

### 4. `src/components/webinar/VideoWebinarVideoArea.tsx`
- **L73**: "Webinar gratuito — Vídeo com IA" → "Webinar — Vídeo com IA"

### 5. `src/components/upgrade/StepMasterclass.tsx`
- **L148**: "ou continuar com inscrição gratuita →" → "ou continuar só com o pack →"

### 6. `src/components/upgrade/StepVideoPremium.tsx`
- **L162**: "ou continuar com inscrição gratuita →" → "ou continuar sem este extra →"

### 7. `src/components/upgrade/StepPremium.tsx`
- **L105**: "Continuar com inscrição gratuita →" → "Continuar sem extras →"

### 8. `src/components/upgrade/SummaryPanel.tsx`
- **L49**: "Webinar Gratuito" → "Webinar ao vivo"
- **L53-54**: "€0" / "Gratuito" → remover linha ou mostrar "Incluído"

### 9. `src/components/upgrade/StepConfirmation.tsx`
- **L23**: Comentário "Variante A — Só Gratuito" → renomear
- **L188**: "€0" → remover ou adaptar

### 10. `src/components/landing/ConfirmacaoExtras.tsx`
- **L14**: Share text "webinar gratuito" → "webinar"

### 11. `src/components/landing/PricingCardsSection.tsx`
- **L27**: "PARTICIPAÇÃO GRATUITA — €0" → toda a secção deve ser repensada (já não há opção gratuita)
- **L30**: "€0" → remover
- **L52**: "garantir vaga grátis!" → adaptar

### 12. `src/components/landing/HeroSection.tsx` (landing /imagens)
- **L96**: "WEBINAR GRATUITO" → "WEBINAR · IMAGENS COM IA"
- **L137**: "INVESTIMENTO: Gratuito" → remover ou preço
- **L187**: "garantir a minha vaga grátis" → adaptar

### 13. `src/pages/Inicial.tsx`
- **L22-23**: Meta title/description "Webinar Gratuito" → actualizar

---

## Ficheiros que NÃO precisam de correcção (uso interno/contextual)
- **CRM StatusBlock/templateLabels** — labels internos de plano ("Gratuito" como status de inscrição é correcto)
- **FAQSection** — "ferramentas gratuitas e pagas" refere-se a software, não ao webinar
- **WebinarContent/Sidebar** — "ferramentas gratuitas e pagas" é descrição de conteúdo
- **TermosContent** — documento legal, pode manter referência histórica
- **FollowUpOverview** — lógica interna `isFree()`

---

## Abordagem de implementação
Cada ficheiro será editado para substituir copy "gratuito/grátis/€0" por linguagem adequada ao contexto pós-webinar (compra de gravação, pack, masterclass). As CTAs passam a direccionar para compra, não para inscrição gratuita.

