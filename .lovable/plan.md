
# Novo funil de upgrade para /video + Modal de registo

## Resumo

Criar uma nova pagina `/upgrade-video` (duplicada de `/upgrade` / `/upgrade-gravacao`) com um funil de 2 upsells adaptado ao contexto de video:
- **Upsell 1:** Gravacao da sessao de video a 15 EUR + IVA
- **Upsell 2:** Masterclass a 47 EUR + IVA

Na pagina `/video`, o botao "Garantir inscricao gratuita" passa a abrir um modal de registo (igual ao da `/inicial`), adaptado ao contexto de video. Apos registo, o utilizador e redirecionado para `/upgrade-video`.

---

## Ficheiros a criar

### 1. `src/pages/UpgradeVideo.tsx`

Duplicar a estrutura de `UpgradeGravacao.tsx` com as seguintes diferencas:

- **OrderState:** `{ videoPremium: boolean; masterclass: boolean }`
- **Precos:**
  - Video Premium (gravacao da sessao): 15 EUR + IVA = 18,45 EUR
  - Masterclass: 47 EUR + IVA = 57,81 EUR
- **Funil de 3 passos:**
  - Step 1: `StepQualification` (reutilizar existente)
  - Step 2: `StepVideoPremium` (novo componente — upsell gravacao a 15 EUR)
  - Step 3: `StepMasterclass` (reutilizar existente)
  - Step 4: Confirmacao/pagamento (adaptar `GravacaoConfirmation` ou criar `VideoConfirmation`)
- **Recovery:** Mesmo mecanismo de email recovery
- **Side panel:** Mostrar items seleccionados com precos
- **Meta title:** "Upgrade — Webinar Video com IA"

### 2. `src/components/upgrade/StepVideoPremium.tsx`

Novo componente de upsell para a gravacao do video:
- Titulo: "Adicionar Gravacao da Sessao (opcional)"
- Preco: 15 EUR + IVA (Early bird, depois 27 EUR)
- Bullets:
  - "Gravacao HD (acesso continuo)" — Rever ao seu ritmo
  - "Pack de apoio completo" — Checklists, briefings e templates
  - "Sessao Q&A exclusiva (30 min)" — Duvidas respondidas ao vivo
- Estilo identico ao `StepPremium.tsx` existente
- Botao: "Garantir Gravacao + Pack"
- Skip: "Continuar com inscricao gratuita"
- Confirmacao modal "Boa escolha!" (mesmo padrao)

### 3. `src/components/upgrade/VideoConfirmation.tsx`

Duplicar `GravacaoConfirmation.tsx` adaptado:
- Precos: videoPremium 15 EUR (base), masterclass 47 EUR (base)
- IVA 23% calculado dinamicamente
- Mesma estrutura de checkout: subtotal, IVA, total
- Voucher system reutilizado
- InvoiceForm reutilizado
- Plan identifiers enviados ao create-payment: `"video-premium"`, `"video-masterclass"`, ou `"video-bundle"`

---

## Ficheiros a modificar

### 4. `src/pages/Video.tsx`

- Importar `RegistrationModalProvider` e `useRegistrationModal` de `@/hooks/useRegistrationModal`
- Importar `RegistrationModal` de `@/components/landing/RegistrationModal`
- Wrap todo o conteudo da pagina com `<RegistrationModalProvider>`
- Render `<RegistrationModal />` dentro do provider
- Substituir `onClick={scrollTo("inscricao")}` em TODOS os botoes CTA por `onClick={() => open("free")}` (abre o modal)
- Tambem no sticky bar CTA e no final CTA

### 5. `src/components/landing/RegistrationModal.tsx`

- Adicionar uma nova prop ou variante ao contexto para saber se o registo vem da pagina de video
- Apos registo bem-sucedido, se a variante for "video" (ou se estivermos na rota /video), redirecionar para `/upgrade-video` em vez de `/upgrade`
- Alternativa mais simples: adicionar um campo `redirectTo` ao `RegistrationModalProvider` para configurar a rota de destino pos-registo

### 6. `src/hooks/useRegistrationModal.tsx`

- Adicionar `redirectPath` ao contexto (default: `/upgrade`)
- Permitir que cada pagina configure para onde o modal redireciona apos registo

### 7. `src/App.tsx`

- Adicionar rota: `<Route path="/upgrade-video" element={<UpgradeVideo />} />`

### 8. `supabase/functions/create-payment/index.ts`

- Adicionar novos planos ao objecto PRODUCTS:
  - `"video-premium"`: value 18.45, identifier "WEBINAR-VIDPREM", description "Premium Pass — Video com IA"
  - `"video-masterclass"`: value 57.81, identifier "WEBINAR-VIDMC", description "Masterclass — Video com IA"  
  - `"video-bundle"`: value 76.26, identifier "WEBINAR-VIDBUNDLE", description "Premium + Masterclass — Video com IA"

---

## Fluxo do utilizador

```text
/video (landing)
  |
  v
[Clica "Garantir inscricao gratuita"]
  |
  v
[Modal de registo abre — variante "free" adaptada]
  |
  v
[Preenche nome + email + whatsapp + aceita termos]
  |
  v
[register-free edge function chamada]
  |
  v
[Redireciona para /upgrade-video?name=X&email=Y]
  |
  v
Step 1: Qualificacao (Como soube?)
  |
  v
Step 2: Upsell Gravacao (15 EUR + IVA) ← StepVideoPremium
  |
  v
Step 3: Upsell Masterclass (47 EUR + IVA) ← StepMasterclass existente
  |
  v
Step 4: Confirmacao + Pagamento ← VideoConfirmation
```

---

## Resumo de ficheiros

| Ficheiro | Accao |
|---|---|
| `src/pages/UpgradeVideo.tsx` | Criar |
| `src/components/upgrade/StepVideoPremium.tsx` | Criar |
| `src/components/upgrade/VideoConfirmation.tsx` | Criar |
| `src/pages/Video.tsx` | Modificar (CTA abre modal) |
| `src/components/landing/RegistrationModal.tsx` | Modificar (redirect configurable) |
| `src/hooks/useRegistrationModal.tsx` | Modificar (adicionar redirectPath) |
| `src/App.tsx` | Modificar (nova rota) |
| `supabase/functions/create-payment/index.ts` | Modificar (novos planos) |
