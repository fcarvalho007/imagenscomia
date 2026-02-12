

## Refinamento Mobile da Pagina /upgrade

### Problemas identificados

1. **Botao "Proximo passo" fica fora do viewport** em telefones pequenos porque o conteudo empurra-o para baixo e nao ha padding bottom suficiente
2. **Links secundarios ("Saltar esta pergunta")** nao tem separacao visual clara - precisam de linha separadora e cor mais escura
3. **Passo 3 (Premium) e Passo 4 (Masterclass)**: o card com price row e early bird badge lado a lado fica apertado em mobile - o badge corta texto (visivel no screenshot)
4. **Fontes e textos longos em mobile** precisam de ajuste

### Alteracoes por ficheiro

#### A) `src/pages/Upsell.tsx`
- Aumentar `pb-10` para `pb-24` em mobile (garantir espaco para o botao ficar visivel)
- Reduzir `mb-8` da progress bar para `mb-5` em mobile para ganhar espaco vertical

#### B) `src/components/upgrade/StepQualification.tsx`
- Adicionar separador (linha `h-px bg-border`) antes do bloco "Saltar esta pergunta"
- Mudar cor do "Saltar" de `text-ink-300` para `text-ink-500` (cinzento escuro)
- Reduzir titulo de `text-[24px]` para `text-[20px]` em mobile (`max-sm:text-[20px]`)
- Reduzir subtitulo de `text-[17px]` para `text-[15px]` em mobile

#### C) `src/components/upgrade/StepPersonalization.tsx`
- Mesmo padrao: separador + cor mais escura no "Saltar"
- Reduzir titulo para `text-[20px]` em mobile
- Reduzir subtitulo para `text-[15px]` em mobile

#### D) `src/components/upgrade/StepPremium.tsx`
- **Price row em mobile**: mudar de `flex` horizontal para stack vertical (`flex-col` em `max-sm`) - o badge early bird vai para baixo do preco em vez de ficar ao lado
- Reduzir titulo de `text-[24px]` para `text-[20px]` em mobile
- Reduzir preco de `text-[36px]` para `text-[28px]` em mobile
- Separador + cor escura no "Continuar sem..."
- Reduzir padding do card de `p-6` para `p-4` em mobile

#### E) `src/components/upgrade/StepMasterclass.tsx`
- Mesmas correcoes: price row em stack vertical em mobile
- Separador + cor escura no skip link
- Reduzir titulo, preco e padding em mobile
- Texto do subtitulo mais curto em mobile (truncar ou reduzir font)

#### F) `src/components/upgrade/StepConfirmation.tsx`
- Reduzir titulo de `text-[24px]` para `text-[20px]` em mobile
- Garantir padding bottom suficiente

### Detalhes tecnicos

Todas as alteracoes usam classes Tailwind responsivas (`max-sm:` para < 640px):

```
// Exemplo de titulo responsivo
className="font-heading font-bold text-[24px] max-sm:text-[20px] text-ink-900"

// Exemplo de price row stack em mobile
className="flex max-sm:flex-col justify-between items-start mb-4 gap-3"

// Exemplo de separador + skip link
<div className="w-full h-px bg-border mt-6 mb-3" />
<p className="text-[13px] text-ink-500 cursor-pointer text-center ...">
  Saltar esta pergunta
</p>
```

| Ficheiro | Alteracoes |
|---|---|
| `src/pages/Upsell.tsx` | Padding bottom mobile, progress bar spacing |
| `src/components/upgrade/StepQualification.tsx` | Fontes mobile, separador + cor skip link |
| `src/components/upgrade/StepPersonalization.tsx` | Fontes mobile, separador + cor skip link |
| `src/components/upgrade/StepPremium.tsx` | Price row stack mobile, fontes, separador, padding |
| `src/components/upgrade/StepMasterclass.tsx` | Price row stack mobile, fontes, separador, padding |
| `src/components/upgrade/StepConfirmation.tsx` | Fontes mobile |

