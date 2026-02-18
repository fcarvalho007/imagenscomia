
## Mudanças na Página /recursos

### Resumo das 5 alterações pedidas

| # | Pedido | Localização |
|---|---|---|
| 1 | Remover botão "Abrir no Vimeo" e "Copiar link" | Componente `ActionBar` + chamada no JSX |
| 2 | Remover tab "Prompts" → substituir por "Guia de Prompts" na tab "Guia" com badge "disponível a 25 de Fevereiro" | Tab `Guia`, `TabBar`, tipo `TabType`, array `TABS` |
| 3 | Na tab "Guia" → sub-secção "Guia de Apoio Nano Bana — disponível a 25 de Fevereiro" | Dentro do conteúdo da tab `Guia` |
| 4 | Ao lado da gravação: "Resumo PDF da sessão" | Tab `Gravação` — à direita dos capítulos, ou como sub-secção abaixo |
| 5 | Disponibilizar áudio da gravação (não editado) | Tab `Gravação` + sidebar |

---

### Detalhe técnico por alteração

#### 1. Remover "Abrir no Vimeo" e "Copiar link" da ActionBar

O componente `ActionBar` (linhas 119–170) tem 3 botões:
- "Abrir no Vimeo" → **remover**
- "Abrir no YouTube" → **manter** (condicional, só aparece se `youtubeUrl` estiver preenchido)
- "Copiar link" → **remover**

Como ficará: se `youtubeUrl` estiver vazio (caso actual), a `ActionBar` fica completamente vazia e pode ser removida. Para não deixar espaço morto, **apagar o componente `ActionBar` e a sua chamada no JSX**.

Se no futuro quiserem adicionar YouTube, o botão pode voltar diretamente como link inline.

---

#### 2. Remover tab "Prompts" → fusão com tab "Guia"

**Mudanças ao tipo e array de tabs:**
```ts
// Antes:
type TabType = "Gravação" | "Guia" | "Prompts" | "FAQ";
const TABS: TabType[] = ["Gravação", "Guia", "Prompts", "FAQ"];

// Depois:
type TabType = "Gravação" | "Guia" | "FAQ";
const TABS: TabType[] = ["Gravação", "Guia", "FAQ"];
```

O `TabBar` remove a lógica do dot azul de "Prompts" (linha 109–111).

O bloco `{activeTab === "Prompts" && ...}` (linhas 356–402) é **removido**.

**Na sidebar**, o botão "Biblioteca de Prompts" (linhas 460–489) continua a existir mas em vez de mudar para a tab "Prompts" (que deixa de existir), passa a ser um bloco teaser inline na sidebar — ou aponta para a nova secção dentro da tab "Guia".

---

#### 3. Tab "Guia" — nova secção "Guia de Apoio" + "Guia de Prompts" com teaser

A tab "Guia" actual tem:
1. Banner de download do PDF
2. Checklist accordion

Vai ficar com:
1. Banner de download do Guia de Apoio PDF (existente — **mantido**)
2. **[NOVO]** Secção "Guia de Prompts" com badge "Disponível a 25 de Fevereiro" + bullets do que inclui (teaser — conteúdo migrado da ex-tab Prompts)

```tsx
{/* Guia de Prompts — teaser */}
<div className="mt-6 pt-5 border-t border-gray-100">
  <div className="flex items-center gap-2 mb-3">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
      Guia de Prompts
    </p>
    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      Disponível a 25 Fev
    </span>
  </div>
  <ul className="space-y-2.5">
    {["50+ prompts por categoria (fotografia, produto, editorial, vídeo)",
      "Templates para Freepik Mystic, Adobe Firefly e Midjourney",
      "Exemplos com resultado esperado e variações de estilo"
    ].map((b, i) => (
      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
        <Check size={13} className="text-blue-500 mt-0.5 shrink-0" />
        {b}
      </li>
    ))}
  </ul>
  <p className="text-xs text-gray-400 mt-4">
    📧 Receberás um email assim que estiver disponível.
  </p>
</div>
```

---

#### 4. Tab "Gravação" — adicionar "Resumo PDF da sessão"

Abaixo do índice de capítulos, adicionar um bloco de download do resumo:

```tsx
{/* Resumo PDF */}
<div className="mt-5 pt-5 border-t border-gray-100">
  <a
    href={RECURSOS_CONFIG.resumoPdfUrl}
    download
    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
  >
    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
      <Download size={14} className="text-blue-600" />
    </div>
    <div>
      <span className="text-sm font-medium text-gray-900 block">Resumo da sessão</span>
      <span className="text-[11px] text-gray-500">PDF · Descarregar</span>
    </div>
  </a>
</div>
```

Adicionar `resumoPdfUrl: "/resumo-sessao.pdf"` ao `RECURSOS_CONFIG` (o ficheiro PDF pode ser colocado na pasta `/public` mais tarde).

---

#### 5. Áudio da gravação (não editado)

Adicionar na tab "Gravação" abaixo do resumo PDF, e na sidebar.

**Tab Gravação — bloco de áudio:**

```tsx
{/* Áudio da gravação */}
<div className="mt-3">
  <a
    href={RECURSOS_CONFIG.audioUrl}
    download
    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
  >
    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
      {/* Headphones icon */}
      <Headphones size={14} className="text-gray-500" />
    </div>
    <div>
      <span className="text-sm font-medium text-gray-900 block">Áudio da sessão</span>
      <span className="text-[11px] text-gray-500">MP3 · Não editado · Descarregar</span>
    </div>
  </a>
</div>
```

**Sidebar — novos items na secção "Recursos":**

```tsx
{/* Resumo PDF */}
<a href={RECURSOS_CONFIG.resumoPdfUrl} download className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 ...">
  <Download size={14} className="text-blue-600" />
  <div>
    <span className="text-sm font-medium">Resumo da sessão</span>
    <span className="text-[11px] text-gray-500">PDF</span>
  </div>
</a>

{/* Áudio */}
<a href={RECURSOS_CONFIG.audioUrl} download className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 ...">
  <Headphones size={14} className="text-gray-500" />
  <div>
    <span className="text-sm font-medium">Áudio da sessão</span>
    <span className="text-[11px] text-gray-500">MP3 · Não editado</span>
  </div>
</a>
```

Adicionar ao `RECURSOS_CONFIG`:
```ts
resumoPdfUrl: "/resumo-sessao.pdf",   // colocar ficheiro em /public
audioUrl: "/audio-sessao.mp3",        // colocar ficheiro em /public
```

Os links vão aparecer correctamente quando os ficheiros forem colocados na pasta `/public`. Até lá, o botão estará visível mas o download não terá ficheiro.

---

### Ficheiros alterados

| Ficheiro | Mudança |
|---|---|
| `src/components/recursos/RecursosConteudo.tsx` | Único ficheiro a editar — todas as 5 alterações acima |

### O que NÃO muda
- Lógica de autenticação
- Layout 2 colunas
- Estilo visual clean (fundo cinzento, cards brancos, azul CTA)
- Tab "Gravação", "FAQ"
- Sidebar (Suporte, Masterclass/Upsell)
- localStorage para tab activa (ajustar para não guardar "Prompts" como valor válido)
