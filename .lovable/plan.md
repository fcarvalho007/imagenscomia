

## Modal de compra na sidebar da pagina /live

### Problema actual
Os botoes "Garantir Premium Pass" e "Garantir lugar na Masterclass" na sidebar apontam para `/upgrade` e `#` respectivamente. O utilizador quer que cada botao abra um modal simples (nome + email), e depois redirecione para o link de pagamento EuPago correspondente.

### Solucao

#### 1. Criar componente `PurchaseModal.tsx`
Novo ficheiro: `src/components/webinar/PurchaseModal.tsx`

- Modal com Dialog (Radix) contendo:
  - Titulo dinamico baseado no plano ("Premium Pass" ou "Masterclass")
  - Campo Nome (primeiro + ultimo nome em 2 inputs)
  - Campo Email
  - Botao "Ir para pagamento" que:
    1. Valida inputs (nome e email obrigatorios)
    2. Chama a edge function `create-payment` com `{ plan, email, nome }`
    3. Recebe `paymentLink` na resposta
    4. Faz `window.location.href = paymentLink` para redirecionar para EuPago
  - Estado de loading enquanto gera o link
  - Mensagem de erro se falhar

#### 2. Modificar `WebinarSidebar.tsx`
- Adicionar state para controlar qual modal esta aberto (`null | "premium" | "masterclass"`)
- Mudar os `<a>` dos CTAs para `<button>` que abrem o modal com o plano correcto
- Renderizar `<PurchaseModal>` com as props adequadas

#### 3. Mapeamento de planos
- "Garantir Premium Pass" -> plan = `"premium"` (€15)
- "Garantir lugar na Masterclass" -> plan = `"masterclass"` (€52)
- A edge function `create-payment` ja suporta ambos os planos

### Ficheiros a criar/modificar
1. `src/components/webinar/PurchaseModal.tsx` (NOVO)
2. `src/components/webinar/WebinarSidebar.tsx` (modificar CTAs)

### Detalhes tecnicos
- Usa `supabase.functions.invoke("create-payment", { body: { plan, email, nome } })` para gerar o link
- A edge function retorna `{ paymentLink, reference }` em caso de sucesso
- Redirect via `window.location.href` para o checkout hosted da EuPago
- Validacao: nome nao vazio, email com formato valido (regex basico)
- O modal usa os componentes Dialog do Radix ja existentes no projecto
