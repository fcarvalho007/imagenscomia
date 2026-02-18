
## Simplificação da Página /recursos

### O que muda

| # | Pedido | Localização |
|---|---|---|
| 1 | Remover player Vimeo — substituir por aviso a preto (sem cor âmbar) | `RecursosConteudo.tsx` |
| 2 | Remover tabs FAQ e Guia — ficar só com uma secção única (sem tabs) | `RecursosConteudo.tsx` |
| 3 | Renomear tab "Gravação" → secção "Apoio ao conhecimento" com itens "Em breve" abaixo | `RecursosConteudo.tsx` |
| 4 | Remover "Guia PDF / Descarregar" da sidebar | `RecursosConteudo.tsx` |
| 5 | Destacar mais a caixa da Masterclass na sidebar | `RecursosUpsell.tsx` |

---

### Detalhe técnico

#### 1. Player — substituir por aviso simples a preto

O bloco do player (linhas 186–198) passa a ser um placeholder sóbrio, sem iframe:

```tsx
<div className="rounded-2xl bg-gray-900 shadow-lg mb-3 border border-gray-800"
     style={{ aspectRatio: "16/9" }}>
  <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
      <Clock size={20} className="text-gray-400" />
    </div>
    <div>
      <p className="text-white font-semibold text-[15px] mb-1">Gravação em processamento</p>
      <p className="text-gray-400 text-sm">
        Disponível em breve. Receberás um email quando estiver pronto.
      </p>
    </div>
  </div>
</div>
```

O banner âmbar de "processamento" acima do player é **removido** — o placeholder já comunica isso de forma mais limpa.

---

#### 2–3. Tabs → secção única com índice + "Apoio ao conhecimento"

As tabs são eliminadas completamente (`TabBar`, `TabType`, `TABS`, `activeTab`). O conteúdo dos tabs é reorganizado numa única vista:

**Estrutura final abaixo do player:**

```
┌─ Card único ──────────────────────────────────────────────────┐
│                                                               │
│  ○ Índice da sessão                                           │
│    [00:00] Introdução e estado da arte                        │
│    [08:30] Método: do briefing à imagem                       │
│    [24:00] Demos ao vivo com ferramentas                      │
│    [48:00] Q&A e casos práticos                               │
│                                                               │
│  ────────────────────────────────                             │
│                                                               │
│  📚 Apoio ao conhecimento                                     │
│                                                               │
│  [desactivado] 📖 Guia de Apoio Nano Banana Pro (32 páginas)  │
│                Em breve                                       │
│                                                               │
│  [desactivado] 📋 Guia de Prompts                             │
│                Disponível a 25 de Fevereiro  [badge 25 Fev]   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

O cabeçalho "Apoio ao conhecimento" usa o mesmo estilo de `text-[11px] font-semibold uppercase tracking-widest` já usado nos outros títulos de secção.

O accordion do Guia e as FAQs são **removidos** por completo (simplifica muito o componente).

---

#### 4. Sidebar — remover "Guia PDF"

O item "Guia PDF / Descarregar" (linhas 376–392) é apagado. A sidebar de "Recursos" fica com:
- Resumo da sessão
- Áudio em Bruto
- SOP de Prompts
- Exercício Google WHISK

O label "Recursos" mantém-se.

---

#### 5. Destacar a caixa da Masterclass

A variante `compact` em `RecursosUpsell.tsx` passa a ter **fundo azul-escuro** em vez de branco, para se destacar da sidebar:

```tsx
<div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-md p-4 text-white">
  <span className="... bg-white/20 text-white border-white/30 ...">Próximo passo</span>
  <p className="text-sm font-bold text-white ...">Quer ir mais longe?</p>
  <p className="text-xs text-blue-100 ...">Masterclass — Imagem para Vídeo com IA</p>
  {/* bullets com ícones a branco */}
  <span className="... bg-white/20 text-white ...">5 de Março ...</span>
  <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 ...">
    Inscrição na Masterclass (3h)
  </Button>
</div>
```

Para quem **já tem a Masterclass**, mantém-se o estilo verde mas também com mais destaque (borda mais grossa, sombra).

---

### Estado final do componente (simplificado)

O componente deixa de ter:
- `TabType`, `TABS`, `TabBar`, `activeTab`, `showAllFaqs`, `visibleFaqs`
- Tab Guia com accordion de checklist
- Tab FAQ com 8 perguntas
- Banner âmbar de processamento
- Guia PDF na sidebar

O componente fica com:
- Placeholder a preto no lugar do player
- Card único com índice + "Apoio ao conhecimento"
- Sidebar limpa (4 recursos + suporte + Masterclass destacada)

### Ficheiros a alterar

| Ficheiro | Mudança |
|---|---|
| `src/components/recursos/RecursosConteudo.tsx` | Remover player/tabs/FAQ/Guia/GuiaPDF, nova estrutura única, placeholder preto |
| `src/components/recursos/RecursosUpsell.tsx` | Variante compact com fundo azul-escuro para destaque |
