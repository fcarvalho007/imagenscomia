

# Alteracoes ao PresenterSection + Progressive Disclosure no Modal

---

## Parte 1 -- PresenterSection (alteracoes de conteudo)

### 1A. Remover SMSonline.pt da caixa "Fundador e CEO"
Substituir o sub de "DIGITALFC . SMSonline.pt" por apenas "DIGITALFC" e adicionar "+ 700 auditorias digitais realizadas".

### 1B. Actualizar "Professor Universitario"
Substituir o sub actual:
- De: "FEUC . Univ. Europeia . Univ. Autonoma"
- Para: "Universidade de Coimbra (FEUC) . Univ. Europeia (IPAM) . Univ. Aveiro . Univ. Autonoma"

**Ficheiro:** `src/components/landing/PresenterSection.tsx` (apenas actualizar o array `credentials`, linhas 5 e 8)

---

## Parte 2 -- Progressive Disclosure no Modal de Registo

A ideia e dividir o modal em 2 passos:

### Passo 1: Captacao de dados
- Titulo: "Preenche os teus dados para reservar o lugar:"
- Campos: Nome + Email
- Botao: "Reservar o meu lugar" (gradiente principal)
- RGPD note em baixo
- Ao clicar, **grava imediatamente** os dados no backend via `register-free` edge function
- Dados ficam guardados independentemente da escolha seguinte

### Passo 2: Upsell (aparece apos dados gravados)
- Titulo: "Lugar reservado! Como preferes participar?"
- Check verde + email confirmado (feedback visual imediato)
- 3 bullets vermelhos (o que perdes sem Premium)
- 3 botoes de escolha:
  1. "Sim, quero o Premium por EUR15+IVA" -- fecha modal, navega para /upgrade com name+email
  2. "Prefiro convidar 2 amigos e ganhar gratis" -- mostra confirmacao com widget referral (dados ja guardados)
  3. "Nao, continuar com versao gratuita" -- mostra confirmacao simples (dados ja guardados)

### Logica tecnica no RegistrationModal.tsx

Novo estado: `step` com valores `"capture"` | `"upsell"` | `"confirmation"`

**Passo "capture":**
- Mostra campos nome + email + botao "Reservar o meu lugar"
- Ao submeter: chama `register-free`, guarda `referralData` no estado
- Transiciona para step `"upsell"`

**Passo "upsell":**
- Mostra feedback "Lugar reservado, [nome]!" com check verde
- Mostra 3 bullets vermelhos
- 3 botoes:
  - Premium: `close()` + `navigate('/upgrade?name=...&email=...')`
  - Referral: muda para step `"confirmation"` com mode `"referral"` (sem nova chamada ao backend -- dados ja guardados)
  - Gratis: muda para step `"confirmation"` com mode `"simple"` (sem nova chamada)

**Passo "confirmation":**
- Igual ao ConfirmationView actual

### Botoes "Premium Pass EUR15" e "Garantir Premium" na landing page

Actualmente os botoes "Premium Pass EUR15" no HeroSection, PricingCardsSection e CTAFinalSection navegam directamente para `/upgrade` sem captar dados. Devem ser alterados para:
- Abrir o modal de registo (mesmo comportamento do "Inscrever gratis")
- O modal capta os dados primeiro (passo 1)
- No passo 2 do upsell, o utilizador pode escolher Premium (que navega para /upgrade com dados)

Isto garante que **qualquer clique de conversao na landing page capta dados primeiro**.

**Ficheiros afectados:**
- `src/components/landing/HeroSection.tsx` -- botao "Premium Pass EUR15" passa a abrir `open("free")` em vez de `navigate("/upgrade")`
- `src/components/landing/PricingCardsSection.tsx` -- botao "Garantir Premium EUR15" passa a abrir `open("free")`
- `src/components/landing/CTAFinalSection.tsx` -- botao "Premium Pass EUR15" passa a abrir `open("free")`

---

## Resumo de ficheiros alterados

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/PresenterSection.tsx` | Actualizar credentials: remover SMSonline.pt, adicionar auditorias, actualizar universidades |
| `src/components/landing/RegistrationModal.tsx` | Progressive disclosure: 2 passos (capture + upsell), gravar dados no passo 1, upsell no passo 2 |
| `src/components/landing/HeroSection.tsx` | Botao Premium abre modal em vez de navegar |
| `src/components/landing/PricingCardsSection.tsx` | Botao Premium abre modal em vez de navegar |
| `src/components/landing/CTAFinalSection.tsx` | Botao Premium abre modal em vez de navegar |

---

## Sequencia de implementacao

1. Actualizar PresenterSection (conteudo)
2. Reescrever RegistrationModal com progressive disclosure (capture -> upsell -> confirmation)
3. Actualizar botoes Premium nos 3 componentes da landing page para abrir modal

