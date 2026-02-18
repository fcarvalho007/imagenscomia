
## Criar a rota `/inicial` com a landing page original

### O que existe hoje

Em `src/pages/Index.tsx` há dois componentes:
- `Index` (exportado por default) — faz `<Navigate to="/gravacao" />`, não renderiza nada visualmente
- `_IndexLanding` (prefixo `_`, não exportado, não acessível) — contém a landing page completa com todas as 12 secções (HeroSection, ChallengesSection, ProgramSection, GallerySection, TransformationSection, AudienceSection, PresenterSection, TestimonialsSection, PricingCardsSection, FAQSection, CTAFinalSection, FooterSection)

### O que vamos fazer

**1. Criar `src/pages/Inicial.tsx`**

Novo ficheiro que simplesmente renderiza a landing page completa — copiando o conteúdo de `_IndexLanding` com export default. Mantemos `Index.tsx` intacto para não perturbar a rota `/`.

```tsx
// src/pages/Inicial.tsx
import { RegistrationModalProvider } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";
import { StickyTopBar } from "@/components/landing/StickyTopBar";
import { HeroSection } from "@/components/landing/HeroSection";
// ... (todos os imports da landing)

export default function Inicial() {
  return (
    <RegistrationModalProvider>
      <main className="overflow-x-hidden pt-[52px]">
        <StickyTopBar />
        <HeroSection />
        {/* ... todas as secções */}
      </main>
    </RegistrationModalProvider>
  );
}
```

**2. Registar a rota em `src/App.tsx`**

Adicionar uma linha ao router:
```tsx
import Inicial from "./pages/Inicial";
// ...
<Route path="/inicial" element={<Inicial />} />
```

### O que NÃO muda
- `/` continua a redirecionar para `/gravacao`
- `/gravacao` continua a ser a página principal
- `Index.tsx` não é tocado
- Nenhuma outra rota é alterada

### Resultado
A URL `imagenscomia.lovable.app/inicial` (e em produção `imagenscomia.com/inicial`) mostrará a landing page original do webinar completa, preservada indefinidamente para revisitar quando precisar.

### Ficheiros alterados
- `src/pages/Inicial.tsx` — novo ficheiro (landing page original)
- `src/App.tsx` — adicionar `import Inicial` e `<Route path="/inicial">`
