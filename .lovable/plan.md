

## Correcoes: Espacamento Hero Desktop + Scroll Mobile no /upgrade

### Problemas identificados

1. **Hero desktop**: Pouco espaco entre as 4 caixas de especificacoes e o botao CTA. Actualmente o gap e apenas `mb-6` (~24px).
2. **Mobile /upgrade (passos 2 e 3)**: A pagina nao comeca no topo ao mudar de passo. O titulo e subtitulo ficam cortados. Causa: o `advanceStep` faz `contentRef.current.scrollTo()`, mas em mobile o `contentRef` nao tem scroll proprio (so tem `lg:overflow-y-auto`). Em mobile, o scroll e do `window`, nao do div.

---

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/HeroSection.tsx` | Aumentar gap entre badges e CTA |
| `src/pages/Upsell.tsx` | Corrigir scroll-to-top em mobile |

---

### 1. Hero — mais espacamento em desktop

Na linha 132, o wrapper dos badges tem `mb-6`. Mudar para `mb-6 lg:mb-10` para dar mais respiro em desktop (~40px) sem afectar mobile.

### 2. /upgrade — scroll-to-top em mobile

Na funcao `advanceStep` (linha 61-64), o scroll so funciona no container `contentRef` que em mobile nao tem overflow. A correcao:

```text
const advanceStep = useCallback((next: number) => {
  setStep(next);
  // Desktop: scroll do container interno
  if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
  // Mobile: scroll da window
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);
```

Isto garante que tanto em desktop (scroll do painel direito) como em mobile (scroll da janela) a pagina volta ao topo ao mudar de passo.

