
# Substituir CTAs do Hero por botao unico verde

## Alteracao

No ficheiro `src/components/landing/HeroSection.tsx`, linhas 68-87:

- Remover os dois botoes actuais (purple gradient + cyan outline)
- Substituir por um unico botao centralizado:
  - Texto: **"Inscrever-me gratis →"**
  - Fundo verde: `bg-green-600 hover:bg-green-700`
  - Full-width ate `max-w-[320px]`, centrado com `mx-auto`
  - Mesmo estilo base: `font-heading font-bold text-base py-4 rounded-xl`
  - Sombra verde subtil
  - Abre o modal free ao clicar
- Remover imports nao utilizados (`Sparkles`, `Check`) se deixarem de ser usados

## Ficheiro

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/HeroSection.tsx` | Substituir 2 botoes por 1 botao verde centrado, full-width max 320px |
