

## Melhorias de SEO e Meta Tags

### Problemas Identificados

1. **index.html - Structured Data com ano errado**: O JSON-LD tem `"startDate": "2025-02-18"` em vez de `2026-02-18`
2. **index.html - Description redundante**: O texto tem "Gratuito" repetido no final da description que o utilizador colou
3. **Paginas sem meta tags proprias**: `/upgrade`, `/confirmacao`, `/convites` nao definem `document.title` nem meta description -- herdam os da landing page, o que e mau para SEO e partilha social
4. **Apenas `/live` define title dinamico** via useEffect, mas de forma incompleta (so title + description, sem OG)
5. **Sem gestao centralizada de meta tags**: Cada pagina faz (ou nao) a sua propria logica

### Solucao

Criar um hook reutilizavel `usePageMeta` e aplica-lo em todas as paginas.

### Alteracoes por ficheiro

#### A) Novo ficheiro: `src/hooks/usePageMeta.ts`
- Hook que recebe `{ title, description }` e actualiza `document.title` e a meta description via useEffect
- Restaura os valores originais ao desmontar (cleanup)

#### B) `index.html`
- Corrigir ano no JSON-LD: `2025` para `2026`
- Limpar description (remover "Gratuito" duplicado no final)
- Actualizar `og:title` e `twitter:title` para consistencia

#### C) `src/pages/Upsell.tsx`
- Adicionar `usePageMeta({ title: "Upgrade — Webinar Imagens com IA", description: "Escolhe o teu plano e garante acesso Premium ou Masterclass." })`

#### D) `src/pages/Confirmacao.tsx`
- Adicionar `usePageMeta({ title: "Inscricao Confirmada — Webinar Imagens com IA", description: "A tua inscricao foi confirmada. Adiciona ao calendario e partilha." })`

#### E) `src/pages/Convites.tsx`
- Adicionar `usePageMeta({ title: "Programa de Convites — Webinar Imagens com IA", description: "Convida amigos e ganha premios exclusivos." })`

#### F) `src/pages/WebinarLive.tsx`
- Substituir useEffect manual pelo `usePageMeta`

#### G) `src/pages/Index.tsx`
- Adicionar `usePageMeta` com o title/description principal para garantir restauro correcto ao navegar entre paginas

#### H) `src/pages/NotFound.tsx`
- Adicionar `usePageMeta({ title: "Pagina nao encontrada", description: "..." })`

### Detalhe Tecnico

```typescript
// src/hooks/usePageMeta.ts
import { useEffect } from "react";

export function usePageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let prevDesc: string | null = null;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        prevDesc = meta.getAttribute("content");
        meta.setAttribute("content", description);
      }
    }

    return () => {
      document.title = prevTitle;
      if (description && prevDesc !== null) {
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", prevDesc);
      }
    };
  }, [title, description]);
}
```

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/usePageMeta.ts` | Novo hook reutilizavel |
| `index.html` | Corrigir ano JSON-LD, limpar description |
| `src/pages/Upsell.tsx` | Adicionar usePageMeta |
| `src/pages/Confirmacao.tsx` | Adicionar usePageMeta |
| `src/pages/Convites.tsx` | Adicionar usePageMeta |
| `src/pages/WebinarLive.tsx` | Substituir useEffect por usePageMeta |
| `src/pages/Index.tsx` | Adicionar usePageMeta |
| `src/pages/NotFound.tsx` | Adicionar usePageMeta |
