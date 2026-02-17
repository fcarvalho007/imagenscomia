

## Usar o modal de registo da homepage na pagina /live

Tres alteracoes simples para reutilizar o `RegistrationModal` existente.

---

### 1. WebinarSidebar.tsx

- Remover import do `PurchaseModal` e o state `activePlan`
- Importar `useRegistrationModal` 
- Nos `onCtaClick` dos dois `OfferCard`, chamar `open("free")` (abre o modal no step "capture" com os campos nome, email, WhatsApp e RGPD)
- Apos registo, o modal navega automaticamente para `/upgrade` (logica ja existente no RegistrationModal)

### 2. WebinarLive.tsx (pagina /live)

- Envolver o conteudo com `RegistrationModalProvider` (necessario para o contexto do modal funcionar)
- Adicionar o componente `RegistrationModal` dentro do provider (renderiza o modal quando `isOpen` e true)

### 3. Sem alteracoes no RegistrationModal

O modal ja tem toda a logica: campos de captura, validacao RGPD, registo via `register-free`, e navegacao para `/upgrade` com nome e email nos query params. Reutiliza-se tal como esta.

---

### Fluxo resultante

1. Utilizador clica "Garantir Premium Pass" ou "Garantir lugar na Masterclass"
2. Abre o mesmo modal da homepage (nome, email, WhatsApp, checkbox RGPD)
3. Apos submissao, navega para `/upgrade` (passo 1) onde pode escolher Premium, Masterclass ou ambos

