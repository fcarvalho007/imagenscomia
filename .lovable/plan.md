

# Auditoria Mobile /comprar — Refinamentos

## Estado actual

A página está **bem estruturada** para mobile: cards empilham verticalmente, o Bundle aparece primeiro, CTAs são visíveis e o texto é legível. Testei em 375px (iPhone 13) e 320px (iPhone SE).

## Problemas encontrados

### 1. Badge do topo quebra em 2 linhas (320px)
O pill "🎬 Sessão Prática · Vídeo Profissional com IA" é largo demais para 320px e parte para duas linhas de forma estranha.

**Correcção**: Reduzir o texto em mobile para "🎬 Vídeo Profissional com IA" ou diminuir o padding/font-size em viewports estreitos.

### 2. Botão WhatsApp sobrepõe link do footer
O botão flutuante do WhatsApp (canto inferior direito) sobrepõe o link "Contacta-nos para upgrade com desconto" no footer, tornando-o inacessível.

**Correcção**: Adicionar `pb-20` ao container do footer para garantir espaço abaixo do último elemento.

### 3. Tag "Acesso imediato" quebra no card Sessão Prática (320px)
O título "Sessão Prática" + tag "Acesso imediato" lado a lado forçam wrap em ecrãs de 320px.

**Correcção**: Usar `flex-wrap` no container do título para que a tag desça graciosamente para uma segunda linha.

### 4. Preço €107 — tamanho excessivo em mobile
O `text-5xl` para o preço é grande em ecrãs pequenos, pode ser reduzido a `text-4xl` em mobile.

## Ficheiro a editar

### `src/pages/Comprar.tsx`
- Linha 121: Adicionar `min-w-0` ao card (remover `min-w-[220px]` que força largura desnecessária em mobile)
- Linha 138: Adicionar `flex-wrap` ao container do título+tag
- Linha 148: Usar `text-4xl md:text-5xl` no preço
- Linha 213: Ajustar padding bottom do container principal para acomodar WhatsApp (`pb-24`)
- Linha 230-232: Texto do badge mais curto ou `text-[10px]` em mobile

Alterações mínimas, impacto directo na experiência em ecrãs de 320-375px.

