# Integração e operação — versão 0.6.0

Esta ronda mantém o desenho aprovado da LP1/LP2 e os prestadores existentes. Não ativa vendas, envios ou emissão fiscal.

## Alterações

- WordPress: diagnóstico assinado, de leitura, com totais das três edições e configuração dos canais. Não cria inscrições nem chama fornecedores.
- Analytics: deduplicação por edição, consentimento concedido depois da primeira interação, atribuição de campanha por sessão e filtro 7/30 dias. Pedidos contam pela entrada, pagamentos pela confirmação; tarefas vencidas representam o estado atual. As visitas dependem de consentimento e não devem ser usadas como denominador de todas as vendas.
- Emails: informação prática imediata para inscrições tardias, expiração dos convites pré-evento e do acompanhamento após 30 dias. Elegibilidade novamente verificada antes de enviar.
- Sessões: estado manual por agendar/agendada/concluída; agendar cancela lembretes pendentes. Voltar a pendente não reenvia mensagens.
- SMS: dois textos de acompanhamento, consentimento específico, números móveis portugueses, um segmento, horário 08h–20h Europe/Lisbon. Sem repetição automática após erro ou resposta ambígua. Reutiliza SMSOnline; remetente requer configuração. Desativados por defeito.
- Faturação: autorização separada dos emails, sem testes fiscais reais. Referências manuais não podem substituir documentos existentes nem entrar em conflito com operações em processamento.
- Operação: pendentes ordenados dos mais antigos para os mais recentes, histórico separado e atualização explícita.
- Envios antigos: anon key e cabeçalho de email deixam de autorizar envio; exige credencial de servidor, segredo cron existente ou administrador autenticado com MFA.

## Instalação

Aplicar **uma vez** `20260918180000_course_operation_hardening.sql`, após as seis migrações canónicas anteriores. Não criar uma cópia com outro timestamp nem reaplicar as tabelas anteriores. Atualizar as funções alteradas e o frontend. Instalar o plugin 0.6.0 com o mesmo pacote aprovado da landing.

Manter `COURSE_PAYMENTS_ENABLED`, `COURSE_AUTOMATIONS_ENABLED`, `COURSE_INVOICING_ENABLED`, `COURSE_SMS_ENABLED` a `false`, `COURSE_PAYMENT_ENV=sandbox`, e flags de todas as edições desligadas até validação de ativação. Nenhuma migração cria cron ou habilita envios.

Configuração necessária: segredo de ligação comum WordPress/backend; chave e callback Eupago de sandbox; segredo do worker; remetente Resend validado; conta e nome do imposto InvoiceXpress; remetente SMS aprovado. Reutilizar chaves de fornecedores já configuradas, sem copiá-las para o cliente, Git ou chat. O diagnóstico indica presença de configuração, não comprova a entrega ou um pagamento real.

## Limites conhecidos antes de abrir vendas

- Calendly/Zoom, materiais e condições de inscrição precisam de destinos/conteúdos reais.
- Cron deve ser instalado e verificado após definir a credencial do worker.
- Aceitação de um email ou SMS pelo fornecedor **não equivale a entrega**. A receção de eventos de entrega/rejeição ainda requer integração de webhook do fornecedor.
- Os testes usam mocks e PostgreSQL isolado, sem cobrar nem emitir faturas; não certificam contas bancárias ou entrega em produção.
- O complemento de 67 € + IVA continua exclusivamente demonstrativo, fora da oferta comercial e fora do pagamento real.
