

# Auditoria e Plano: Faturação CRM

## Estado Actual

### Proteção contra duplicados
A função `bulk-emit-invoices` **já tem proteção**:
- Filtra apenas `invoice_sent = false` — registos já emitidos são excluídos automaticamente
- Se já existe `invoice_document_id` (rascunho), reutiliza-o em vez de criar novo
- Marca `invoice_sent = true` após emissão bem-sucedida

**Risco residual**: se a função falhar a meio (timeout), alguns registos podem ficar com rascunho criado mas não finalizado. Isto é tratado correctamente — na próxima execução, o rascunho existente é reutilizado.

### Dados pendentes por webinar

**Imagens** (4 pagantes sem fatura):
| Nome | Valor | NIF preenchido? |
|------|-------|-----------------|
| Graça Sá da Bandeira | €18.45 | Sim |
| Jorge Isabelinho | €18.45 | Não |
| Maria Soares | €76.26 | Não |
| Pedro Vilarinho | €76.26 | Não |

**Video** (30 pagantes sem fatura): já auditados anteriormente — 21 com NIF, 9 sem NIF.

**Imagens já emitidas**: 11 faturas (10 enviadas + 1 com draft finalizado).

---

## Problemas identificados

1. **Faturação não tem abas próprias** — depende do switcher global no topo do CRM, o que obriga a mudar o contexto de todo o CRM para ver faturas de outro webinar.

2. **Webinar Imagens** tem 4 pagantes sem fatura emitida — a mesma função `bulk-emit-invoices` já os suporta (basta passar `webinar: "imagens"`).

---

## Plano de alterações

### 1. Adicionar abas internas na FaturacaoView

Adicionar um sistema de tabs (Todos / Imagens / Vídeo) **dentro** da secção Faturação, independente do switcher global. As abas filtram os `inscritos` localmente:

```
┌──────────┬───────────┬──────────┐
│  Todos   │  Imagens  │  Vídeo   │
└──────────┴───────────┴──────────┘
```

- **Ficheiro**: `src/components/crm/FaturacaoView.tsx`
- Adicionar estado local `activeTab` com 3 opções
- Filtrar `inscritos` e `costs` pelo tab activo (em vez do `webinarContext` global)
- Os botões de emissão na `InvoiceTable` passam o `activeTab` como parâmetro `webinar`
- KPIs, charts e PlanBreakdown recebem os dados filtrados pelo tab

### 2. InvoiceTable usa o tab activo para emissão

- **Ficheiro**: `src/components/crm/faturacao/InvoiceTable.tsx`
- Receber nova prop `webinarFilter` em vez de ler `webinarContext`
- Os botões "Emitir e Enviar Todas" e "Gerar Rascunhos" passam `webinarFilter` ao edge function
- Isto garante que ao clicar "Emitir" na tab Imagens, só processa registos de imagens

### 3. CRM.tsx passa inscritos sem filtro à FaturacaoView

- **Ficheiro**: `src/pages/CRM.tsx`
- Alterar para passar `inscritos` (todos) em vez de `filteredInscritos` à FaturacaoView, para que as abas internas façam a filtragem

### Ficheiros alterados (3)
- `src/components/crm/FaturacaoView.tsx` — abas internas + filtragem local
- `src/components/crm/faturacao/InvoiceTable.tsx` — usar prop `webinarFilter`
- `src/pages/CRM.tsx` — passar todos os inscritos à FaturacaoView

