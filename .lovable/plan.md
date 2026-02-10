

# Refinamentos Visuais + Copy + Modal

---

## 1. Imagens -- Avaliacao e Uso

Das 4 imagens fornecidas, recomendo usar apenas **1**:

- **Abstract particles** (abstract_particle_sci-fi_background_blue): Ideal como fundo da CTAFinalSection (ja tem fundo escuro ink-900). E subtil, nao compete com o texto e reforça a estetica tech/IA. Aplicado com `background-image`, `cover`, e um overlay escuro semi-transparente para manter legibilidade.

As restantes 3 nao sao recomendadas:
- Tron grid tunnel: Demasiado agressivo/intenso, distrai do copy
- Cosmic nebula: Demasiado organico/abstracto, nao encaixa no estilo editorial clean
- Blue planet: Demasiado sci-fi, fora do tom empresarial

**Ficheiros:** Copiar a imagem de particulas para `src/assets/`, importar em `CTAFinalSection.tsx` como background.

---

## 2. HeroSection.tsx -- Remocoes

Remover:
- O bloco `<ul>` com os 3 micro-bullets (linhas 36-47): "3 modelos de imagem...", "Metodo de briefing...", "Checklist..."
- O bloco social proof (linhas 113-124): "127 lugares ja reservados..."

Manter tudo o resto (headline, tagline, meta row, video placeholder, CTAs, trust line).

---

## 3. ChallengesSection.tsx -- Remover 2 desafios

Remover do array `challenges`:
- `{ num: "01", title: "O designer demora dias e custa caro" }`
- `{ num: "02", title: "Tentaste IA mas os resultados foram inuteis" }`

Renumerar os restantes 4 desafios para 01-04. Tambem neutralizar a linguagem "tu/teu" nos titulos restantes:
- "O stock fotografico parece de qualquer empresa"
- "Sem consistencia visual entre publicacoes"
- "Dificil saber qual ferramenta usar para que"
- "Mais volume sem aumentar equipa"

---

## 4. RegistrationModal.tsx -- Capture View

Remover a linha "Demora menos de 30 segundos." (linha 195).

---

## 5. RegistrationModal.tsx -- Upsell View (voltar ao estilo "a vermelho")

Actualmente os 3 extras premium aparecem com checks verdes e fundo neutro. Mudar para estilo de "perda" visual:
- Icone: `MinusCircle` ou `X` a vermelho (text-red-500)
- Texto: com estilo de alerta (text-red-700 ou text-ink-700 com icone vermelho)
- Fundo dos items: `bg-red-50 border border-red-100`
- Manter o texto introdutorio "Na participacao gratuita, estes extras nao estao incluidos:"

Isto cria o efeito visual de "perda" que incentiva o upgrade, como estava antes.

---

## 6. CTAFinalSection.tsx -- Background com imagem

Adicionar a imagem de particulas abstractas como background:
- Import da imagem de `@/assets/`
- `style={{ backgroundImage }}` com `cover` e `center`
- Overlay: `bg-ink-900/85` por cima para manter legibilidade do texto branco
- Sem outras alteracoes de copy

---

## Resumo de ficheiros

| Ficheiro | Alteracao |
|----------|-----------|
| `src/assets/particles-bg.jpg` | Copiar imagem de particulas |
| `src/components/landing/HeroSection.tsx` | Remover micro-bullets e social proof |
| `src/components/landing/ChallengesSection.tsx` | Remover 2 desafios, renumerar, neutralizar linguagem |
| `src/components/landing/RegistrationModal.tsx` | Remover subtitulo capture + mudar upsell extras para estilo vermelho |
| `src/components/landing/CTAFinalSection.tsx` | Adicionar background image com overlay |

Nenhuma dependencia nova. Nenhum ficheiro novo alem da copia da imagem.

