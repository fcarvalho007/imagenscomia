
## Redesenho da Página /recursos — Layout "Video-First"

### Objectivo e Abordagem

Substituir o layout de coluna única com scroll longo por uma página de 2 colunas (desktop) com fundo navy, estilo premium alinhado com `/live`. O componente principal a reescrever é `RecursosConteudo.tsx`, tornando-o auto-suficiente com tabs internas. O `RecursosUpsell.tsx` é mantido mas adaptado para caber na sidebar.

---

### Arquitectura do Novo Layout

```text
┌─────────────────────────────────────────────────────────────┐
│  HEADER (sticky) — "Recursos · Imagens com IA"    [Sair]   │
├───────────────────────────────────┬─────────────────────────┤
│  HERO — COLUNA ESQUERDA (70%)     │  SIDEBAR (30%)          │
│                                   │                         │
│  [Player Vimeo — 16:9]            │  📚 Guia PDF (botão)    │
│                                   │  🔖 Prompts (badge)     │
│  [Abrir no Vimeo ↗]              │  💬 Suporte compacto    │
│                                   │  ── divider ──          │
│  ─── TABS ─────────────────────── │  🎓 Upsell Masterclass │
│  Gravação | Guia | Prompts | FAQ  │    (sticky)             │
│                                   │  (ou "Incluído ✓")      │
│  [Tab content — capítulos /       │                         │
│   guia accordion / prompts /      │                         │
│   FAQ accordion]                  │                         │
└───────────────────────────────────┴─────────────────────────┘
```

Mobile: player full-width → tabs abaixo → sidebar colapsada em chips no topo.

---

### Ficheiros a alterar

| Ficheiro | Acção |
|---|---|
| `src/components/recursos/RecursosConteudo.tsx` | Reescrever — novo layout + tabs |
| `src/components/recursos/RecursosUpsell.tsx` | Adaptar para sidebar compacta |

**Nenhuma alteração a lógica de autenticação, rotas, ou base de dados.**

---

### Detalhe Técnico

#### 1. Fundo e estilo visual (alinhado com `/live`)

Fundo navy igual ao da página `/live`:
```css
background: linear-gradient(to bottom, #050816, #0B1026)
```
Cards em vidro branco translúcido com `backdrop-blur`:
```css
background: rgba(255,255,255,0.96)
```
Header sticky com `bg-white/10 backdrop-blur-md border-b border-white/10` para se fundir com o fundo navy.

Tipografia:
- H1 (título "Olá, {nome}"): `font-heading font-bold text-[28px] sm:text-[32px] text-white`
- H2 (tabs/secções): `text-[18px] font-bold`
- Body: `text-[14px]–text-[15px]`

---

#### 2. Layout de 2 colunas

```tsx
<main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-10">
  {/* Title row */}
  <div className="mb-6">
    <p className="text-white/50 text-[13px] uppercase tracking-widest mb-1">Área Reservada</p>
    <h1 className="font-heading font-bold text-[28px] sm:text-[32px] text-white">
      Olá, {firstName}! 👋
    </h1>
    <p className="text-white/60 text-[15px] mt-1">Aqui estão os teus recursos do webinar.</p>
  </div>

  {/* 2-col grid */}
  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
    
    {/* Main column — 70% */}
    <div className="flex-1 min-w-0">
      {/* Player card */}
      <div className="rounded-[20px] overflow-hidden bg-black shadow-2xl mb-4" style={{ aspectRatio: "16/9" }}>
        {/* Vimeo iframe */}
      </div>
      
      {/* Vimeo fallback link */}
      <div className="flex justify-end mb-4">
        <a href={vimeoUrl} target="_blank" ...>
          <ExternalLink size={12} /> Abrir no Vimeo
        </a>
      </div>
      
      {/* Tabs */}
      <div className="bg-white/96 rounded-[16px] border border-white/20 shadow-lg overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-border">
          {["Gravação", "Guia", "Prompts", "FAQ"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} ...>
              {tab}
            </button>
          ))}
        </div>
        {/* Tab content */}
        {activeTab === "Gravação" && <ChaptersTab />}
        {activeTab === "Guia"    && <GuiaTab />}
        {activeTab === "Prompts" && <PromptsTab />}
        {activeTab === "FAQ"     && <FAQTab />}
      </div>
    </div>

    {/* Sidebar — 30% */}
    <aside className="w-full lg:w-[320px] flex-shrink-0">
      <div className="lg:sticky lg:top-[72px] space-y-4">
        <QuickActionsCard />
        <SuporteCard />
        <RecursosUpsellCompact hasMasterclass={hasMasterclass} />
      </div>
    </aside>

  </div>
</main>
```

