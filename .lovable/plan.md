
## Refinamento do Overlay do Hero — Mais Branco no Centro

### Problema
O overlay radial atual (linha 29) tem uma intensidade central de `0.70`, mas o utilizador quer **mais branco/claridade no meio** para melhor legibilidade e contraste com o fundo da imagem.

### Solução
Implementar um overlay radial mais intenso no centro, mantendo as bordas suaves:

**Ficheiro:** `src/components/landing/HeroSection.tsx` (linha 29)

Alterar o `radial-gradient` para:
- **Centro (25%)**: `rgba(255,255,255,0.85)` (aumentar de 0.70 para 0.85)
- **Meio (55%)**: `rgba(255,255,255,0.50)` (aumentar de 0.35 para 0.50)
- **Bordas (100%)**: `rgba(255,255,255,0.15)` (manter ou ligeiramente aumentar de 0.10)

Isto cria um efeito de "vinheta invertida" — o centro fica significativamente mais branco/claro, garantindo que o texto (H1, subtítulo e caixas) se destaca bem contra qualquer parte da imagem de fundo, enquanto as bordas mantêm a suavidade visual.

### Resultado
- Texto principal com **maior contraste** e legibilidade
- Imagem de fundo **ainda visível**, mas com foco centralizado no conteúdo
- Visual **elegante e equilibrado**, sem parecer excessivamente "blown out"

### Ficheiro a editar
| Ficheiro | Linha | Alteração |
|---|---|---|
| `src/components/landing/HeroSection.tsx` | 29 | Aumentar opacidade radial: centro `0.85`, meio `0.50`, bordas `0.15` |

