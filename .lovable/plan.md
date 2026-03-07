

# Plano: Indicador visual de NIF em falta nos pagantes

## Problema
Clientes que pagaram mas não têm NIF preenchido (`invoice_details` sem registo) não são visualmente distinguidos na tabela de faturação nem na ficha do cliente. Isto dificulta saber quem contactar para pedir dados fiscais.

## Solução

### 1. InvoiceTable — badge "Sem NIF" na tabela de faturação
**Ficheiro**: `src/components/crm/faturacao/InvoiceTable.tsx`

- Fazer fetch dos `invoice_details` para todos os `inscritos` exibidos (query por `registration_id in (...)`)
- Para cada pagante sem registo em `invoice_details`, mostrar um badge laranja/âmbar **"Sem NIF"** junto ao nome (ao lado do WebinarBadge existente)
- Pagantes com NIF preenchido: sem badge extra (estado normal)
- Adicionar uma contagem no header: "X sem dados fiscais" em âmbar para dar visão rápida

### 2. InvoiceSection (ficha do cliente) — alerta visual mais forte
**Ficheiro**: `src/components/crm/modal/InvoiceSection.tsx`

- Quando `hasData === false` (consumidor final / sem NIF), substituir o texto discreto "consumidor final" por um banner âmbar com ícone de alerta: **"⚠ Sem dados de faturação — contactar cliente para solicitar NIF"**
- Incluir botão "Copiar template" que copia uma mensagem pré-formatada para enviar ao cliente pedindo os dados

### 3. TableView — indicador na tabela principal (opcional mas útil)
**Ficheiro**: `src/components/crm/TableView.tsx`

- Na coluna de plano ou na célula do nome, para pagantes (`payment_status === "paid"`), mostrar um ponto âmbar (dot) se o registo não tem `invoice_details`
- Isto requer o mesmo fetch de `invoice_details` — pode ser feito uma vez e passado como prop ou Set de IDs

## Ficheiros alterados (3)
- `src/components/crm/faturacao/InvoiceTable.tsx` — badge "Sem NIF" + contagem no header
- `src/components/crm/modal/InvoiceSection.tsx` — banner de alerta âmbar quando sem dados
- `src/components/crm/TableView.tsx` — dot âmbar para pagantes sem NIF

