

# Atualizar segredo SMSONLINE_API_KEY

Quando eu voltar ao modo de implementação, vou usar a ferramenta `add_secret` para te pedir o novo valor do `SMSONLINE_API_KEY`.

**O que precisas ter pronto:**
- As credenciais correctas do painel SMSOnline (formato `utilizador:password`)
- Eu converto automaticamente para Base64 no código, por isso podes colar no formato raw `user:pass` ou já em Base64

**Passos:**
1. Actualizar o segredo `SMSONLINE_API_KEY` com o valor correcto
2. Testar o envio via `curl_edge_functions` para confirmar que a autenticação passa (já não dá código 103)

Nenhuma alteração de código é necessária — a edge function `send-sms` já suporta ambos os formatos (raw e Base64).

