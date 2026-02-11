

# Associar pagamentos aos utilizadores e notificar

## Problema atual
Quando alguém paga na EuPago, nao ha forma de saber quem pagou porque os links fixos do PayByLink nao incluem identificacao do utilizador. O webhook recebe a confirmacao mas nao faz nada com ela.

## Solucao (4 partes)

### 1. Adicionar campos na tabela `registrations`
- `paid_at` (timestamp) — quando o pagamento foi confirmado
- `eupago_ref` (text) — referencia da transacao EuPago

### 2. Mudar de links fixos para links dinamicos (API PayByLink)
Em vez de redirecionar para URLs fixas, voltar a usar a edge function `create-payment` que ja existe no projeto mas nao esta a ser usada. Esta funcao:
- Cria um link de pagamento via API da EuPago
- Inclui o `identifier` com o email do utilizador (ex: `WEBINAR-PREMIUM-joao@email.com-1707...`)
- Define o `callbackUrl` para o webhook automaticamente
- A EuPago envia o `identifier` no webhook, permitindo identificar quem pagou

Alteracao no `Upsell.tsx`: substituir o redirect para URLs fixas por chamada a `create-payment`, que devolve o link dinamico.

### 3. Atualizar o webhook `eupago-webhook`
Quando recebe confirmacao de pagamento (`transactionStatus === "Success"`):
- Extrair o email do `identifier`
- Atualizar `registrations` com `paid_at` e `eupago_ref`
- Enviar notificacao por email (usando a API do Resend ou similar) OU simplesmente guardar na BD para o CRM mostrar

### 4. CRM: ler dados reais da base de dados
Substituir o mock data por queries reais a tabela `registrations`. O CRM passara a mostrar:
- Quem se inscreveu
- Quem clicou em pagar (`upgrade_clicked_at`)
- Quem realmente pagou (`paid_at` preenchido)
- O plano e valor correspondente

## Configuracao EuPago (manual)
No backoffice da EuPago, no campo URL da notificacao, colocar:
```
https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/eupago-webhook
```

## Detalhes tecnicos

### Ficheiros a criar/editar

| Ficheiro | Acao |
|----------|------|
| Migracao SQL | Adicionar colunas `paid_at` e `eupago_ref` a `registrations` |
| `supabase/functions/eupago-webhook/index.ts` | Processar webhook: extrair email do identifier, atualizar BD |
| `supabase/functions/create-payment/index.ts` | Incluir email no identifier para rastreio |
| `src/pages/Upsell.tsx` | Usar `create-payment` em vez de URLs fixas |
| `src/hooks/useInscritos.ts` | Fetch de dados reais da tabela `registrations` |
| `src/pages/crm/mockData.ts` | Manter tipos, remover mock data |

### Fluxo apos implementacao

```
Utilizador preenche form → dados guardados na BD
         ↓
Clica em pagar → create-payment gera link com email no identifier
         ↓
Paga na EuPago → EuPago envia webhook com identifier
         ↓
Webhook extrai email → atualiza paid_at na BD
         ↓
CRM mostra: "Frederico pagou Premium as 21:35"
```

### Sobre notificacoes
Ha duas opcoes para ser notificado quando alguem paga:
- **Opcao A**: Ativar "Receber notificacao de referencias por e-mail" no EuPago (ja tens essa checkbox na imagem) — recebes email direto da EuPago
- **Opcao B**: Adicionar envio de email no webhook (requer servico de email tipo Resend)

A Opcao A e imediata e nao requer codigo. Basta ativar a checkbox no backoffice.

