
# Redesign da seccao "QUEM APRESENTA"

## Resumo

Substituir completamente o conteudo e layout do `PresenterSection.tsx` por um design de duas colunas (foto a esquerda, texto a direita) com badge sobreposto na foto, credenciais em grid 2x2, e barra de estatisticas.

## Ficheiro a editar

`src/components/landing/PresenterSection.tsx` — reescrita completa do componente.

## Estrutura do novo layout

### Seccao container
- Background: `bg-white`, `border-t border-border` (sem border-bottom)
- Padding: `py-14 md:py-20`, `px-4`
- Max-width: `max-w-[960px]`, centrado

### Grid principal
- Desktop (>=768px): 2 colunas — foto 380px fixa, texto flex-grow, gap 64px, alinhamento vertical centrado
- Mobile: stack vertical, gap 36px

### Coluna esquerda — Foto
- Container: `w-full md:w-[380px]`, `rounded-[20px]`, `overflow-hidden`, `relative`
- Imagem: usa o `fredericoImg` existente, `object-cover`, `object-position: center top`, altura 460px desktop / 320px mobile
- Badge sobreposto (absolute, bottom-5, left-5):
  - Fundo semi-transparente branco com backdrop-blur
  - Linha 1: "5,0 . 1 194 avaliacoes no Google" (Montserrat 700, 13px)
  - Linha 2: "Frederico Carvalho . DIGITALFC" (Inter 400, 12px, ink-500)

### Coluna direita — Texto
- Label: "QUEM APRESENTA" — Montserrat 600, 11px, blue-600, uppercase, tracking 0.1em, mb-2
- H2: "Frederico Carvalho" — Montserrat 800, 32px desktop / 26px mobile, ink-900, mb-1
- Tagline: "29 anos a implementar..." — Inter 500, 17px, ink-500, line-height 1.5, mb-7
- Divider: 1px solid border, mb-7
- Grid credenciais: 2x2 desktop / 1 col mobile, gap 12px, mb-7
  - Cada card: bg off-white, border, rounded-[10px], p-14px, flex horizontal, gap 10px
  - Card 1: Professor Universitario — "FEUC . Univ. Europeia . Univ. Autonoma . IPAM"
  - Card 2: Autor — "Marketing Digital para Empresas . Guia Essencial SEO"
  - Card 3: Host Semanal . RFM — "Podcast Marketing por Idiotas"
  - Card 4: Fundador e CEO — "DIGITALFC . 700+ empresas . L'Oreal . BMW . 3M"
- Stat bar: bg blue-50, border blue-100, rounded-xl, p-16px, flex justify-between
  - 3 stats: "700+ empresas", "29 anos de experiencia", "1 194 avaliacoes 5 estrelas Google"
  - Separadores verticais entre stats (1px solid blue-100, h-32px)

## Detalhes tecnicos

- Continua a usar `ScrollReveal` para animacoes
- Continua a importar `fredericoImg` do assets existente
- Dados das credenciais actualizados conforme especificacao (titulos e subtitulos ligeiramente diferentes do actual)
- Nenhuma outra seccao ou ficheiro e alterado
- Sem dependencias novas
