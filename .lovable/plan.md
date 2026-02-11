

# Adicionar imagens reais a galeria de exemplos

## Resumo

Substituir os 8 placeholders (gradientes) da seccao "Imagens criadas com o metodo" pelas 8 imagens enviadas, usando `object-cover` para adaptar cada imagem ao aspect-ratio do slot.

## Mapeamento imagens → slots

| Slot | Aspect Ratio | Tag | Imagem |
|------|-------------|-----|--------|
| 01 | 4/5 | Post Instagram | `6_frederico_carvalho_porto_ribeirinha.jpeg` |
| 02 | 16/9 | LinkedIn Banner | `1_frederico_carvalho_escritorio_1.jpeg` |
| 03 | 1/1 | Imagem de Produto | `3_frederico_carvalho_serum_exemplo.jpeg` |
| 04 | 9/16 | Story Instagram | `8_frederico_carvalho_bolsa_mulher.png` |
| 05 | 4/3 | Anuncio Facebook | `2_frederico_carvalho_na_cama_1.png` |
| 06 | 3/2 | E-commerce | `7_frederico_carvalho_sapatos.jpeg` |
| 07 | 1/1 | Branding | `5_frederico_carvalho_cappucino_background.jpeg` |
| 08 | 2/3 | Newsletter Header | `4_frederico_carvalho_caricatura.jpeg` |

## Alteracoes

### 1. Copiar imagens para `src/assets/galeria/`

Copiar as 8 imagens para a pasta `src/assets/galeria/` para que possam ser importadas como modulos ES6 (melhor bundling e optimizacao automatica pelo Vite).

### 2. Editar `src/components/landing/GallerySection.tsx`

- Adicionar imports das 8 imagens
- Adicionar campo `image` ao array `slots` com a referencia importada
- Substituir o `div` placeholder (com gradiente e emoji) por um `<img>` com:
  - `src={slot.image}`
  - `alt` descritivo baseado na tag
  - `loading="lazy"` para performance
  - `className="w-full h-full object-cover"`
  - O aspect-ratio continua definido no container pai
- Manter toda a restante estrutura: hover overlay, tags, data-attributes, ScrollReveal

### Optimizacao de performance

- Todas as imagens usam `loading="lazy"` (estao abaixo da dobra)
- O Vite faz optimizacao automatica de assets importados de `src/assets/`
- O `object-cover` garante que cada imagem preenche o seu slot sem distorcao, cortando apenas o excesso

