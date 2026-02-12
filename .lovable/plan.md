

## Substituir foto do apresentador

### O que muda

A foto actual do Frederico Carvalho (`src/assets/frederico-carvalho.jpg`) sera substituida pela nova imagem profissional carregada.

### Contexto de utilizacao

A imagem e usada na seccao "Quem Apresenta" (`PresenterSection.tsx`) com as seguintes dimensoes CSS:
- Mobile: `320px` de altura
- Desktop: `460px` de altura
- `object-cover` com `object-top` (foco na parte superior — rosto)

A nova foto tem enquadramento semelhante (retrato, fundo neutro, polo escuro), pelo que o `object-top` continua adequado. Nao sao necessarias alteracoes de CSS.

### Alteracoes tecnicas

| Ficheiro | Alteracao |
|---|---|
| `src/assets/frederico-carvalho.jpg` | Substituir pela nova imagem carregada |

Nenhuma alteracao de codigo e necessaria — o import existente (`import fredericoImg from "@/assets/frederico-carvalho.jpg"`) aponta para o mesmo ficheiro e o Vite optimiza automaticamente a imagem no build.

