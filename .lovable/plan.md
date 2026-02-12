

## Corrigir imagem do livro no Passo 5

### Problema

A imagem do livro "Guia Essencial SEO" nao aparece porque o ficheiro `guia-essencial-seo.png` nao existe no projeto. O codigo referencia `/guia-essencial-seo.png` mas a pasta `public/` nao contem esse ficheiro.

### Solucao

**Preciso que me envie a imagem do livro no chat** para a poder adicionar ao projeto.

Assim que tiver a imagem:

1. **Adicionar a imagem** a `public/guia-essencial-seo.png`
2. **Verificar** que o `src` no componente aponta correctamente para `/guia-essencial-seo.png` (ja esta correcto no codigo)

### Alternativa (se nao tiver a imagem agora)

Posso temporariamente remover o bloco da imagem e manter apenas o texto, ate ter a imagem disponivel.

### Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `public/guia-essencial-seo.png` | Adicionar imagem do livro (necessario upload pelo utilizador) |

