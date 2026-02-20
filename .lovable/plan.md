

# Upgrade visual da seccao "O video nao e luxo"

## Resumo

Tornar a seccao mais cinematografica, actualizar textos para tratamento por "tu", e melhorar a hierarquia visual.

## Alteracoes em `src/pages/Video.tsx`

### 1. Titulo principal (linha 414)

Alterar de:
"O video nao e luxo -- e o formato que o mercado esta a empurrar"

Para:
"Video e o formato que o mercado exige"

Mais curto, directo, impactante. Tipografia maior (36px mobile, 48px desktop) com gradient text em "mercado exige" para destaque cinematografico.

### 2. Subtitulos (linhas 417-425)

Reescrever em tratamento por "tu":

- "O pedido e quase sempre o mesmo: precisas de mais video."
- "O bloqueio tambem: tempo, custo, aprovacoes e falta de consistencia."
- "A IA ajuda, mas so funciona quando tens um processo minimo."

Aumentar font-size para 18px e melhorar espacamento (mb-16 em vez de mb-14).

### 3. Cards — texto por "tu" (linhas 118-123)

Actualizar labels e descricoes:

- "Precisas de volume" / "O mercado pede videos com frequencia e a tua equipa nao acompanha."
- "Precisas de consistencia" / "Cada video parece de uma marca diferente."
- "Precisas de velocidade" / "Quando o clip tem de sair hoje, nao daqui a duas semanas."
- "Precisas de um metodo simples" / "Menos improviso, mais processo repetivel."

### 4. Cards — upgrade visual cinematografico

Melhorar o estilo dos `.pain-card`:

- Background: `rgba(255,255,255,0.04)` com `backdrop-filter: blur(16px)` e `border: 1px solid rgba(255,255,255,0.10)`
- Padding: `p-7` em vez de `p-6`
- Icones: cor verde (#4ade80) em vez de azul, tamanho 6 (24px)
- Label: 16px, font-weight 700, cor branca
- Descricao: 14px, `rgba(255,255,255,0.55)`
- Numero de fundo: opacidade ligeiramente maior (0.06)
- Hover: borda verde mais visivel, subtle glow verde

### 5. Overlay e video — mais cinematografico

- Reduzir opacidade do overlay de 0.55 para 0.45 para deixar o video splash mais visivel
- Adicionar gradient overlay (de baixo para cima, preto) para fade natural na base
- Video opacity de 0.5 para 0.6 para mais presenca visual

### 6. Subtitulo "Quando isto faz sentido"

- Aumentar para 22px, font-weight 600, letter-spacing -0.5px
- Adicionar uma linha decorativa verde (40px de largura) acima do texto, centrada

---

## Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

Edicoes:
1. Linhas 118-123: actualizar array `whenItMakesSense` (textos por "tu")
2. Linha 410: overlay de `rgba(0,0,0,0.55)` para gradient overlay com transparencia variavel
3. Linha 406: video opacity de 0.5 para 0.6
4. Linha 414: novo titulo
5. Linhas 416-426: novos subtitulos
6. Linha 430: subtitulo "Quando isto faz sentido" com decoracao
7. Linhas 439-448: cards com estilos melhorados
8. Linhas 454-463: CSS `.pain-card` actualizado

