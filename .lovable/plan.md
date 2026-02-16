

## Fix: ResendModal a aparecer atras da ficha de cliente (ecrã preto)

### Problema

O InscritoModal usa um overlay e card customizados com `z-[100]` e `z-[101]`. Quando o ResendModal abre, o Radix Dialog cria o seu proprio overlay via Portal com `z-50` -- que fica **por baixo** do InscritoModal. O conteudo do ResendModal tambem fica preso atras, resultando num ecra preto sem interaccao possivel.

### Solucao

Passar `z-index` elevado ao ResendModal para que o overlay e conteudo do Radix Dialog fiquem **acima** do InscritoModal (`z-[101]`).

### Ficheiro a alterar

| Ficheiro | Accao |
|----------|-------|
| `src/components/crm/modal/ResendModal.tsx` | Adicionar classes de z-index ao DialogContent e ao overlay para ficarem acima de `z-[101]` |

### Alteracao

No `ResendModal.tsx`, passar `className` ao `DialogContent` para forcar `z-[200]`, e usar `overlayClassName` (ou wrapper) para o overlay tambem ficar acima.

Na pratica, com shadcn/Radix Dialog, a forma correcta e:

1. No `DialogContent`, adicionar `className="z-[200]"`
2. O overlay do Dialog (renderizado dentro do DialogPortal pelo componente `dialog.tsx`) tambem precisa de z-index elevado

Como o componente `dialog.tsx` do shadcn ja usa `z-50` fixo no overlay e no content, a forma mais limpa e passar classes extras:

```text
<DialogContent className="max-w-md z-[200]">
```

E no componente `dialog.tsx`, o overlay tambem usa `z-50`. Como nao queremos alterar o componente global, a alternativa e:

- Envolver o Dialog num div com `style={{ position: "relative", zIndex: 200 }}` -- mas Portals ignoram isso.

A solucao mais fiavel: alterar o `DialogContent` no `ResendModal` para incluir override do overlay via prop `forceMount` ou simplesmente ajustar o z-index directamente no JSX do ResendModal, substituindo o Dialog do shadcn por elementos controlados manualmente (overlay + card) com z-index correcto -- tal como o InscritoModal ja faz.

**Decisao pratica:** Substituir o Radix Dialog no ResendModal por overlay+card manual com `z-[200]` e `z-[201]`, mantendo a mesma UI. Isto elimina o conflito de z-index dos Portals e resolve o ecra preto.

### UI melhorada do ResendModal

Ao refazer o componente, tambem melhorar:

- Animacao de entrada (fade-in + scale suave via Tailwind `animate-in`)
- Botao "Fechar" (X) no canto superior direito
- Focus trap basico (fechar com Escape)
- Contraste e legibilidade dos estados (link valido/expirado/a expirar)

### O que NAO muda

- Logica de envio (handleSend, handleRegenAndSend)
- Props interface
- ActionsSection
- InscritoModal (apenas renderiza o ResendModal, sem alteracoes)

