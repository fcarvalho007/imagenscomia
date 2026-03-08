

# Refinamentos — Landing Page Masterclass Vídeo

## Avaliação

A página está bem estruturada e já tem boa responsividade mobile. Identifico os seguintes refinamentos por prioridade:

### Alta prioridade

1. **Hero CTA label trunca em mobile (375px)** — O texto "Garantir o meu lugar — €67 + IVA" é longo para ecrãs pequenos. O `ctaLabelShort` já existe mas só é usado no sticky mobile CTA. O botão principal do hero usa `ctaLabel` (versão longa), que pode ficar apertado dentro do `maxWidth: 400`.
   - **Fix**: Usar `ctaLabelShort` no hero CTA em mobile via classes responsivas (hidden/block).

2. **Falta `aria-label` nos botões CTA** — Todos os botões de navegação (`navigateCta`, `navigateBundle`) não têm `aria-label`, o que prejudica acessibilidade.
   - **Fix**: Adicionar `aria-label` descritivo a cada botão.

3. **Sticky top bar e sticky mobile CTA sobrepostos em viewports 640-767px** — O sticky mobile CTA usa `sm:hidden` (desaparece a 640px+), mas entre ~500-639px ambos os stickies (top + bottom) comprimem o conteúdo visível.
   - **Fix**: Não é necessário — o comportamento actual é aceitável.

### Média prioridade

4. **Secção "Pack IA Completo" (upgrade) — botão full-width em mobile sem padding visual suficiente** — O botão tem `w-full sm:w-auto` mas o container tem apenas `px-4`. O botão toca quase na borda em 375px.
   - **Fix**: Aumentar padding lateral do botão ou do container em mobile.

5. **Testemunhos — grid 1 coluna em mobile pode parecer monótono** — 6 cards empilhados verticalmente criam scroll longo. Considerar um carousel horizontal em mobile.
   - **Decisão**: Manter como está — scrolling vertical é mais previsível em mobile e os cards são curtos.

6. **Background video no hero pode impactar performance em mobile** — O vídeo carrega em autoPlay mesmo em dispositivos lentos.
   - **Fix**: Adicionar `preload="none"` ou condicionar com `useIsMobile()` para não carregar o vídeo em mobile.

7. **FAQ AccordionTrigger text-left** — Já está correcto, sem issues.

### Baixa prioridade

8. **Google badge duplicado** — Aparece no hero e na secção do apresentador. Intencional para reforço social, não é um problema.

9. **JSON-LD cleanup** — O `useEffect` não verifica se já existe um script com o mesmo ID antes de criar outro. Em React strict mode pode duplicar.
   - **Fix**: Adicionar `document.getElementById("masterclass-jsonld")?.remove()` antes de `appendChild`.

## Plano de implementação

| # | Ficheiro | Alteração |
|---|---|---|
| 1 | `MasterclassVideo.tsx` | Hero CTA: mostrar `ctaLabelShort` em mobile, `ctaLabel` em desktop via `<span className="hidden sm:inline">` / `<span className="sm:hidden">` |
| 2 | `MasterclassVideo.tsx` | Adicionar `aria-label` aos 4 botões CTA principais |
| 3 | `MasterclassVideo.tsx` | Hero video: adicionar `preload="none"` para performance mobile |
| 4 | `MasterclassVideo.tsx` | Pack IA botão: ajustar `px-4 sm:px-6` no container para mais respiro |
| 5 | `MasterclassVideo.tsx` | JSON-LD useEffect: remover script existente antes de criar novo |

Todas as alterações são em `MasterclassVideo.tsx` — CSS/atributos, sem mudanças de lógica.

