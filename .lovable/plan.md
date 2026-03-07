

# Corrigir build error + melhorar página /fatura

## 1. Build error em InvoiceTable.tsx (linha 182)

A função `handleIndividual` perdeu a sua declaração. Na linha 182 falta:

```typescript
const handleIndividual = async (id: string, draftOnly: boolean) => {
```

O corpo da função começa na linha 183 (`setIndividualLoading(id);`) sem a assinatura. Basta adicionar a linha em falta.

## 2. Melhorar página /fatura sem parâmetros

Quando alguém acede a `/fatura` sem `rid` e `t`, a página mostra apenas "Link inválido. Verifica o email que recebeste." — pouco informativo.

Substituir por uma página mais amigável com:
- Ícone visual (FileText ou similar)
- Título claro: "Página de dados de faturação"
- Explicação: "Esta página é usada para preencher os dados necessários para a emissão da tua fatura. Acede através do link enviado por email."
- Contacto WhatsApp (já existe o componente `WhatsAppSupportButton`)

### Ficheiros a alterar
1. **`src/components/crm/faturacao/InvoiceTable.tsx`** — adicionar declaração da função `handleIndividual` na linha 182
2. **`src/pages/Fatura.tsx`** — redesenhar o estado sem parâmetros com UI mais clara

