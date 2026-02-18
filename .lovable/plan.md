
## Funcionalidade: "Fatura enviada" — campo manual com persistência

### Objetivo
Adicionar um campo booleano `invoice_sent` na tabela `registrations`, com um toggle simples na ficha do inscrito (painel direito) e uma coluna visual na tabela do CRM, para assinalar manualmente quando a fatura foi enviada ao cliente.

---

### Análise do Estado Actual

- A tabela `registrations` tem colunas para dados de faturação (`invoice_details`) mas nenhum campo booleano de controlo "fatura enviada".
- O modal `InscritoModal` já tem a secção `InvoiceSection` que mostra os dados de faturação em modo read-only — é aqui onde o toggle vai viver.
- O `TableView` tem várias colunas de estado (plano, passo, notas) — vai receber uma coluna com ícone de confirmação.
- O tipo `Inscrito` em `mockData.ts` precisa de um novo campo `invoice_sent: boolean`.
- O hook `useInscritos` precisa de uma função `toggleInvoiceSent` que persiste em Supabase.

---

### Ficheiros a alterar

| Ficheiro | O que muda |
|---|---|
| Migration SQL | Adicionar coluna `invoice_sent BOOLEAN NOT NULL DEFAULT false` à tabela `registrations` |
| `src/pages/crm/mockData.ts` | Adicionar `invoice_sent: boolean` ao tipo `Inscrito` |
| `src/hooks/useInscritos.ts` | 1. Mapear `invoice_sent` no `mapRegistration`; 2. Criar função `toggleInvoiceSent` |
| `src/components/crm/modal/InvoiceSection.tsx` | Adicionar toggle "Fatura enviada" no topo da secção |
| `src/components/crm/InscritoModal.tsx` | Passar `onToggleInvoiceSent` ao `InvoiceSection` |
| `src/pages/CRM.tsx` | Passar `toggleInvoiceSent` do hook ao modal |
| `src/components/crm/TableView.tsx` | Adicionar coluna com ícone ✓ / — para `invoice_sent` |

---

### Detalhe Técnico

#### 1. Migration SQL
```sql
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN NOT NULL DEFAULT false;
```
Nenhum dado existente é afectado — todos os registos ficam com `false` por defeito.

#### 2. Tipo `Inscrito`
```ts
invoice_sent: boolean;
```

#### 3. `mapRegistration` em `useInscritos.ts`
```ts
invoice_sent: r.invoice_sent ?? false,
```

#### 4. Função `toggleInvoiceSent` em `useInscritos.ts`
```ts
const toggleInvoiceSent = useCallback(async (inscritoId: string) => {
  const current = inscritos.find((i) => i.id === inscritoId);
  if (!current) return;
  const newVal = !current.invoice_sent;
  const { error } = await supabase
    .from("registrations")
    .update({ invoice_sent: newVal })
    .eq("id", inscritoId);
  if (error) { console.error("Error toggling invoice_sent:", error); return; }
  setInscritos((prev) =>
    prev.map((i) => (i.id === inscritoId ? { ...i, invoice_sent: newVal } : i))
  );
}, [inscritos]);
```

#### 5. `InvoiceSection` — Toggle no topo

Logo após o header "Faturação", antes dos dados ou do estado vazio:

```tsx
<div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2">
    <h3>Faturação</h3>
    <Badge>Completo | Em falta</Badge>
  </div>
  <button
    onClick={() => onToggleInvoiceSent(registrationId)}
    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
      invoiceSent
        ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
        : "bg-muted text-muted-foreground border-border hover:bg-accent"
    }`}
    aria-label="Assinalar fatura enviada"
  >
    {invoiceSent ? <Check size={12} /> : <FileText size={12} />}
    {invoiceSent ? "Fatura enviada ✓" : "Assinalar fatura enviada"}
  </button>
</div>
```

O componente passa a aceitar `invoiceSent: boolean` e `onToggleInvoiceSent: (id: string) => void` como props. Lê o `invoice_sent` do state local que vem da DB (sem fazer fetch adicional).

#### 6. `InscritoModal` — Passar props ao `InvoiceSection`

```tsx
<InvoiceSection
  registrationId={inscrito.id}
  invoiceSent={inscrito.invoice_sent}
  onToggleInvoiceSent={() => onToggleInvoiceSent?.(inscrito.id)}
/>
```

#### 7. `TableView` — Coluna "Fatura"

Nova coluna de cabeçalho `Fatura` entre "Notas" e as acções, mostrando:
- ✓ verde (FileCheck icon) se `invoice_sent === true`
- `—` cinzento se `false`

A coluna é pequena (ícone + tooltip), sem texto longo.

---

### UX Summary

Na ficha do inscrito (painel direito), na secção Faturação:
- Se a fatura ainda não foi assinalada → botão cinzento "Assinalar fatura enviada"
- Ao clicar → fica verde "Fatura enviada ✓" e grava em base de dados imediatamente
- Clicar de novo → volta ao estado não enviado (toggle bidirecional)
- O estado persiste entre sessões (Supabase) e é visível na coluna da tabela

Na tabela (`TableView`):
- Nova coluna com ícone ✓ verde ou — cinzento, visível à direita das notas
