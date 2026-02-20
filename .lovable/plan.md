

# Restaurar Hero dark/neon + Eliminar "Respostas Rapidas"

## Resumo

Duas alteracoes no ficheiro `src/pages/Gravacao.tsx`:

1. **Hero volta ao estilo dark/neon** (identico ao da landing page principal) com o novo texto
2. **Seccao "Respostas rapidas" removida** — a informacao e distribuida pelas seccoes existentes

---

## A) Hero dark/neon com novo texto

Substituir o hero actual (branco, linhas 217-289) pelo estilo dark da landing page:

- Fundo: `linear-gradient(160deg, #06091A, #0B1230, #080E22)`
- ColorBends animado como background (azul/roxo/ciano/verde)
- Badge neon: fundo `rgba(37,99,235,0.15)`, borda azul, texto `#93C5FD` — "ACESSO IMEDIATO · PACK COMPLETO · 27 EUR"
- H1 branco (#F8FAFC), bold, mesmo texto actual
- Subheadline com GradientText animado (igual ao da landing)
- Linha "Ver hoje. Aplicar amanha." em GradientText
- CTA verde com ElectricBorder (cor #22C55E, botao bg #16A34A) — "Garantir acesso imediato (27 EUR)"
- Link secundario em azul claro
- Trust microcopy (icones + texto branco/50%)
- GoogleBadge versao dark
- Importar `ColorBends` e `ElectricBorder`; adicionar componente `GradientText` (copiado da HeroSection)

O CTAButton reutilizavel tambem muda: onde for usado no resto da pagina mantem azul (#2563EB), mas no hero usa o verde com ElectricBorder directamente.

---

## B) Remover "Respostas rapidas" e distribuir conteudo

Eliminar a seccao inteira (linhas 291-339) e o array `quickAnswers` (linhas 44-54).

A informacao util e absorvida pelas seccoes que ja existem:

| Informacao | Onde fica |
|---|---|
| "O que e?" e "Do que se trata?" | Ja esta implicito no Hero (H1 + subheadline) e no Pack |
| "Que dores resolve?" | Ja coberto pela seccao Bloqueios |
| "Porque comprar agora?" | Adicionar uma linha curta na seccao Pack, antes do CTA |
| "Como a vida muda?" | Adicionar como frase de fecho na seccao Bloqueios |
| "O que vou ser capaz?" | Ja esta nos 3 outcome bullets da seccao Metodo |
| "Quem e o formador?" | Ja existe a seccao Formador |
| "Prova social?" | Ja existe a seccao Testemunhos |
| "Principais duvidas?" | Ja existe o FAQ |

Concretamente, apenas 2 micro-adicoes de copy:

1. **Seccao Pack** — antes do CTA, adicionar linha: "Organiza o processo e reduz tentativa-erro. Templates reutilizaveis desde o primeiro dia."
2. **Seccao Bloqueios** — alterar a frase de fecho para: "Se houver identificacao com 2+ pontos, este pack encurta meses de tentativa-erro. Menos bloqueios, mais autonomia: cria quando precisa, sem depender de designer ou agencia."

---

## Ficheiro a alterar

| Ficheiro | Alteracao |
|---|---|
| `src/pages/Gravacao.tsx` | Importar ColorBends + ElectricBorder; adicionar GradientText; reescrever hero para dark/neon; remover quickAnswers + seccao Respostas Rapidas; micro-adicoes de copy no Pack e Bloqueios |

Nenhum ficheiro novo. Componentes `ColorBends` e `ElectricBorder` ja existem no projecto.

