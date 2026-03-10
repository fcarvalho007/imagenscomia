

# Diagnóstico: SMS não funciona

## Problema

A edge function `send-sms` está deployada e operacional. O problema é externo -- **ambos os gateways de SMS estão em falha por questões de conta/credenciais**, não de código.

### 1. SMSEasy (IMAGENSIA) -- Credenciais inválidas
```
SMSEasy 401: {"error":{"code":103,"description":"Username or password unknown"}}
```
O secret `SMSONLINE_API_KEY` configurado no projecto está a ser rejeitado pela API da SMSOnline. As credenciais expiraram ou foram alteradas no painel SMSOnline.

**Acção necessária:** Ir ao painel da SMSOnline (login.smsonline.pt), confirmar o username e password activos, e actualizar o secret `SMSONLINE_API_KEY` no formato `username:password`.

### 2. E-goi (915 015 508) -- Saldo insuficiente
```
E-goi 400: INSUFICIENT_BALANCE - The client balance does not allow to send sms
```
A conta E-goi não tem saldo para enviar SMS. O `EGOI_API_KEY` está correcto (a autenticação passa), mas o envio é recusado por falta de créditos.

**Acção necessária:** Carregar saldo SMS na conta E-goi.

## Resumo

| Provider | Estado | Causa | Acção |
|----------|--------|-------|-------|
| SMSEasy | ❌ 401 | Credenciais inválidas | Actualizar `SMSONLINE_API_KEY` |
| E-goi | ❌ 400 | Saldo insuficiente | Carregar saldo na conta E-goi |

Não há alterações de código necessárias. A edge function, o CORS e o fluxo do CRM estão todos operacionais.

