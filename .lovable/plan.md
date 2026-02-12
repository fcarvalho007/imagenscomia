

## Imagem de fundo na primeira dobra (Hero)

### Conceito

Usar a imagem carregada (cena futurista com portal azul e grelha de imagens) como fundo da seccao Hero. A imagem escura com tons azuis e neon encaixa bem com a identidade visual do projeto. Para garantir leitura do texto e botoes, sera aplicada uma sobreposicao (overlay) semi-transparente.

### Abordagem

**1. Guardar a imagem no projeto**
- Copiar para `src/assets/hero-bg.jpeg`
- Importar como modulo ES6 no HeroSection

**2. Aplicar como fundo da seccao Hero**
- A seccao passa a ter `position: relative` e `overflow: hidden`
- A imagem e colocada como `<img>` absoluta com `object-cover` para cobrir toda a area em qualquer dispositivo
- Opacidade reduzida (~15-20%) para nao competir com o conteudo — ou em alternativa, usar a imagem a 100% com um overlay escuro/branco por cima

**3. Overlay para legibilidade**
- Adicionar um `div` absoluto com gradiente: `bg-gradient-to-b from-white/85 via-white/80 to-white/90`
- Isto garante que o texto, cards de info, video e botao verde manteem contraste total
- A imagem fica visivel como textura subtil de fundo, criando profundidade

**4. Remover lazy loading da primeira dobra**
- O `ScrollReveal` usa `whileInView` com animacoes, o que causa um ligeiro atraso na renderizacao
- Para a primeira dobra: remover os wrappers `ScrollReveal` de todos os elementos do Hero
- Usar `motion.div` com `initial`/`animate` direto (sem `whileInView`) para que tudo apareca imediatamente ao carregar a pagina
- Isto garante que o botao verde "Inscrever-me gratis" e visivel de imediato, sem esperar pelo scroll

**5. Adaptacao a todos os dispositivos**
- `object-cover` + `w-full h-full` na imagem garante cobertura total
- `object-position: center` centra o ponto focal
- O overlay e responsivo por natureza (percentagens)

### Detalhes tecnicos

| Ficheiro | Alteracao |
|---|---|
| `src/assets/hero-bg.jpeg` | Nova imagem (copia do upload) |
| `src/components/landing/HeroSection.tsx` | Fundo com imagem + overlay, remover ScrollReveal, usar animacoes diretas |

### Estrutura do componente

```text
<section relative overflow-hidden>
  <img absolute inset-0 w-full h-full object-cover opacity-[0.15]>  (imagem de fundo)
  <div absolute inset-0 bg-gradient-to-b from-white/85 to-white/90>  (overlay)
  <div relative z-10>  (conteudo actual — texto, cards, video, botao)
    (motion.div com animate direto em vez de ScrollReveal/whileInView)
  </div>
</section>
```

### Resultado esperado

A primeira dobra ganha profundidade visual com a textura futurista azul subtilmente visivel atras do conteudo. Todo o texto e botoes mantem legibilidade total. O botao verde aparece instantaneamente sem esperar pelo scroll.

