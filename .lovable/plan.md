

## Redesign da seccao "Quem Apresenta"

### Alteracoes

**1. Texto — correcao de copy**
- Substituir "20 anos a implementar marketing digital e IA em empresas portuguesas" por "20 anos na area do marketing digital em empresas"

**2. Nova imagem de fundo**
- Guardar a imagem carregada como `src/assets/presenter-bg.png`
- Remover a foto standalone de Frederico (coluna esquerda com `fredericoImg`)
- Usar a nova imagem como **fundo da seccao inteira** (a personagem ja esta na imagem, do lado direito)

**3. Novo layout — conteudo a esquerda, personagem a direita (via fundo)**
- A seccao passa a ter `position: relative` e `overflow: hidden`
- A imagem de fundo cobre toda a area com `object-cover`, posicionada a direita (`object-right`) para que a personagem fique visivel no lado direito
- O conteudo (titulo, subtitulo, credenciais, badge) fica alinhado a esquerda
- Em mobile, a imagem fica como fundo com overlay mais forte para garantir legibilidade

**4. Adaptacao visual**
- Fundo escuro da imagem implica texto em branco/claro:
  - Titulo e nomes: `text-white`
  - Subtitulo: `text-white/80`
  - Cards de credenciais: fundo semi-transparente escuro (`bg-white/10 backdrop-blur`) com texto branco
  - Badge de avaliacoes Google: manter fundo branco com blur
- Kicker "QUEM APRESENTA": manter azul claro para contraste
- Remover `border-t border-border` (nao faz sentido com fundo escuro)
- Em mobile: overlay mais opaco para garantir leitura; em desktop: overlay parcial (esquerda mais opaco, direita mais transparente para mostrar a personagem)

**5. Responsividade**
- Desktop: layout full-width com conteudo na metade esquerda, personagem visivel na direita via fundo
- Mobile: imagem de fundo com overlay forte, conteudo centrado por cima

### Detalhes tecnicos

| Ficheiro | Alteracao |
|---|---|
| `src/assets/presenter-bg.png` | Nova imagem (copia do upload) |
| `src/components/landing/PresenterSection.tsx` | Redesign completo: fundo com imagem, layout esquerda, texto claro, remover foto standalone |

### Estrutura do componente (desktop)

```text
<section relative overflow-hidden min-h-[500px]>
  <img absolute inset-0 w-full h-full object-cover object-right>  (imagem de fundo)
  <div absolute inset-0 gradient left-opaque right-transparent>   (overlay)
  <div relative z-10 max-w-[960px] mx-auto>
    <div max-w-[520px]>  (conteudo alinhado a esquerda)
      QUEM APRESENTA (kicker)
      Frederico Carvalho (h2 branco)
      20 anos na area... (subtitulo)
      [credenciais grid 1 coluna ou 2 colunas]
      [badge Google]
    </div>
  </div>
</section>
```

### Resultado esperado

A seccao ganha um visual cinematico e impactante com a imagem futurista do portal como fundo. A personagem (Frederico) fica visivel no lado direito da imagem, enquanto o conteudo textual e as credenciais se posicionam na esquerda com boa legibilidade sobre um overlay gradiente.

