

# Corrigir página /guia-prompts — iframe deve ocupar toda a altura do ecrã

## Problema

O iframe tem `height="800"` fixo (800px) e o container usa `flex items-center justify-center`, o que centra verticalmente o iframe num espaço limitado. O resultado é um iframe pequeno que não aproveita o ecrã.

## Solução

Fazer o iframe ocupar **100% da viewport** (full-screen embed):

- Remover `items-center justify-center` e `px-4 py-6` do container
- Usar `flex flex-col` com `h-screen` no container
- Substituir `height="800"` por `className="flex-1 w-full"` para o iframe crescer e ocupar todo o espaço
- Remover `maxWidth: "1200px"` para o conteúdo preencher a largura total
- Manter `border: none` e `borderRadius` apenas nos cantos superiores

### Ficheiro alterado

| Ficheiro | Alteração |
|----------|-----------|
| `src/pages/GuiaPrompts.tsx` | Container full-screen, iframe flex-1 sem altura fixa |

