
## Trocar imagem de fundo do Hero Section

### Problema
A imagem de fundo atual (`hero-bg.jpeg`) precisa ser substituída pela nova imagem que o utilizador enviou, que tem um estilo futurista com neon e efeitos 3D.

### Solução
Copiar a nova imagem para `src/assets/hero-bg.jpeg`, substituindo a imagem existente. O componente `HeroSection.tsx` já está configurado para importar e usar esta imagem, portanto não será necessário alterar nenhum código.

### Implementação
1. Copiar a imagem do utilizador (`hf_20260212_112543_a1d2d603-1f2d-4250-b166-b8e28d2613cf-2.jpeg`) para `src/assets/hero-bg.jpeg`
2. A imagem será automaticamente utilizada no Hero Section com a mesma opacidade (50%) e overlay radial existentes

### Resultado esperado
- Hero section terá a nova imagem de fundo com o estilo futurista neon
- O overlay branco radial continuará a garantir legibilidade do H1 e subtítulo
- Nenhuma alteração de código necessária

