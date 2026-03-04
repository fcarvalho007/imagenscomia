

# Melhorar email de notificação de venda (invoice_notification)

## Problemas identificados

1. **Email enviado para `info@fredericocarvalho.pt`** em vez de `fredericodigital@gmail.com`
2. **Plan labels errados** para planos `video-*` (ex: `video-masterclass` não tem label, mostra o identificador técnico)
3. **Preços errados no totalMap** — não inclui preços video nem totais de grupo
4. **Sem contexto de grupo** — quando é compra de grupo (6 pessoas, 312€), o email não mostra quem são os participantes
5. **Informação do cliente incompleta** — falta role, team_size, webinar, registration_source, data de inscrição
6. **Sem dados de faturação na /comprar** — a página não recolhe invoice_details, por isso o email diz sempre "DADOS EM FALTA"

## Alterações no `eupago-webhook/index.ts`

### 1. Mudar destinatário
`to: ["fredericodigital@gmail.com"]`

### 2. Expandir plan labels e preços
Adicionar mapeamento completo incluindo planos video-*:
```
planLabel: video-premium → "Video Premium", video-masterclass → "Masterclass Vídeo IA", video-bundle → "Masterclass + Gravação Vídeo"
totalMap: video-premium → "18,45", video-masterclass → "57,81", video-bundle → "70,11"
```

### 3. Buscar mais dados do cliente
Na query de `reg`, adicionar: `role, team_size, sources, webinar, registration_source, created_at, first_name, last_name, group_payment_ref, whatsapp`

### 4. Incluir contexto de grupo
Se `group_payment_ref` existe, buscar todos os membros do grupo e listar no email.

### 5. Usar o valor real do EuPago (`amount`) como total
Em vez de lookup no totalMap, usar o `amount` recebido no webhook — é o valor real cobrado. Manter o totalMap apenas como referência do preço unitário.

### 6. Template de email melhorado

O email para `fredericodigital@gmail.com` incluirá:

**Sempre presente:**
- Nome completo + email do cliente
- WhatsApp (se disponível)
- Plano comprado (label legível)
- Valor total cobrado (do webhook)
- Preço unitário (do totalMap)
- Método de pagamento + Ref EuPago + Transaction ID
- Data/hora do pagamento
- Webinar (imagens/video)
- Data de inscrição
- Fonte de registo (registration_source)
- Role e team_size (se preenchidos)

**Se grupo:**
- Lista de todos os participantes (nome + email)
- Número de pessoas
- Indicação de desconto aplicado

**Se dados de faturação existem:**
- Nome/Empresa, NIF, Morada, CP, Cidade, Email fatura

**Se não existem:**
- Aviso "Dados de faturação não recolhidos"

### Ficheiro alterado
`supabase/functions/eupago-webhook/index.ts` — secção ~L541-634