---

#### 3. Tab: Gravação (capítulos clicáveis)

Estado local `activeChapter: number` para destaque visual.

```tsx
{RECURSOS_CONFIG.chapters.map((ch, i) => (
  <li
    key={i}
    onClick={() => setActiveChapter(i)}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
      activeChapter === i
        ? "bg-blue-50 text-blue-700"
        : "hover:bg-gray-50 text-ink-700"
    }`}
  >
    <span className="font-mono text-xs text-ink-400 w-12">{ch.time}</span>
    <span className="text-sm">{ch.label}</span>
    {activeChapter === i && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
  </li>
))}
```

Nota: Os timestamps são "accionáveis" visualmente — o click destaca o capítulo activo e seria possível passar o `startTime` ao iframe Vimeo via URL com `#t=XXm`, mas como o embed actual usa `dangerouslySetInnerHTML` sem estado dinâmico, o destaque visual é suficiente por agora.

---

#### 4. Tab: Guia

Botão de download em destaque + accordion de checklist (mantido da versão actual).

```tsx
<div className="p-5">
  <div className="flex items-center gap-3 mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
      <Download size={18} className="text-blue-600" />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-ink-900 text-sm">Guia de Apoio — PDF</p>
      <p className="text-xs text-ink-400">Conceitos, ferramentas e boas práticas</p>
    </div>
    <a href={guiaPdfUrl} download>
      <Button size="sm" className="gap-1.5">
        <Download size={13} /> Descarregar
      </Button>
    </a>
  </div>
  {/* accordion checklist */}
</div>
```

---

#### 5. Tab: Prompts — Teaser em vez de Lock

Substituir o ecrã de cadeado simples por conteúdo de teaser:

```tsx
{/* Quando não disponível */}
<div className="p-5 space-y-5">
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-bold tracking-widest uppercase text-amber-700
                     bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      Disponível a partir de 25 de Fevereiro
    </span>
  </div>
  <p className="text-sm text-ink-500">
    A biblioteca de prompts está a ser finalizada. O que inclui:
  </p>
  <ul className="space-y-3">
    {[
      "50+ prompts organizados por categoria (fotografia, produto, editorial, vídeo)",
      "Templates para Freepik Mystic, Adobe Firefly e Midjourney",
      "Exemplos com resultado esperado e variações de estilo",
    ].map((bullet, i) => (
      <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
        <Check size={14} className="text-green-600 mt-0.5 shrink-0" />
        {bullet}
      </li>
    ))}
  </ul>
  <div className="pt-2">
    <p className="text-xs text-ink-400">
      Receberás um email assim que estiver disponível.
    </p>
  </div>
</div>
```

---

#### 6. Tab: FAQ com "Ver todas"

Estado `showAllFaqs: boolean` (default `false`). Mostrar primeiras 5 por defeito.

```tsx
const visibleFaqs = showAllFaqs ? RECURSOS_CONFIG.faqs : RECURSOS_CONFIG.faqs.slice(0, 5);
// ... render accordion
// botão "Ver todas (8)" apenas se !showAllFaqs e faqs.length > 5
```

---

#### 7. Sidebar — Card "Ações rápidas"

Card branco com as 2–3 acções mais importantes:

