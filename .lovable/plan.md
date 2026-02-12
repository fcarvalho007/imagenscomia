

## Refinamentos do Hero da Homepage

### Problemas identificados

1. **Caixa "ONLINE & AO VIVO / 18 Fev."** - mal formatada, demasiado estreita comparada com as outras 3 caixas
2. **Imagem de fundo** - demasiado tapada pelo overlay branco (opacidade 0.48 + gradiente forte)
3. **Texto do titulo** - sem contorno, perde-se contra o fundo claro

### Alteracoes propostas

**Ficheiro:** `src/components/landing/HeroSection.tsx`

#### 1. Caixas de informacao — uniformizar layout

Todas as 4 caixas passam a ter o mesmo formato de duas linhas (titulo bold + subtexto), para ficarem visualmente consistentes e mais largas:

| Caixa | Linha 1 (bold) | Linha 2 |
|---|---|---|
| Data | ONLINE & AO VIVO | 18 de Fevereiro |
| Hora | HORARIO | 10h00 (Portugal) |
| Duracao | DURACAO | 60 minutos |
| Preco | INVESTIMENTO | Gratuito |

Aumentar `max-w` do grid de `680px` para `720px` para dar mais respiracao.

#### 2. Imagem de fundo — mais visivel

- Aumentar opacidade da imagem de `0.48` para `0.60`
- Reduzir a intensidade do overlay radial central: o branco no centro passa de `0.85` para `0.70`, mantendo as bordas mais suaves
- Manter o gradiente top/bottom mas reduzir de `white/80` para `white/60`

#### 3. Texto com contorno subtil (text-shadow)

Adicionar um `text-shadow` branco subtil ao titulo H1 e subtitulo para garantir legibilidade sem perder elegancia:
- H1: `0 1px 8px rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.7)`
- Subtitulo azul: `0 1px 6px rgba(255,255,255,0.8)`

Isto cria um "halo" branco fino a volta das letras, sem parecer um stroke grosseiro.

### Resumo tecnico

| Alteracao | Detalhe |
|---|---|
| Opacidade bg | `opacity-[0.48]` -> `opacity-[0.60]` |
| Overlay radial | Centro `0.85` -> `0.70` |
| Gradiente top/bottom | `white/80` -> `white/60` |
| Text-shadow H1 | Halo branco subtil |
| Text-shadow subtitulo | Halo branco subtil |
| Grid info boxes | Todas com formato 2 linhas, max-w `720px` |

Apenas um ficheiro sera editado: `src/components/landing/HeroSection.tsx`

