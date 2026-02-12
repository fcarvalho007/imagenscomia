

## Refinamentos Adicionais para Mobile da Página /upgrade

Após revisar a página em viewport mobile (375px), identifiquei os seguintes refinamentos específicos:

### **Problemas Identificados**

1. **Passo 3 (Premium) - Badge "Early bird" ocupa espaço excessive**
   - O badge com fundo amarelo fica muito grande e comprime o card
   - Em mobile, o texto "Depois do webinar: €27 + IVA" quebra em 2 linhas desnecessariamente
   - A caixa de badge deveria ser mais compacta

2. **Passo 4 (Masterclass) - Tag "IMAGEM → VÍDEO" e detalhes desalinhados**
   - O tag é muito largo para ecrãs pequenos
   - O texto "Pagamento único · lugares limitados · 5 de Março" é muito denso e quebra em múltiplas linhas
   - O badge "Early bird" também fica desalinhado visualmente

3. **Progress bar spacing insuficiente**
   - A marginagem entre a progress bar e o conteúdo poderia ser otimizada
   - Em ecrãs muito pequenos (< 360px), a proporção fica desequilibrada

4. **Títulos ainda muito grandes em alguns pontos**
   - "Transformar imagens em vídeo com IA — ao vivo" (Step 4) é muito longo e quebra em 3 linhas
   - Poderia reduzir para `max-sm:text-[18px]` em vez de manter `text-[24px]`

5. **Bullets/Features - tamanho de ícone e espaçamento**
   - Os ícones dos bullets (Check, dark circle) poderiam ser ligeiramente menores em mobile
   - O espaçamento entre linhas está OK, mas o padding dos cards poderia ser otimizado

6. **CTA button - padding vertical muito generoso**
   - O botão principal "Garantir Premium Pass" e "Garantir lugar na Masterclass" tem `py-4` que é 16px
   - Em mobile, `py-3` (12px) seria mais adequado para economizar espaço

7. **Texto subtítulo muito denso (Step 4)**
   - "O webinar ensina o método. A Masterclass mostra como o usar para gerar vídeo — com ferramentas certas, prompts prontos e um fluxo replicável." é muito longo
   - Poderia reduzir font-size para `max-sm:text-[14px]` ou quebrar em formato mais amigável

8. **Mobile summary bar position**
   - A barra sticky "A tua inscrição | €0" está OK, mas poderia ter padding reduzido em mobile muito pequenos

### **Alterações Propostas por Ficheiro**

#### A) `src/components/upgrade/StepPremium.tsx`
- Reduzir tamanho do badge "Early bird" com `max-sm:p-1.5` (reduzido de `p-2`)
- Reduzir tamanho da fonte do badge de `text-[14px]` para `max-sm:text-[13px]`
- Mudar o badge para uma única linha usando `whitespace-nowrap` e reduzindo padding
- Reduzir button padding de `py-4` para `max-sm:py-3`
- Ajustar título para `max-sm:text-[20px]` (já está, OK)
- Adicionar `max-sm:text-[13px]` no subtítulo para ganhar espaço

#### B) `src/components/upgrade/StepMasterclass.tsx`
- Reduzir tamanho do badge "IMAGEM → VÍDEO" com `max-sm:text-[11px]` e `max-sm:px-2` (mais compacto)
- Reduzir tamanho do título para `max-sm:text-[18px]` (mais curto que 24px)
- Reduzir subtítulo para `max-sm:text-[14px]`
- Reduzir tamanho do badge "Early bird" do Masterclass para `max-sm:text-[13px]`
- Reduzir button padding de `py-4` para `max-sm:py-3`
- Reduzir tamanho dos ícones de detalhes ("💻 Online", "⏱ 3 horas") para `max-sm:text-[13px]`
- Tornar o texto de detalhes ("Pagamento único · lugares limitados · 5 de Março") mais conciso ou reduzir para `max-sm:text-[13px]`

#### C) `src/pages/Upsell.tsx`
- Ajustar padding do container content de `pt-6` para `max-sm:pt-4` (ganhar espaço)
- A progress bar já tem `mb-5` em mobile, está OK
- Verificar se `pb-24` está funcionando corretamente (deve estar)

#### D) `src/components/upgrade/SummaryPanel.tsx`
- Mobile bar já é compacta, sem alterações necessárias

### **Detalhe Técnico**

Exemplos de alterações com Tailwind:

```tsx
// Badge compacto em mobile (StepPremium)
<div className="bg-amber-50 rounded-lg p-2 max-sm:p-1.5 max-sm:text-[13px] whitespace-nowrap">
  <p className="font-semibold text-[14px] max-sm:text-[13px] text-amber-700">Early bird: €15 + IVA</p>
  <p className="text-[14px] max-sm:text-[13px] text-amber-600">Depois: €27 + IVA</p>
</div>

// Título mais curto em mobile (StepMasterclass)
<h2 className="font-heading font-bold text-[24px] max-sm:text-[18px] text-ink-900">
  Transformar imagens em vídeo com IA — ao vivo
</h2>

// Button com menos padding em mobile
<button className="w-full mt-4 py-4 max-sm:py-3 ...">
  Garantir Premium Pass →
</button>

// Tag mais compacto
<span className="inline-block text-[12px] max-sm:text-[11px] font-bold px-2.5 max-sm:px-2 py-1 rounded-md">
  IMAGEM → VÍDEO
</span>
```

| Ficheiro | Alterações |
|---|---|
| `src/components/upgrade/StepPremium.tsx` | Badge compacto, button `py-3`, subtítulo reduzido em mobile |
| `src/components/upgrade/StepMasterclass.tsx` | Tag/badge compactos, título `text-[18px]`, button `py-3`, detalhes `text-[13px]` |
| `src/pages/Upsell.tsx` | Padding superior reduzido em mobile para `pt-4` |

### **Impacto**

- Melhor utilização do espaço vertical em ecrãs pequenos (< 375px)
- Cards mais equilibrados visualmente
- Texto não fica tão denso
- Buttons e CTAs continuam clicáveis e acessíveis
- Mantém consistência com tipografia responsiva existente

