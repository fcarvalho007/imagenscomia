

# Refinamentos Mobile — /recursos-video

## Avaliação

A página está bem construída e já responsiva. Identifico refinamentos menores:

### Média prioridade

1. **Índice da sessão — padding interno excessivo em 375px** — Cada chapter card tem `p-4` e o container `p-5`. Em mobile, o padding acumulado consome espaço útil. Reduzir para `p-3 sm:p-4` nos cards e `p-4 sm:p-5` no container.

2. **Sidebar recursos — links sem touch target suficiente** — Os resource links têm `p-3` (48px total com ícone), que é adequado, mas a área de toque pode ser melhorada com `min-h-[48px]` para garantir conformidade WCAG.

3. **Sidebar em mobile ocupa full-width sem grid de 2 colunas** — Em mobile (< lg), os 4 resource cards empilham verticalmente. Num viewport 375px está OK, mas entre 500-767px poderiam ser 2 colunas para aproveitar o espaço.

### Baixa prioridade

4. **Login card padding** — O card de login tem `p-8` fixo. Em 375px, reduzir para `p-6 sm:p-8` daria mais respiro lateral.

5. **Chapter descriptions truncam longas** — As descrições são extensas. Em mobile, o texto é legível mas denso. Não requer alteração — o `leading-relaxed` já ajuda.

6. **Acessibilidade — iframe sem `loading="lazy"`** — O Vimeo iframe podia ter `loading="lazy"` para melhorar LCP quando o utilizador faz scroll.

## Plano de implementação

| # | Ficheiro | Alteração |
|---|---|---|
| 1 | `RecursosVideoConteudo.tsx` | Chapter cards: `p-3 sm:p-4`; container: `p-4 sm:p-5` |
| 2 | `RecursosVideoConteudo.tsx` | Resource links na sidebar: grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-1` para 2 colunas em tablets |
| 3 | `RecursosVideoConteudo.tsx` | Vimeo iframe: adicionar `loading="lazy"` |
| 4 | `RecursosVideoLogin.tsx` | Card padding: `p-6 sm:p-8` |

Todas as alterações são CSS/atributos — sem mudanças de lógica.