```tsx
<div className="bg-white/96 rounded-[16px] border border-white/20 shadow-lg p-4">
  <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-3">
    Acções rápidas
  </p>
  <div className="space-y-2">
    <a href={guiaPdfUrl} download className="flex items-center gap-3 p-3 rounded-xl
       bg-blue-50 hover:bg-blue-100 transition-colors">
      <Download size={16} className="text-blue-600" />
      <span className="text-sm font-medium text-ink-900">Descarregar Guia PDF</span>
    </a>
    <button
      onClick={() => setActiveTab("Prompts")}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors
        ${promptsAvailable ? "bg-green-50 hover:bg-green-100" : "bg-gray-50 cursor-default"}`}
    >
      <BookOpen size={16} className={promptsAvailable ? "text-green-600" : "text-ink-300"} />
      <div className="text-left">
        <span className="text-sm font-medium text-ink-900 block">Prompts</span>
        {!promptsAvailable && (
          <span className="text-[10px] text-ink-400">A partir de 25 Fev</span>
        )}
      </div>
    </button>
  </div>
</div>
```

---

#### 8. Sidebar — Card "Suporte" compacto

```tsx
<div className="bg-white/96 rounded-[16px] border border-white/20 shadow-lg p-4">
  <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-1">
    Suporte
  </p>
  <p className="text-[12px] text-ink-400 mb-3">Resposta em 24–48h úteis.</p>
  <div className="flex flex-col gap-2">
    <a href="https://wa.me/351915015508?text=..." target="_blank"
       className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium
                  text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors">
      <MessageCircle size={14} style={{ color: "#25D366" }} /> WhatsApp
    </a>
    <a href="mailto:frederico@digitalfc.pt?..."
       className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium
                  text-ink-700 bg-gray-50 border border-border hover:bg-gray-100 transition-colors">
      <Mail size={14} className="text-ink-400" /> Email
    </a>
  </div>
</div>
```

---

#### 9. Sidebar — Upsell Masterclass

Para não-bundle: card premium com badges, bullets e botão CTA — versão compacta do `RecursosUpsell`.
Para bundle: card verde "Masterclass incluída ✓".

O `RecursosUpsell.tsx` é adaptado para receber uma prop `compact?: boolean` que remove espaçamentos e texto secundário.

---

#### 10. Header adaptado ao fundo navy

```tsx
<header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
    <p className="text-sm font-semibold text-white">Imagens com IA — Recursos</p>
    <button onClick={onLogout} className="text-xs text-white/50 hover:text-white/80 ...">
      <LogOut size={13} /> Sair
    </button>
  </div>
</header>
```

---

#### 11. Mobile

- Player full-width, sem height mínima forçada no mobile (aspecto ratio 16:9 responsivo)
- Tabs scrolláveis horizontalmente com `overflow-x-auto`
- Sidebar aparece abaixo do conteúdo das tabs em mobile
- Card "Ações rápidas" condensa em grid 2x1

---

### Componentes com estado interno (React hooks necessários)

```tsx
const [activeTab, setActiveTab] = useState<"Gravação" | "Guia" | "Prompts" | "FAQ">("Gravação");
const [activeChapter, setActiveChapter] = useState<number>(0);
const [showAllFaqs, setShowAllFaqs] = useState(false);
```

---

### O que NÃO muda

- Lógica de autenticação (`Recursos.tsx`, `RecursosLogin.tsx`) — intacta
- `RECURSOS_CONFIG` — movido para o topo do ficheiro (igual ao actual)
- Dados (FAQ, chapters, URLs) — idênticos
- `RecursosUpsell.tsx` — adapta-se para sidebar com uma nova prop `compact`
- Sem novas dependências de pacotes

---

### Resumo das mudanças por ficheiro

| Ficheiro | Mudança |
|---|---|
| `RecursosConteudo.tsx` | Reescrito — novo fundo navy, layout 2 colunas, tabs, sidebar sticky |
| `RecursosUpsell.tsx` | Adicionar prop `compact?: boolean` para versão sidebar |

