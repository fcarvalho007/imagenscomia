# Curso IA — operação e publicação

## Estado verificado em 18/09/2026

Código desenvolvido em `codex/curso-ia-wordpress`, projeto Lovable `bacfa751-bc77-4ced-ab7c-bb62e7ceb144`, CRM de destino `https://imagenscomia.com/crm/curso-ia`. Landing WordPress `https://fredericocarvalho.pt/curso-de-inteligencia-artificial/`.

44 testes de aplicação, 40 verificações SQL, TypeScript e build passam localmente. Não confundir estes resultados com homologação dos fornecedores em produção. Vendas, emails e faturação permanecem desligados por defeito.

## Ordem de instalação

1. Aplicar as cinco migrations `20260918140000` a `20260918151500`, pela ordem dos ficheiros. Não reaplicar nem apagar migrations históricas. As novas tabelas não migram nem alteram participantes dos webinars.
2. Publicar `course-wordpress-ingest`, `course-eupago-webhook`, `course-operations`, `course-resources`; publicar também as correções de autenticação de `create-invoice` e `followup-abandoned`, incluindo `_shared/admin-auth.ts`.
3. Confirmar admin com MFA aal2 e testar acesso a `/crm/curso-ia`.
4. Configurar segredos e testar no sandbox Eupago antes de permitir vendas. O modo sandbox é o default; a variável de ativação não basta para passar a produção.
5. Confirmar plugin WordPress 0.5.0, já instalado; página, endpoint e política de privacidade preenchidos. Condições e ponte assinada ainda por concluir. Ver `docs/correcao-wordpress-2026-09-18.md`. Excluir a página e `/wp-json/fcia/*` de cache integral: o nonce é dinâmico.
6. Preencher as configurações das edições no CRM. Validar o conteúdo e os links reais dos emails. Links de Calendly/Zoom ainda inexistentes e recursos indisponíveis bloqueiam apenas o envio respetivo. A confirmação de pagamento pode funcionar independentemente dos agendamentos.
7. Instalar o cron de 5 minutos com segredo dedicado no Vault. Confirmar o heartbeat no CRM e rever os resultados. Só então ativar os serviços autorizados.

## Segredos de runtime (nunca no Git)

- `COURSE_WP_BRIDGE_SECRET`: chave aleatória ≥32, igual a FCIA_BRIDGE_SECRET no WordPress.
- `COURSE_APP_URL`: https://imagenscomia.com; domínio do portal de recursos.
- `COURSE_PUBLIC_URL`: URL da página WordPress aprovada acima.
- `COURSE_PAYMENTS_ENABLED`: true apenas após homologação.
- `COURSE_PAYMENT_ENV`: sandbox durante testes; production apenas na passagem real.
- `COURSE_EUPAGO_API_KEY`: canal dedicado ao curso.
- `COURSE_EUPAGO_WEBHOOK_KEY`: assinatura do callback realtime 2.0. Confirmar payload real e estado Paid/Refund/Expired/Cancel. O endpoint recusa callbacks não assinados.
- `COURSE_CRON_SECRET`: chave aleatória ≥32.
- `COURSE_AUTOMATIONS_ENABLED`: true para permitir o worker; além disso cada edição tem `automation_enabled` no CRM.
- `RESEND_API_KEY`: pode reutilizar o fornecedor existente; confirmar domínio verificado e limites da conta.
- `COURSE_EMAIL_FROM`: remetente verificado, p.ex. Frederico Carvalho <frederico.carvalho@digitalfc.pt> após validação.
- `COURSE_EMAIL_REPLY_TO`: caixa de suporte efetivamente acompanhada.
- `COURSE_INVOICING_ENABLED`: true apenas após homologação fiscal.
- `INVOICEEXPRESS_API_KEY`: chave existente, sem a expor.
- `COURSE_INVOICEEXPRESS_ACCOUNT`: conta efetiva (código histórico: fomentarsonhos), confirmar antes de emitir.
- `COURSE_INVOICEEXPRESS_TAX_NAME`: nome exato da taxa IVA 23 na conta. O worker verifica nome e valor antes de criar.

## Sequência por edição

