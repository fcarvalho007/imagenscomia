
# Redesign visual da pagina /comprar -- cinematic dark premium

Apenas o ficheiro `src/pages/Comprar.tsx` e modificado. Nenhuma outra pagina, componente ou edge function e tocada. Toda a logica, precos, copy, modal e fluxo de pagamento permanecem iguais.

---

## Resumo das alteracoes

### 1. Fundo da pagina
- Substituir `backgroundColor: "#f9fafb"` por gradiente escuro cinematico:
  `background: linear-gradient(160deg, #0f0c29 0%, #1a1040 40%, #24243e 100%)`
- Adicionar div com radial glow roxo atras do card Bundle (posicao absoluta, blur, pointer-events-none)

### 2. Layout do container
- `max-w-6xl` (1152px) em vez de `max-w-[900px]`
- Padding horizontal: `px-8 lg:px-16`
- Gap entre header e cards: `mt-12`
- Gap entre cards: `gap-8`
- Cards `items-stretch` com flex-col justify-between interno

### 3. Header (badges e texto acima dos cards)
- Event badge: `bg-white/10 backdrop-blur text-white border border-white/20 rounded-full`
- Early bird badge: `bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full`
- "Acesso garantido": `text-white/60 text-sm`
- "127 pessoas": `text-white/80 text-sm`

### 4. Redesign dos cards (PlanCard)

**Todos os cards:**
- Fundo branco, border-radius 20px, sem border -- so box-shadow
- Padding interno: `p-8`
- Div de stripe colorida no topo (8px altura, rounded-t-[20px]):
  - Masterclass: `bg-violet-400`
  - Bundle: `bg-gradient-to-r from-violet-600 to-purple-500`
  - Gravacao: `bg-slate-700`
- Masterclass/Gravacao shadow: `0 8px 40px rgba(0,0,0,0.25)`
- Bundle shadow: `0 16px 60px rgba(124,58,237,0.4)`, scale(1.04) apenas em desktop (md:)

**Badge "MAIS POPULAR" (Bundle):**
- Deixa de ser posicionado absolutamente sobre o border
- Passa a ser banner full-width no topo do card, dentro do card, com bg-gradient-to-r from-violet-600 to-purple-500, text-white text-xs font-bold tracking-widest py-2 text-center rounded-t-[20px]

**Badge "Ultimos lugares disponiveis":**
- Pill com bg-rose-500, text-white, text-xs, rounded-full, px-3 py-1

### 5. Preco
- Tamanho do preco principal: `text-5xl font-black`
- "+ IVA": `text-sm text-gray-400`, verticalmente centrado
- Early bird badge: fundo amber, rounded-full, text-xs font-semibold

### 6. Icones tematicos na lista de beneficios

Substituir os circulos com Check por icones lucide-react tematicos (w-4 h-4), cor matching o stripe:

| Texto contem | Icone |
|---|---|
| "horas ao vivo" ou "Masterclass" | Video |
| "Sistema completo" ou "prompts" | Sparkles |
| "Gravacao" ou "Gravacao" | Play |
| "Pack de apoio" ou "checklists" | FileText |
| "Sessao Q&A" | MessageCircle |

A cor do icone sera violet-500 para Masterclass/Bundle e slate-600 para Gravacao.

### 7. Bloco de calendario
- `bg-violet-50 border border-violet-100 rounded-lg text-violet-700 font-medium text-sm`
- Icone `CalendarDays` em vez de `Calendar`

### 8. Botoes CTA
- Masterclass: `bg-violet-600 hover:bg-violet-700 rounded-xl py-4 font-semibold`
- Bundle: `bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 rounded-xl py-4 font-bold text-lg`
- Gravacao: `bg-slate-800 hover:bg-slate-900 rounded-xl py-4 font-semibold`

### 9. Footer trust row
- Textos: `text-white/50`
- Separador: `bg-white/20`
- Icone Lock: `text-white/40`

### 10. Mobile (< md)
- Cards empilham verticalmente
- Bundle perde `scale(1.04)` em mobile
- Tudo funciona com o padrao existente de `isMobile` e classes responsivas

---

## Detalhes tecnicos

**Ficheiro unico modificado:** `src/pages/Comprar.tsx`

**Imports adicionados:** `Video, Sparkles, Play, FileText, MessageCircle, CalendarDays` de `lucide-react`

**Imports removidos:** `Calendar` (substituido por `CalendarDays`)

**Logica de mapeamento de icones:** funcao helper `getBenefitIcon(text, color)` que retorna o componente lucide correcto baseado em keywords no texto do beneficio. Fallback para Check se nenhuma keyword fizer match.

**Propriedades adicionadas ao tipo PLANS:** `stripeColor` (string classe Tailwind) e `ctaClassName` (string de classes Tailwind para o botao) para evitar inline styles repetidos.

Nenhuma alteracao a: PurchaseModal, WhatsAppSupportButton, precos, copy, fluxo de pagamento, ou qualquer outro ficheiro.
