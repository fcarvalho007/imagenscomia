

# Recuperar layout original do Hero + Logo marquee completo

## Resumo

Reverter o hero para o layout centrado de coluna unica (como na imagem de referencia) e restaurar a faixa de logos completa com animacao marquee. Manter o texto actual da pagina.

---

## Ficheiro: `src/pages/Gravacao.tsx`

### A) Hero — voltar ao layout centrado (1 coluna)

Substituir o grid de 2 colunas (`grid md:grid-cols-[1fr_380px]`) pelo layout centrado original:

- Container: `maxWidth: 860`, `textAlign: "center"` (como o HeroSection original)
- Badge: apenas **"ACESSO IMEDIATO"** (remover " · PACK COMPLETO · 27 €")
- H1: centrado, texto actual mantido
- Subheadline: centrada com GradientText
- "Ve hoje. Aplica amanha." centrado
- CTA verde com ElectricBorder centrado (maxWidth 400, como original)
- GoogleBadge dark centrado abaixo do CTA
- Remover o purchase card da coluna direita (preco, trust microcopy com icones)
- Remover os 3 micro-bullets (Check items)
- Remover o link "Ver exactamente o que esta incluido"

### B) Logo strip — restaurar marquee completo (8 logos)

Substituir a strip estatica de 2 logos pela marquee animada original com todos os 8 logos:

- Importar todos os logos: google, chatgpt, claude, freepik, bytedance, gemini, llama-meta, runcomfy
- Titulo: "PLATAFORMAS A CONSIDERAR" (como na imagem)
- Animacao marquee infinita (30s linear), logos duplicados para loop continuo
- Mascara de gradiente lateral para fade in/out
- Fundo escuro (#060D1A) com logos monocromaticos (filter brightness(0) invert(1), opacity 0.5)

### Imports a adicionar

- `claudeLogo`, `freepikLogo`, `bytedanceLogo`, `geminiLogo`, `llamaLogo`, `runcomfyLogo` de `@/assets/logos/`

### O que NAO muda

- Todo o restante da pagina (seccoes 3-11) permanece igual
- Texto do H1, subheadline, etc. mantem-se
- Modal de registo inalterado
- Logica de compra inalterada

