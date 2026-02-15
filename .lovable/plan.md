

## Fase A — Correcoes Criticas (hoje)

### Correcao 1: Re-entry para emails duplicados

**Problema**: Quando um email ja existe, o modal mostra "Este email ja esta inscrito" e bloqueia. O utilizador nao consegue retomar o pagamento.

**Solucao**: No `RegistrationModal.tsx`, quando `alreadyRegistered === true`, em vez de mostrar erro e parar:
- Buscar os dados existentes do registo (nome, referral_code) que ja vem na resposta do `register-free`
- Mostrar mensagem amigavel: "Ja tens inscricao! Queres continuar para o upgrade?"
- Botao "Continuar com este email" que redireciona para `/upgrade?name=...&email=...&ref_code=...`
- Nao criar registo duplicado (a edge function `register-free` ja trata disso — retorna dados existentes sem inserir)

**Ficheiros alterados**:
| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/RegistrationModal.tsx` | Linhas 58-63: substituir o bloco `alreadyRegistered` — em vez de `setError(...)` e `return`, guardar os dados retornados e mostrar opcao de continuar para /upgrade |
| `supabase/functions/register-free/index.ts` | Adicionar `name` ao retorno de registos existentes (linhas 76-83) para pre-preencher o nome no redirect |

### Correcao 3: Retoma sem query params no /upgrade

**Problema**: Se o utilizador perde o URL com `?email=...`, o `userData.email` fica vazio e todas as operacoes de DB falham silenciosamente com `.eq("email", "")`.

**Solucao**: No `Upsell.tsx`, adicionar um estado de "recuperacao de email":
- Se `userData.email` esta vazio ao montar, mostrar um formulario minimalista: "Introduz o teu email para continuar"
- Ao submeter, fazer `supabase.from("registrations").select("name, step_reached, plan_selected, eupago_ref").eq("email", emailIntroduzido).maybeSingle()`
- Se encontrar registo: preencher `userData` com os dados existentes e continuar o funnel normalmente (retomar no `step_reached` guardado)
- Se nao encontrar: mostrar erro "Email nao encontrado. Verifica ou inscreve-te primeiro."
- Adicionar guard em `saveStepData` e `handlePayment`: se `userData.email` esta vazio, mostrar toast de erro e nao executar a query

**Ficheiros alterados**:
| Ficheiro | Alteracao |
|---|---|
| `src/pages/Upsell.tsx` | Converter `userData` de `useState` para `useState` mutavel; adicionar estado `needsRecovery` (true se email vazio); renderizar formulario de recuperacao antes dos steps; adicionar validacao em `saveStepData` e `handlePayment` |

### Correcao Pixel: Mover fbq('Purchase') para /confirmacao

**Problema**: O evento `Purchase` dispara ANTES do pagamento real (no momento do clique em "Confirmar e pagar"), inflacionando metricas.

**Solucao**:
- Remover `fbq('track', 'Purchase', ...)` do `Upsell.tsx` (linha 93)
- Adicionar `fbq('track', 'Purchase', ...)` no `Confirmacao.tsx`, usando o `searchParams.get("plan")` para determinar o valor
- O evento so dispara quando o utilizador chega a `/confirmacao?plan=...` apos pagamento

**Ficheiros alterados**:
| Ficheiro | Alteracao |
|---|---|
| `src/pages/Upsell.tsx` | Remover linha 93 (`fbq('track', 'Purchase', ...)`) |
| `src/pages/Confirmacao.tsx` | Adicionar `useEffect` que dispara `fbq('track', 'Purchase', { value, currency: 'EUR' })` baseado no `plan` dos searchParams |

---

## Fase B — CRM + Idempotencia (a seguir)

### Correcao 2: Botao CRM "Gerar novo link / Reenviar"

**Problema**: O CRM ja tem "Gerar Lembrete de Pagamento" via `generate-reminder`, mas:
- Nao distingue entre "gerar novo" e "reenviar existente"
- Nao regista quando o link foi gerado/enviado

**Solucao**:
- Adicionar coluna `last_payment_link_sent_at` a tabela `registrations` (migracao)
- No `generate-reminder`, gravar `last_payment_link_sent_at` ao gerar link
- No `InscritoModal.tsx`, mostrar texto diferente baseado no estado:
  - Sem `eupago_ref`: "Gerar link de pagamento"
  - Com `eupago_ref` mas sem `paid_at`: "Gerar novo link de pagamento" (com nota do ultimo envio se `last_payment_link_sent_at` existir)
- Mostrar timestamp do ultimo envio na ficha do inscrito

**Ficheiros alterados**:
| Ficheiro | Alteracao |
|---|---|
| Migracao SQL | `ALTER TABLE registrations ADD COLUMN last_payment_link_sent_at timestamptz;` |
| `supabase/functions/generate-reminder/index.ts` | Adicionar `last_payment_link_sent_at: new Date().toISOString()` ao update (linha 89) |
| `src/components/crm/InscritoModal.tsx` | Ajustar texto do botao e mostrar data do ultimo envio |
| `src/pages/crm/mockData.ts` | Adicionar campo `last_payment_link_sent_at` ao tipo `Inscrito` |
| `src/hooks/useInscritos.ts` | Mapear o novo campo |

### Correcao 4: Idempotencia do create-payment

**Problema**: Se o utilizador clicar varias vezes em "Confirmar e pagar", sao criadas multiplas transaccoes na EuPago.

**Solucao**: Na edge function `create-payment`:
- Antes de chamar a API EuPago, verificar se ja existe um `eupago_ref` recente para este email
- Se existir e tiver menos de 24h (janela razoavel de validade), tentar reutilizar
- Como nao conseguimos verificar o estado do link na EuPago sem API adicional, a abordagem pragmatica e: se `eupago_ref` e `upgrade_clicked_at` existem e tem menos de 1h, retornar erro "Pagamento ja em processamento. Verifica o teu email ou aguarda."
- Para cliques apos 1h, gerar novo link normalmente (o anterior provavelmente ja expirou)
- No frontend (`Upsell.tsx`), desactivar o botao apos o primeiro clique e mostrar overlay — isto ja existe parcialmente com `setShowRedirect(true)`

**Ficheiros alterados**:
| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/create-payment/index.ts` | Adicionar verificacao de `eupago_ref` + `upgrade_clicked_at` recente antes de criar novo link |

---

## Resumo de risco

| Correcao | Risco de regressao | Impacto na receita |
|---|---|---|
| 1 — Re-entry duplicados | Baixo (nao altera insercao, so UI) | Alto (desbloqueia leads presos) |
| 3 — Retoma sem params | Baixo (fallback isolado) | Alto (previne perda de dados) |
| Pixel | Nulo (so move evento) | Medio (metricas correctas) |
| 2 — CRM link | Baixo (feature nova) | Alto (recupera leads pendentes) |
| 4 — Idempotencia | Medio (altera fluxo de pagamento) | Medio (previne confusao) |

## Testes obrigatorios

1. Registo com email novo → selecciona plano → fecha browser → abre /upgrade sem params → introduz email → retoma e consegue pagar
2. Email duplicado no modal → nao bloqueia → mostra opcao "Continuar" → chega ao /upgrade
3. eupago_ref pendente → CRM gera novo link → link funciona
4. Pixel so dispara na /confirmacao (verificar Network tab para fbq)

