
# Caixa de Lixo no CRM + Ajustes no Hero da Homepage

## 1. CRM — Caixa de Lixo (eliminar fichas)

### Alteracoes

**`src/hooks/useInscritos.ts`**
- Adicionar funcao `deleteInscrito(id)` que remove permanentemente o inscrito do array

**`src/pages/CRM.tsx`**
- Adicionar nova vista `"lixo"` ao tipo `CRMView`
- Passar `deleteInscrito` como prop para as vistas relevantes
- Criar componente de vista de Lixo (inscritos arquivados com opcao de eliminar definitivamente)

**`src/components/crm/CRMSidebar.tsx`**
- Adicionar `"lixo"` ao tipo `CRMView`
- Adicionar item de navegacao "Lixo" com icone `Trash2` na sidebar

**`src/components/crm/TrashView.tsx`** (novo ficheiro)
- Lista inscritos com `status === "arquivado"`
- Cada linha tem botao "Eliminar definitivamente" com confirmacao
- Botao bulk "Eliminar seleccionados" na barra flutuante
- Design consistente com a TableView existente

**`src/components/crm/InscritoModal.tsx`**
- Adicionar botao "Eliminar" (vermelho) nas accoes, ao lado do "Arquivar"

**`src/components/crm/TableView.tsx`**
- Adicionar botao "Eliminar" na barra de accoes em massa (bulk action bar)

### Fluxo
1. O utilizador arquiva um inscrito (ja funciona)
2. O inscrito aparece na vista "Lixo"
3. Na vista Lixo, pode eliminar definitivamente (com confirmacao)
4. Tambem pode eliminar directamente da ficha ou da seleccao em massa na tabela

---

## 2. Homepage Hero — Mover badge Google e aumentar botao

### Alteracoes em `src/components/landing/HeroSection.tsx`

- **Remover** o bloco `ScrollReveal delay={0.28}` (badge Google com 5,0 estrelas) de cima do video
- **Mover** esse badge para **depois** do texto "Sem spam. Dados protegidos..." (abaixo do botao CTA)
- **Aumentar o botao**: de `max-w-[320px] text-base py-4` para `max-w-[380px] text-lg py-5`

### Resultado
A ordem no hero passa a ser:
1. Titulo + subtitulo
2. Tagline azul
3. Descricao
4. 4 cards informativos
5. Video placeholder
6. Botao "Inscrever-me gratis" (maior)
7. Texto RGPD
8. Badge Google Reviews

---

## Ficheiros a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/HeroSection.tsx` | Mover badge Google para baixo do CTA, aumentar botao |
| `src/hooks/useInscritos.ts` | Adicionar `deleteInscrito` |
| `src/pages/CRM.tsx` | Adicionar vista "lixo", passar `deleteInscrito` |
| `src/components/crm/CRMSidebar.tsx` | Adicionar item "Lixo" na navegacao |
| `src/components/crm/TrashView.tsx` | Novo ficheiro — vista de lixo com eliminacao definitiva |
| `src/components/crm/TableView.tsx` | Adicionar "Eliminar" na barra de accoes em massa |
| `src/components/crm/InscritoModal.tsx` | Adicionar botao "Eliminar" nas accoes |
