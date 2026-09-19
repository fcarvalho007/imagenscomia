# Automações e comunicação — revisão

## Entregue

- Mantém sidebar, tipografia, separadores e componentes de comunicação do WebinarCRM.
- O curso mostra agora uma sequência visual pré/pós-evento, com inscrições submetidas, momentos de envio, início/fim da formação e condições de elegibilidade.
- Email às 48h e SMS às 24h; recursos ao dia 1, sessão individual ao dia 7 e SMS ao dia 14. Horários em Europe/Lisbon. Sem mensagens durante a formação.
- Contagens reais por template/estado, independentes da página de operações; contagens indisponíveis não aparecem como zero. Botões abrem Pessoas com filtros exatos.
- Avisos de operações bloqueadas/a verificar e atalhos para inspeção. Aceitação pelo fornecedor é distinguida de entrega.
- SMS editável por edição, limite de um segmento, validação no cliente/SQL/worker, proteção contra gravação desatualizada e auditoria. Guardar não envia.
- Comunicação mantém Email/SMS/Histórico e indica os destinatários elegíveis; pré-visualizações também disponíveis em telemóvel.

## Verificação

112 testes de aplicação (110 na suite mais dois testes específicos do fluxo); 90 verificações SQL isoladas; TypeScript e build aprovados. Cenários novos: texto SMS guardado efetivamente usado, mensagem inválida sem contacto com fornecedor, controlo de acesso, edição concorrente, filtros do fluxo e contagens desconhecidas.

Lovable confirmou a aplicação da migração e deploy de course-operations. A migração canónica é 20260919092733_c5194bf1-ed45-4f6a-9c33-abfe71bec5a9.sql; removida a cópia de origem idêntica para evitar execução duplicada. Verificação visual da sequência de Lisboa e da edição online em telemóvel, com dados reais vazios. Sem participantes, campanhas, pagamentos ou mensagens de teste em produção.

## Limites operacionais

Não foi publicado o frontend em produção nem ativados os envios ou cron. Mantêm-se as pendências de configuração real (agendamentos e recursos) e homologação do serviço. Métricas de entrega/abertura/clique não são inferidas a partir de aceitação pelo fornecedor. A revisão de acesso do legado continua separada desta instalação.
