

## Adicionar pagina de Termos e Condicoes e atualizar links

### O que muda

1. **Nova pagina `/termos`** com o texto completo dos Termos e Condicoes formatado em HTML/componente React, com estilo consistente com o site (fundo escuro, tipografia existente).

2. **Atualizar todos os links "Termos"** para apontar para `/termos`:
   - Footer da landing page (`FooterSection.tsx`): `href="#"` -> `href="/termos"`
   - Footer do webinar (`WebinarFooter.tsx`): `href="#"` -> `href="/termos"`
   - Modal de registo (`RegistrationModal.tsx`): `href="#"` -> `href="/termos"`

3. **Nova rota** em `App.tsx`: adicionar `<Route path="/termos" element={<Termos />} />`

### Ficheiros

| Ficheiro | Alteracao |
|---|---|
| `src/pages/Termos.tsx` | **Novo** - Pagina com o texto completo dos T&C formatado com headings, paragrafos e listas |
| `src/App.tsx` | Adicionar rota `/termos` |
| `src/components/landing/FooterSection.tsx` | Link "Termos" aponta para `/termos` |
| `src/components/webinar/WebinarFooter.tsx` | Link "Termos" aponta para `/termos` |
| `src/components/landing/RegistrationModal.tsx` | Link "Termos e Condicoes" aponta para `/termos` (abre em novo separador com `target="_blank"`) |

### Detalhes da pagina Termos

- Fundo escuro (`bg-[#060D1A]`) consistente com o resto do site
- Texto branco com opacidade para hierarquia visual
- Cada seccao (1 a 12) como heading + paragrafos
- Link no topo para voltar a pagina principal
- Responsivo e com scroll confortavel
