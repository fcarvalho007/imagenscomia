> Documento da etapa anterior. Estado e instruções atuais: [Operação do curso](operacao-curso.md).

# Revisão do backend anterior — evidências e prioridades

Revisão estática do repositório no commit base 6970cc1. Não foram consultados dados pessoais de produção nem testadas explorações contra endpoints públicos. Os riscos abaixo derivam do código e das migrações; a configuração efetivamente aplicada deve ser verificada no staging/produção pelo responsável.

## Corrigir antes de estender as automações antigas

1. **Confirmação de pagamento sem autenticidade verificada.** `supabase/functions/eupago-webhook/index.ts` aceita GET/POST sem validar assinatura; GET atribui Success. Existe também uma correspondência alternativa por plano e inscrição não paga mais recente. Uma referência não encontrada não deve confirmar outra pessoa. O novo curso usa outro endpoint: assinatura, UUID exato, valor/moeda e transação única; não usa estas alternativas. O endpoint antigo permanece inalterado para não partir callbacks reais sem homologação.

2. **Autorização insuficiente em ações sensíveis.** `followup-abandoned/index.ts`, modo manual, aceita um header que começa por Bearer sem validar utilizador/admin; `create-invoice/index.ts` usa service_role sem controlo de utilizador no handler, com `verify_jwt=false` no config. Fazer login no frontend não protege uma função pública. Antes de manter/ativar estes fluxos, exigir autenticação real, admin e 2FA para ações manuais; segredo dedicado para cron. Auditar também as funções bulk e send-email/SMS antes de reutilizá-las.

3. **Políticas permissivas no histórico SQL.** A migração `20260216123632_d2b2b270-d87a-48b6-8478-4cdba7b6853b.sql` criou SELECT/INSERT/UPDATE de invoice_details sem condição; `20260216130132_e93b0f61-e62e-4cfe-a309-43f01304e393.sql` remove INSERT/UPDATE mas preserva SELECT. Verificar as políticas efetivas, não apenas o nome. Fazer o mesmo para registrations, mensagens e documentos. As novas tabelas não dão leitura ou escrita anónima; os contactos só podem ser lidos por admin com aal2.

4. **Dados e regras de eventos misturados.** `useInscritos` e várias funções interpretam quase tudo que não é video como imagens. Preços, datas, acesso Zoom, calendários e templates estão codificados em funções distintas. Acrescentar apenas uma opção ao dropdown não basta. O novo curso tem edition_id explícito e não entra nos triggers/campanhas antigas.

5. **Métricas que não representam um funil real.** O projeto usa cache de visitantes e existem números fixos no dashboard antigo. A nova área usa eventos consentidos e separa inscrições iniciadas, pagamentos confirmados e receita. As métricas de visita permanecem globais à landing; os indicadores comerciais são filtrados por edição.

6. **Idempotência e reconciliação.** O código anterior mistura IDs longos de criação PayByLink, IDs numéricos do callback, email e plano. A nova integração conserva uma identidade própria por pagamento e distingue resposta incerta, pagamento, expiração e reembolso. Timeouts não geram um segundo pagamento automaticamente. Operações em revisão exigem consulta ao prestador e um procedimento de reconciliação antes de reabrir uma venda.

## Não automatizar ainda no novo curso

- Emails/SMS: preparar textos de Lisboa, Porto e Online, links finais, datas de envio e regras de exclusão. Depois implementar fila com idempotência por inscrição+template, limite de tentativas, bloqueio durante o evento e cancelamento após reembolso. A versão entregue cria tarefas e visualiza o fluxo, mas não envia mensagens.
- InvoiceXpress: fechar dados fiscais, descrições/linhas por edição, IVA, documento pago, rascunho versus emissão final, notas de crédito e retries. A versão entregue regista referências externas e não emite documentos nem dispara o fluxo fiscal antigo.
- Privacidade/operação: retenção, exportação, eliminação, proteção anti-bot, monitorização de falhas, alertas e recuperação de ordens em revisão.

## Critério de passagem a produção

Não basta o build passar. Exigir ensaio ponta a ponta em staging: WordPress → ponte assinada → pedido → total → Eupago sandbox → webhook assinado → inscrição confirmada → uma única criação de tarefas → indicadores corretos da edição. Repetir callback e simular falhas. Só depois habilitar vendas reais e os serviços adicionais já homologados.
