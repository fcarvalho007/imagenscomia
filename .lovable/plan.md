

## Atualizar bloco de convites com livro Guia Essencial SEO

### Alteracoes

#### 1. Adicionar imagem do livro ao projeto

Copiar a imagem carregada pelo utilizador para `src/assets/guia-essencial-seo.png`.

#### 2. Atualizar bloco amarelo no VariantFree

**Ficheiro:** `src/components/upgrade/StepConfirmation.tsx` (linhas 50-65)

Substituir o conteudo atual do bloco amarelo:

| Elemento | Antes | Depois |
|---|---|---|
| Titulo | "Convida 2 amigos — ganhas acesso ao Q&A Bonus de 25 Fev" | "Convida 2 amigos — ganhas o livro Guia Essencial SEO" |
| Descricao | "Partilha o teu link. Quando 2 amigos se inscreverem, entras gratuitamente na sessao extra de Q&A." | "O guia indispensavel para qualquer pessoa que deseje dominar as estrategias de otimizacao para motores de pesquisa e maximizar a visibilidade online." |
| Imagem | Nenhuma | Mockup do livro a esquerda do texto (~120px altura) |

O layout do bloco passara a ter duas colunas dentro do card amarelo:
- Esquerda: imagem do livro (compacta, max 120px altura)
- Direita: titulo e descricao

O botao "Copiar o meu link de convite" mantem-se em baixo, ocupando toda a largura.

### Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/assets/guia-essencial-seo.png` | Imagem do livro adicionada ao projeto |
| `src/components/upgrade/StepConfirmation.tsx` | Texto, imagem e layout do bloco de convites atualizado |

