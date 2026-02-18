
## Reorganização da Página /recursos — Sem Duplicação + Clareza de Conteúdo

### Problema actual

Os recursos (Resumo PDF, Áudio, SOP, WHISK) estão **duplicados** — aparecem tanto na tab "Gravação" quanto na sidebar. O utilizador vê a mesma informação duas vezes sem propósito claro.

### Decisão de arquitectura

Os recursos ficam **apenas na sidebar** (coluna da direita), que é sempre visível e funciona como painel de acesso rápido. A tab "Gravação" fica exclusivamente com o índice de capítulos — sem mistura de conteúdo.

---

### Alterações por ficheiro

#### `src/components/recursos/RecursosConteudo.tsx`

**1. Tab "Gravação" — remover bloco de recursos duplicado**

Apagar o bloco completo `{/* Resources */}` (linhas 248–313) que contém os 4 botões (Resumo, Áudio, SOP, WHISK). A tab fica limpa com apenas o índice de capítulos.

**2. Tab "Guia" — remover secção "Guia de Prompts" com bullets**

Apagar o bloco "Guia de Prompts — teaser" (linhas 367–392) que contém:
- Título "Guia de Prompts"
- Badge "Disponível a 25 Fev"
- 3 bullets (50+ prompts, Templates, Exemplos)
- Texto "Receberás um email..."

Em substituição, adicionar dois itens na tab Guia — abaixo do accordion existente:

```
┌─ Guia de Apoio Nano Banana Pro (32 páginas) ─────────────────┐
│  [ícone livro]  Guia de Apoio Nano Banana Pro                 │
│                 32 páginas · Brevemente                       │
│                 [badge cinza: "Em breve"]                     │
└───────────────────────────────────────────────────────────────┘

┌─ Guia de Prompts ────────────────────────────────────────────┐
│  [ícone ficheiro]  Guia de Prompts                            │
│                    Disponível a 25 de Fevereiro               │
│                    [badge âmbar: "25 Fev"]                    │
└───────────────────────────────────────────────────────────────┘
```

Estes itens ficam **desactivados visualmente** (sem link clicável, opacidade reduzida, cursor não-pointer) — deixando claro que não estão disponíveis.

**3. Sidebar — reorganizar e clarificar recursos**

A sidebar "Recursos" fica com todos os links, organizados por disponibilidade:

**Disponíveis (com link):**
- Resumo do Webinar — PDF
- Áudio em Bruto — MP3
- SOP de Prompts — Criação de Projecto
- Exercício Google WHISK

**Indisponíveis (com aviso claro, sem link):**
Nenhum nesta lista — os guias indisponíveis ficam na tab Guia.

O "Guia PDF" (guia-essencial-seo.png) mantém-se na sidebar.

**4. Botão Masterclass — novo texto**

Em `RecursosUpsell.tsx`, trocar em ambas as variantes (`compact` e normal):

```
"Ver Masterclass"  →  "Inscrição na Masterclass (3h)"
```

E actualizar o subtítulo/badge para incluir:
```
"5 de Março, quinta-feira · 10h00"
```

---

### Resultado visual final

**Tab "Gravação":**
```
Índice da sessão
  ○ 00:00  Introdução e estado da arte
  ○ 08:30  Método: do briefing à imagem
  ○ 24:00  Demos ao vivo com ferramentas
  ○ 48:00  Q&A e casos práticos
```
(só isto — sem recursos abaixo)

**Tab "Guia":**
```
[Banner] Guia de Apoio — PDF  [Descarregar]

Checklist rápida
  › Setup inicial...
  › Erros comuns...
  › Boas práticas...

────────────────────────────────
[desactivado] 📖 Guia de Apoio Nano Banana Pro (32 páginas)
              Em breve
[desactivado] 📋 Guia de Prompts
              Disponível a 25 de Fevereiro
```

**Sidebar "Recursos":**
```
[azul]    📄 Resumo do Webinar          → Drive
[cinza]   🎧 Áudio em Bruto             → Drive
[violeta] 📋 SOP de Prompts             → Drive
[verde]   🔢 Exercício Google WHISK     → Drive
[azul]    📥 Guia PDF                   → Download
```

**Sidebar "Masterclass" (para não-bundle):**
```
[CTA azul] Inscrição na Masterclass (3h)
           5 de Março, quinta-feira · 10h00
```

---

### Ficheiros a alterar

| Ficheiro | Mudança |
|---|---|
| `src/components/recursos/RecursosConteudo.tsx` | Remover duplicação na tab Gravação, remover bullets Prompts, adicionar 2 items "em breve" na tab Guia, reorganizar sidebar |
| `src/components/recursos/RecursosUpsell.tsx` | Novo texto do botão e data da Masterclass |