| Momento | Email | Destino |
|---|---|---|
| Pagamento confirmado | Inscrição confirmada | Dados de faturação por link privado |
| +1 hora | Sessão individual antes | Agendamento da edição |
| 2 dias antes (mínimo 2h após compra) | Informações práticas | Local presencial ou acesso às quatro sessões |
| Durante a edição | Nenhum envio automático | Trabalho em formação |
| 1 dia depois | Recursos | Templates, checklists, videoaulas; online inclui gravações |
| 7 dias depois | Sessão individual depois | Agendamento até 30 dias após formação |

As mensagens pré-evento não são enviadas depois de o evento começar. O silêncio durante o curso online cobre todo o intervalo entre a primeira e a última sessão. As tarefas humanas continuam separadas dos envios: enviar o link não significa que a sessão foi realizada.

## Recursos e gravações

O separador Recursos permite adicionar templates, checklists, guias, videoaulas e gravações por edição. O email usa por defeito a área `/curso-ia/recursos`, com um link privado individual: a API confirma pagamento e edição antes de mostrar os conteúdos. Gravações são exclusivas do online e deixam de ser apresentadas um ano depois da última sessão. Reembolsos retiram o acesso. A publicação de materiais retoma os emails de recursos bloqueados que ainda não foram enviados.

Esta área não usa o acesso apenas por email dos webinars antigos. Os ficheiros/vídeos devem continuar com proteção no respetivo fornecedor: o portal controla a apresentação dos links, não impede cópias ou partilha de URLs externas. `aulas.fredericocarvalho.pt` pode ser ligado posteriormente.

Calendly e Zoom ainda não configurados. Testes de email exclusivamente para info@fredericocarvalho.pt; nenhum participante real deve receber testes.

## Garantias e recuperação

- Uma operação por participante/tipo, criada na mesma transação da confirmação de pagamento; webhook repetido não duplica a sequência.
- Lock de fila e lease impedem dois workers de processarem a mesma operação. Um worker interrompido entra em revisão após 5 minutos.
- Resend: payload congelado + Idempotency-Key. Retries automáticos limitados a 8 e a 23h, dentro da janela do fornecedor; sem fallback que possa duplicar emails. “Aceite” não significa entregue; verificar bounces no Resend.
- InvoiceXpress: preço/IVA vêm do pagamento, nunca do browser. Criação, finalização e envio são registados separadamente. Uma resposta incerta gera revisão; não se cria outra fatura automaticamente. Reembolsos exigem reconciliação fiscal/nota de crédito por responsável.
- Dados de faturação recolhidos por token UUID privado após pagamento. Suporte trata faturação estrangeira e correções de documentos emitidos. Não existe isenção automática por país.
- Não há botão de reenvio cego para operações em revisão. Verificar referência `FCIA-<payment UUID>` no fornecedor; só depois reconciliar o estado com acesso administrativo.
- Para pausar: desativar sequência da edição; para pausa global, COURSE_AUTOMATIONS_ENABLED=false. Não apagar a fila.

## Homologação antes de abrir vendas

Testar uma inscrição fictícia em cada edição no sandbox; validar o valor bruto/IVA e callbacks assinados (duplicado, refund, expired, assinatura falsa). Nenhuma ligação de retorno pode marcar pagamento como pago. Testar esgotamento e dupla submissão.

Enviar os cinco modelos apenas para um endereço de teste autorizado; verificar links e resposta. Fazer teste de erro/timeout e confirmar que não duplica. Confirmar o cron/heartbeat.

A homologação de uma fatura deve ser decidida pelo responsável fiscal na conta de testes adequada. Não emitir documentos reais como simples teste nem assumir que há sandbox na conta atual.

Validar WordPress sem sessão iniciada, desktop/mobile, nonce/cache, política/condições, entrada no CRM, faturação e retorno do pagamento. Iframe é opcional; nova janela continua disponível se cookies/CSP impedirem incorporação.

## Referências técnicas

- Resend: https://resend.com/docs/dashboard/emails/idempotency-keys
- InvoiceXpress: https://docs.invoicexpress.com/invoices
- Lovable Cloud: https://docs.lovable.dev/features/cloud
- GitHub sync: https://docs.lovable.dev/integrations/github
