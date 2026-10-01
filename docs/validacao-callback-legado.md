# Validação da origem de notificações Eupago

Correção de segurança da função antiga `eupago-webhook`, sem iniciar pagamentos ou emitir documentos.

- GET clássico: exige correspondência com a `EUPAGO_API_KEY` já configurada, recebida no parâmetro `chave_api`. A chave não é passada ao processamento nem aos logs da aplicação.
- POST 2.0: exige assinatura HMAC SHA-256 em `X-Signature`, com `EUPAGO_WEBHOOK_KEY`. Sem essa configuração, recusa o pedido. Aceita apenas o formato documentado, com corpo não encriptado e moeda EUR.
- Não transforma reembolso, expiração ou cancelamento em pagamento confirmado. O fluxo antigo só trata confirmações; esses outros estados requerem tratamento próprio no legado.
- O curso novo mantém o webhook separado e os estados já implementados. Nenhuma configuração de canal foi alterada.

Referências oficiais consultadas em 18 setembro 2026:
- https://eupago.readme.io/reference/webhooks
- https://eupago.readme.io/reference/realtime-webhooks-20

Validação sem fornecedores: nove casos unitários de autenticação/parsing. O script `node --experimental-vm-modules scripts/test-delivery-guards.mjs` executa os cinco handlers reais com as fronteiras de rede simuladas: vinte casos de rejeição/preflight, zero acessos às tabelas e zero pedidos a fornecedores. Os 65 testes da aplicação passaram; verificação de tipos sem erros.

Esta alteração não comprova receção de um callback real na conta. Antes da ativação, confirmar o tipo de callback configurado no canal: o GET oficial envia `chave_api`; um POST antigo sem assinatura deixa de ser aceite. Não foi gerada nenhuma nova chave nem efetuada transação de teste.
