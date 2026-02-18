
## Duas novas funcionalidades no CRM

### Funcionalidade A — Mover o cliente no estágio do funil

**Problema:** O `step_reached` (1–5) é definido automaticamente pelo flow de upgrade, mas pode ser necessário corrigir manualmente quando um cliente chegou a um passo por outro canal ou quando há erro de dados.

**O que muda:**

**1. `useInscritos.ts` — nova função `updateStepReached`**

```ts
const updateStepReached = useCallback(async (inscritoId: string, step: 1|2|3|4|5) => {
  await supabase
    .from("registrations")
    .update({ step_reached: step })
    .eq("id", inscritoId);
  setInscritos((prev) =>
    prev.map((i) => i.id === inscritoId ? { ...i, step_reached: step } : i)
  );
}, []);
```

Exposta no return e passada ao `InscritoModal`, `TableView` e `PipelineView` via props.

**2. `InscritoModal.tsx` — controlo de estágio na ficha do cliente**

No painel esquerdo (Acções), abaixo da secção de follow-up, adicionar um selector de estágio:

```
Estágio do funil
[● 1] [○ 2] [○ 3] [○ 4] [○ 5]
```

5 botões numerados (1–5). O passo actual fica destacado. Ao clicar noutro, executa `updateStepReached` com confirmação inline ("Mover para Passo X?").

**3. `TableView.tsx` — selector de estágio inline na linha**

A coluna `step_reached` passa de só-leitura para clicável: ao clicar no badge do passo, abre um mini dropdown com as 5 opções (sem modal separado, rápido e operacional).

**4. `PipelineView.tsx` — já não tem selector** (as colunas são baseadas em `plan`, não em `step_reached`). Mas a ficha de cliente abre o `InscritoModal` onde o controlo já existirá.

---

### Funcionalidade B — Enviar email de pagamento directamente

**Problema actual:** O fluxo existente gera texto para o Gmail (copiar/colar). O utilizador quer clicar num botão no CRM e o cliente recebe o email imediatamente.

**Análise dos preços:**
- Premium: €15 + IVA (early bird, €18,45 c/IVA) **ou** €27 + IVA (preço normal, €33,21 c/IVA)  
- Masterclass: €47 + IVA (early bird, €57,81 c/IVA) **ou** €67 + IVA (preço normal, €82,41 c/IVA)

Para simplificar o fluxo, o CRM pergunta apenas:
- "Qual o produto?" → Premium / Masterclass / Bundle (premium + masterclass)
- "Qual o preço?" → Early bird / Normal (para Premium e Masterclass individualmente)

**Componente novo: `SendPaymentModal.tsx`**

Modal simples (2 passos) que aparece ao clicar "Enviar dados de pagamento":

```
┌─────────────────────────────────────────┐
│  Enviar link de pagamento               │
│  Para: joana@e-accelerator.pt           │
│                                         │
│  1. Produto                             │
│  [Premium Pass] [Masterclass] [Bundle]  │
│                                         │
│  2. Preço (Premium Pass)                │
│  [● €15 + IVA — Early bird]             │
│  [○ €27 + IVA — Preço normal]           │
│                                         │
│  Link será gerado e email enviado.      │
│                                         │
│  [Cancelar]  [Gerar e enviar →]         │
└─────────────────────────────────────────┘
```

**Flow técnico:**

1. O modal chama `supabase.functions.invoke("send-payment-link")` com `{ registrationId, plan, priceVariant: "earlybird" | "normal" }`.

2. **Nova edge function `send-payment-link/index.ts`:**
   - Recebe `registrationId`, `plan`, `priceVariant`
   - Resolve email e nome do inscrito via `registrations`
   - Calcula o valor correcto:
     ```
     premium_earlybird: 18.45 (€15+IVA)
     premium_normal:    33.21 (€27+IVA)
     masterclass_earlybird: 57.81 (€47+IVA)
     masterclass_normal:    82.41 (€67+IVA)
     bundle_earlybird:  76.26 (€15+47+IVA)
     bundle_normal:    115.62 (€27+67+IVA)
     ```
   - Cria link EuPago com o valor correcto (mesmo padrão do `generate-reminder`)
   - Persiste `last_payment_link` e `eupago_ref` na `registrations`
   - Envia email via Resend (template similar ao `reminder_manual`) com o link
   - Regista em `message_logs` com `template_key: "manual_payment_link_sent"` e `provider: "resend"`
   - Devolve `{ paymentLink, emailSent: true }`

3. No modal, após sucesso: mostra confirmação verde "Email enviado para joana@..." com o link copiável.

**Cooldown:** Mesma lógica de 6h da `ActionsSection` — o botão "Enviar dados de pagamento" fica desabilitado se o `message_logs` tiver um envio `manual_payment_link_sent` nas últimas 6h, mostrando o tempo decorrido.

**Bundle note:** Se `plan === "bundle"`, não há escolha de preço individual — o Bundle tem um preço único por variante (early bird ou normal), mas a pergunta pode ser simplificada para "Early bird" vs "Normal" também.

---

### Localização dos botões

**Ficha do cliente (`InscritoModal` → `ActionsSection`):**

Novo botão "Enviar dados de pagamento" aparece para inscritos **sem** `paid_at`. Substitui/complementa o botão "Gerar link (Gmail)" existente. O botão Gmail mantém-se como alternativa.

**`TableView`:**

Na coluna de acções (ícones à direita da linha), adicionar ícone de envelope com tooltip "Enviar link de pagamento" → abre o mesmo `SendPaymentModal`.

**`PipelineView`:**

Ao clicar num card → abre `InscritoModal` onde o botão já existe. Não adicionar botões directamente nos cards para não sobrecarregar.

---

### Ficheiros a criar/editar

| Ficheiro | Operação | Descrição |
|---|---|---|
| `supabase/functions/send-payment-link/index.ts` | Criar | Edge function: gera link EuPago + envia email Resend |
| `src/components/crm/modal/SendPaymentModal.tsx` | Criar | Modal de seleção de produto/preço |
| `src/hooks/useInscritos.ts` | Editar | Adicionar `updateStepReached` e `sendPaymentLink` |
| `src/components/crm/modal/ActionsSection.tsx` | Editar | Botão "Enviar dados de pagamento" + controlo de cooldown |
| `src/components/crm/InscritoModal.tsx` | Editar | Passar `updateStepReached` + selector de estágio no painel esq. |
| `src/pages/CRM.tsx` | Editar | Expor `updateStepReached` do hook para o modal |
| `src/components/crm/TableView.tsx` | Editar | Coluna `step_reached` clicável com dropdown |
| `supabase/config.toml` | Editar | Registar nova edge function |

### O que NÃO muda
- Lógica automática do funil (step_reached via upgrade flow) — a actualização manual é apenas uma sobreposição administrativa
- Templates de email existentes — a nova edge function cria o seu próprio email simples
- Estrutura do `InscritoModal` — os sub-componentes mantêm-se, apenas `ActionsSection` recebe novo botão
- Colunas do Pipeline e Tabela — sem reestruturação visual, apenas adição de controlos
