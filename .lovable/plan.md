

## Barra de Logos de Credibilidade (Logo Marquee)

### Conceito

Criar uma barra horizontal com os logos das plataformas de IA abordadas no webinar, posicionada imediatamente abaixo do hero. Os logos rodam em loop infinito (marquee), criando um efeito de credibilidade profissional.

### Decisoes de design

**Cor dos logos: branco (grayscale)**
- Num fundo escuro, logos a cores competem visualmente com o conteudo principal e parecem desorganizados (cada marca tem a sua paleta)
- Logos brancos com opacidade reduzida (~50-60%) sao o padrao da industria para barras de credibilidade — transmitem profissionalismo sem distrair
- Implementacao: CSS `filter: brightness(0) invert(1)` + `opacity: 0.5`

**Titulo: sim, subtil**
- Texto curto: "Plataformas abordadas no webinar" em uppercase, 14px, cor branca com 40% opacidade
- Justificacao: da contexto sem ser intrusivo, o publico leigo precisa de perceber porque estao ali aqueles logos

**Fundo: continuidade com o hero**
- Mesmo fundo escuro do hero (`#060D1A` ou similar) com border-top subtil para separacao visual
- Cria uma transicao suave do hero para as seccoes seguintes

### Logos incluidos (8)

1. Google
2. ChatGPT (OpenAI)
3. Claude (Anthropic)
4. Freepik
5. ByteDance
6. Gemini
7. LLaMA by Meta
8. RunComfy

### Ficheiros afectados

| Ficheiro | Tipo | Alteracao |
|---|---|---|
| `src/components/landing/LogoMarquee.tsx` | Criar | Componente com animacao marquee CSS |
| `src/pages/Index.tsx` | Editar | Inserir `<LogoMarquee />` entre `<HeroSection />` e `<ChallengesSection />` |
| `src/assets/logos/` | Criar | Copiar os 8 logos para esta pasta |

### Detalhes tecnicos

#### A) Copiar logos para `src/assets/logos/`

Copiar os 8 ficheiros carregados para `src/assets/logos/` com nomes limpos:
- `google.png`
- `chatgpt.webp`
- `claude.png`
- `freepik.png`
- `bytedance.svg`
- `gemini.png`
- `llama-meta.png`
- `runcomfy.webp`

#### B) `src/components/landing/LogoMarquee.tsx`

Componente com:
- Fundo escuro (`bg-[#060D1A]`) com `border-top: 1px solid rgba(255,255,255,0.06)`
- Padding vertical: `py-8`
- Titulo: "Plataformas abordadas no webinar" centrado, 14px, uppercase, tracking-wide, `text-white/40`
- Container com `overflow: hidden` e mascara de gradiente nas laterais (fade-out)
- Duas copias da lista de logos lado a lado, animadas com `@keyframes marquee` (translateX de 0 a -50%)
- Cada logo: altura fixa ~28px, `filter: brightness(0) invert(1)`, `opacity: 0.5`, hover `opacity: 0.8` com transicao
- Velocidade: ~30 segundos para um ciclo completo
- A animacao e puramente CSS (sem JS), performante e acessivel

#### C) `src/pages/Index.tsx`

Adicionar import e inserir `<LogoMarquee />` na linha 25, entre `<HeroSection />` e `<ChallengesSection />`.

#### D) Animacao CSS (inline ou Tailwind)

Keyframes adicionados via `@keyframes` no componente (styled inline ou classe Tailwind custom):

```text
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

A lista e duplicada no DOM para que o scroll seja continuo sem saltos.

### Resultado visual esperado

```text
|  ─────────────────────────────────────────────  |
|         PLATAFORMAS ABORDADAS NO WEBINAR        |
|  [Google] [ChatGPT] [Claude] [Freepik] [Gemini] |
|  [ByteDance] [LLaMA] [RunComfy] [Google] [Ch... |
|  ─────────────────────────────────────────────  |
```

Logos brancos semi-transparentes a deslizar continuamente da direita para a esquerda sobre fundo escuro.
