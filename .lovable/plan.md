
# Refinamentos Página /upgrade + Modal + EuPago

---

## 1. Modal — Todos os caminhos redirecionam para /upgrade

Atualmente, "Continuar com participação gratuita" mostra a ConfirmationView dentro do modal. Alterar `handleContinueFree` para também redirecionar para `/upgrade`, tal como `handleGoToPremium` já faz. Assim todos os 3 caminhos (Premium, Referral, Gratuito) fecham o modal e navegam para `/upgrade` com os query params `name` e `email`.

**Ficheiro:** `src/components/landing/RegistrationModal.tsx`
- `handleContinueFree`: mudar de `setStep("confirmation")` para `close()` + `navigate(/upgrade?...)` 
- O passo "confirmation" com referral continua a existir para quem escolhe o caminho de convites

---

## 2. Página /upgrade — Sticky checkout bar no footer

Adicionar uma barra sticky no fundo da página (tipo checkout) que mostra:
- O que está selecionado (por defeito "Premium Pass · €15")
- Botão "Confirmar e Pagar" que dispara o pagamento
- A barra acompanha o scroll e fica sempre visível

Adicionar também no topo um bloco de confirmação do que foi escolhido com possibilidade de avançar directamente para pagamento.

**Ficheiro:** `src/pages/Upsell.tsx` — novo componente `StickyCheckoutBar`

---

## 3. Remover "Normal separado: €64 / Poupa €12"

No `MasterclassCard`, remover o bloco de comparação de preço (linhas 120-134):
```
Normal separado: €64
Poupa €12
```

**Ficheiro:** `src/pages/Upsell.tsx` (linhas 120-134)

---

## 4. Masterclass — Remover bullets específicos

Remover do array de bullets da MasterclassCard:
- "Midjourney, DALL-E e Firefly. Sem tentativa-erro." (sub do 1o bullet)
- "Casos reais de empresas portuguesas" (2o bullet inteiro, incluindo sub)
- "Do briefing ao resultado final — no teu sector." (sub do 2o bullet)

Manter apenas:
- `{ title: "50 prompts testados — por tipo de imagem, prontos a usar", sub: "" }`
- `{ title: "Gravação vitalícia + certificado Professor FEUC", sub: "Rever quando precisares. Válido para curriculum." }`

**Ficheiro:** `src/pages/Upsell.tsx` (linhas 141-155)

---

## 5. Workshop — Ajustes de texto

No `WorkshopCard`:
- "8h de implementação real com a tua empresa" → "8h de formação e implementação real em sala"
- "n8n workflows do zero — sem código" → "Ferramentas intermédias e avançadas de automação (Zapier, n8n, outras)"
- Remover "4 já reservadas nesta sessão" (manter apenas "Só 15 vagas")

**Ficheiro:** `src/pages/Upsell.tsx` (linhas 254-272)

---

## 6. Datas concretas

- **Masterclass**: mudar "3 horas · Online · Máx. 30 participantes" para "25 Fevereiro, 10:30–11:30 · Online · Máx. 30 participantes"
- **Workshop**: mudar "Sábado · Abril · Lisboa · Máx. 15" para "28 Março · Lisboa · Máx. 15"
- **Bundle modal** (linha 424): "Masterclass 3h online (data a anunciar)" → "Masterclass online — 25 Fev, 10:30h"
- **Bundle modal** (linha 425): "Workshop 8h presencial Lisboa (Abril)" → "Workshop 8h presencial Lisboa — 28 Mar"

**Ficheiro:** `src/pages/Upsell.tsx`

---

## 7. EuPago — Estado da integração

A integração com EuPago **já está configurada e funcional**:
- O secret `EUPAGO_API_KEY` está configurado
- A edge function `create-payment` gera links PayByLink via API EuPago (suporta CC, MB WAY, Multibanco)
- A edge function `eupago-webhook` recebe callbacks de confirmação
- Os 4 produtos estão definidos (premium €15, masterclass €52, workshop €512, bundle €524)
- O fluxo de pagamento redireciona para o checkout hosted da EuPago e retorna para `/confirmacao?plan=...`

Tudo pronto. Não são necessárias alterações nas edge functions.

---

## Resumo de ficheiros

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/landing/RegistrationModal.tsx` | handleContinueFree redireciona para /upgrade |
| `src/pages/Upsell.tsx` | Sticky checkout bar; remover "Poupa €12"; limpar bullets masterclass; ajustar textos workshop; datas concretas |

Nenhuma dependência nova. Edge functions sem alterações.
