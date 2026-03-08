

# Actualização /comprar — Modo Pós-Masterclass

## Abordagem

Usar **Opção A** — flag `POST_MASTERCLASS_MODE = true` no topo do ficheiro (activada de imediato, pois a data é 8 de Março e o utilizador quer que esteja pronta; a Masterclass é dia 12, mas o brief diz "activação 13 de Março" — implemento a flag como `false` para o utilizador ligar manualmente no dia 13).

## Alterações em `src/pages/Comprar.tsx`

### Flag no topo
```ts
const POST_MASTERCLASS_MODE = false; // Alterar para true após 13 de Março
```

### Dados dos planos — condicional via flag

**Card gravacao (€27)**:
- Remover o item `"Sessão Q&A ao vivo — 10 de Março, 14h30"` quando flag = true

**Card masterclass (€67)**:
- `subPriceNote`: `"Gravação completa da Masterclass ao vivo — 3 horas."`
- `showMasterclassDate`: `false`
- Primeiro benefit: `"Gravação completa 3h — acesso imediato"` (em vez de "3 horas ao vivo com o Frederico")

**Card bundle (€107)**:
- `showMasterclassDate`: `false`
- `highlightBenefitIndex`: remover (nenhum item destacado)
- Benefit index 3: `"Masterclass Vídeo com IA (gravação 3h)"` (em vez de "3 horas ao vivo — Masterclass completa")
- Adicionar nova secção exclusiva antes do CTA (novo campo `exclusiveSection?: boolean` ou renderizar inline)

### Nova secção "✦ Exclusivo Pack IA Completo"

No `PlanCard`, após a `<ul>` de benefits e antes do botão CTA, renderizar condicionalmente para o bundle quando `POST_MASTERCLASS_MODE = true`:

```
<Separator />
<div className="bg-violet-50/60 border border-violet-200/60 rounded-lg px-4 py-3">
  <p className="text-xs font-bold text-violet-700 flex items-center gap-1.5">
    ✦ Exclusivo Pack IA Completo
  </p>
  <p className="text-xs text-violet-600/80 mt-1">
    Acesso antecipado garantido ao próximo evento com preço early bird.
  </p>
</div>
```

### Limpeza
- Remover `MasterclassDateBox` component (não é mais necessário quando flag = true; manter para flag = false)
- Manter `MASTERCLASS_CUTOFF` apenas para o modo pre-masterclass

## Ficheiro único alterado
`src/pages/Comprar.tsx` — apenas conteúdo textual condicional via flag, sem alteração de layout ou preços.

