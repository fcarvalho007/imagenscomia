

# Melhoria UX/UI da Ficha de Cliente (InscritoModal)

## Problema
No desktop, o painel esquerdo (escuro) tem conteudo que ultrapassa a area visivel -- os botoes de "Accoes" ficam cortados no fundo. O utilizador nao quer scrolls e quer tudo visivel de forma clara.

## Solucao

### Ficheiro: `src/components/crm/InscritoModal.tsx`

**1. Aumentar a area util do modal**
- `maxHeight`: de `90vh` para `95vh`

**2. Compactar o painel esquerdo para caber sem scroll**
- Avatar: reduzir de `w-16 h-16` para `w-14 h-14`
- Reduzir margens entre seccoes (`my-5` para `my-3`)
- Linhas conectoras do progresso: de `h-3` para `h-2`
- Botoes de accoes: reduzir padding vertical (`py-2` para `py-1.5`) e tamanho de texto
- Remover o botao duplicado "Enviar WhatsApp" nas accoes (ja existe o botao verde principal com o numero)
- Compactar o bloco do WhatsApp principal (reduzir margens)

**3. Garantir que o painel esquerdo nao precisa de scroll**
- Com as reducoes de espaco acima, todo o conteudo (avatar, info, progresso, accoes) cabe nos ~95vh sem overflow
- Manter `overflow-y-auto` como fallback de seguranca, mas o conteudo deve caber naturalmente

### Resultado esperado
- Todo o conteudo do painel esquerdo visivel sem scroll
- Botoes de accoes completamente visiveis
- Layout mais compacto mas igualmente legivel

