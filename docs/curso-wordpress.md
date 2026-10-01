> Documento da etapa anterior. Estado e instruções atuais: [Operação do curso](operacao-curso.md).

# WebinarCRM + WordPress — integração local do curso de IA

Estado em 18 de setembro de 2026: código desenvolvido e testado localmente. Não foi publicado, instalado num WordPress real ou ligado a dados/pagamentos reais. O GitHub não foi alterado.

Repositório local: `work/imagenscomia`, branch `codex/curso-ia-wordpress`, base `6970cc1db4f553ffad906018edfe503026f610f4`. As alterações estão por commit. A landing original V90 mantém-se; o plugin incorpora uma cópia e acrescenta a integração.

## Organização proposta e implementada

**Projeto → Curso de IA aplicada ao negócio → Edição → Lisboa / Porto / Online / Visão geral.** Um único seletor de edição filtra os indicadores comerciais, inscrições, pipeline, pagamentos, referências fiscais e tarefas. Os webinars anteriores continuam no seletor de projeto. Não são três CRMs nem três bases de dados.

A nova rota é `/crm/curso-ia`. Exige utilizador administrador e sessão com segundo fator (`aal2`), com a mesma restrição na base de dados. O WordPress serve HTML nativo para a página pública, com canonical baseado no permalink escolhido. No painel, permite abrir o CRM numa janela ou tentar incorporá-lo por iframe. O iframe mantém o login e o 2FA; depende das políticas de enquadramento e armazenamento do alojamento/browser. Não há SSO nem credenciais partilhadas com WordPress.

## O que está implementado

- Plugin WordPress 0.3.0: página pública, configuração administrativa, formulário, políticas, consulta do total, ponte REST assinada e acesso ao CRM. Integração, métricas e indexação começam desligadas.
- Métricas opcionais: visita, questionário iniciado/concluído, preços vistos, edição escolhida e inscrição iniciada. Consentimento recusável/revogável; as inscrições funcionam sem métricas. Não são recolhidos email, telefone ou respostas livres nos eventos.
- Origem de campanha: apenas `utm_source`, `utm_medium`, `utm_campaign` em formato simples, associadas ao pedido apenas com consentimento. Sem click IDs nem URLs completas.
- Inscrição/pagamento: preço calculado no servidor em cêntimos, IVA e prazos por edição; total apresentado antes de continuar; ligação PayByLink da Eupago, com cartão, MB WAY e Multibanco. Chave do prestador só no backend.
- Pagamentos: referência única `FCIA-<uuid>`, confirmação por webhook 2.0 com assinatura HMAC válida, valor/moeda exatos e idempotência. O regresso da página do pagamento não confirma a inscrição.
- Reembolsos integrais e expiração/cancelamento assinados: atualizam os registos; reembolso cancela tarefas e sinaliza revisão fiscal. Reembolso parcial ou estado inesperado requer reconciliação.
- Capacidade inicial de 16 por edição. Pedidos com pagamento criado/por verificar reservam capacidade; expiração/cancelamento confirmado pelo prestador liberta-a. Um timeout não gera automaticamente um segundo pagamento.
- CRM: contactos, estado, notas, próximo contacto, tarefas, valores efetivamente pagos e referência de fatura emitida. Confirmações de pagamento não podem ser fabricadas pelo botão de edição manual.
- Faturação separada por edição: acompanhamento e registo de referência de documento emitido. **Não emite automaticamente no InvoiceXpress.**

## Automações: o que é real e o que ainda é um desenho

Depois de um pagamento validado, são criadas, uma única vez, quatro tarefas: sessão individual antes, preparação prática, recursos após o evento e sessão individual depois. As datas são calculadas a partir da edição.

| Fase | Lisboa / Porto | Online |
|---|---|---|
| Pré-evento | Pagamento, sessão individual, desafio, local e horários | Pagamento, sessão individual, desafio, acesso às quatro sessões |
| Evento | Dois dias de formação; sem envios automáticos | Quatro sessões; sem envios automáticos |
| Pós-evento | Recursos e segunda sessão individual | Recursos, gravações durante 1 ano e segunda sessão individual |

A vista Automações representa este percurso e lista tarefas reais. **Não existe ainda um worker de envio de emails/SMS para este curso.** Os textos, links de acesso/agendamento e calendarização devem ser fechados antes de o implementar/ativar. Não são reutilizadas as campanhas antigas, nem houve envios durante o desenvolvimento.

## Instalação em ambiente de testes

1. Fazer backup e criar um ambiente de staging do backend e do WordPress. Não aplicar todas as migrações antigas indiscriminadamente à produção.
2. Aplicar por ordem apenas as três novas migrações `20260918140000`, `20260918143000` e `20260918144500` do patch. As vendas começam com `sales_enabled=false` em `course_editions`.
3. Publicar as funções `course-wordpress-ingest` e `course-eupago-webhook` no staging. O `verify_jwt=false` é intencional: a primeira exige assinatura própria de servidor; a segunda exige assinatura Eupago.
4. Configurar os segredos pelo painel do backend, sem os colocar no Git:
   - `COURSE_WP_BRIDGE_SECRET`: segredo aleatório longo (mínimo 32 caracteres).
   - `COURSE_EUPAGO_API_KEY`: chave **sandbox** durante os testes; uma variável separada evita alterar a chave dos webinars. Na produção, pode pertencer à mesma conta Eupago existente.
   - `COURSE_PAYMENT_ENV=sandbox`; só depois de homologação usar `production`.
   - `COURSE_PAYMENTS_ENABLED=true` apenas no ambiente que está a ser validado.
   - `COURSE_EUPAGO_WEBHOOK_KEY`: chave de assinatura configurada na Eupago.
   - `COURSE_PUBLIC_URL`: URL HTTPS real da página de retorno da landing, nunca obtida do browser.
   - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: variáveis internas do ambiente de funções.
5. Configurar Eupago Realtime Webhooks 2.0 para o endpoint `course-eupago-webhook`: POST assinado, `encrypt=false`, estados Paid, Refund, Expired e Cancel. Validar o payload real da conta e a assinatura. O callback clássico sem assinatura não confirma pagamentos do curso. As definições globais da conta não devem interromper os webhooks antigos.
6. Publicar a nova aplicação CRM em staging. Confirmar login, 2FA, perfil admin e visibilidade das três edições. Não criar utilizadores com credenciais embutidas.
7. Desativar o plugin antigo de preview antes de instalar o novo ZIP. Criar uma página WordPress vazia e selecioná-la em **Curso IA**. Definir endpoint, URL do CRM, política de privacidade e condições de inscrição/alteração/cancelamento.
8. No `wp-config.php`, definir `FCIA_BRIDGE_SECRET` com o mesmo segredo da ponte. Não copiar a chave `service_role` para WordPress. Ativar inscrições só após configurar o backend.
9. Ativar vendas por edição em staging (`course_editions.sales_enabled`) e executar o ensaio integral abaixo. Confirmar capacidade, datas, preços e local do Porto antes de produção.
10. Em produção, repetir a configuração com segredos de produção e URL definitiva. Permitir indexação só depois da publicação final. Excluir a landing e as rotas `fcia/v1/*` da cache de página/CDN, porque contêm nonce e respostas dinâmicas.

O plugin usa o nonce REST padrão do WordPress, valida origem, limita pedidos e assina as chamadas ao backend. Nenhuma chave privada é colocada no HTML. Acrescentar proteção anti-bot ao lançamento público se houver campanhas de grande alcance; limites por IP não substituem essa proteção.

## Ensaio obrigatório antes de aceitar inscrições reais

- Instalar/ativar o ZIP no WordPress e confirmar assets, canonical, nonce REST, formulários e iframe/login no domínio final. Só a sintaxe PHP foi validada localmente; não havia runtime WordPress/PHP disponível.
- Efetuar um pagamento sandbox por modalidade e observar o webhook assinado. Testar callback duplicado, valor errado, retorno antes da confirmação, cancelamento, expiração e reembolso.
- Verificar com a Eupago o prazo efetivo de expiração do PayByLink/Multibanco. Ordens incertas ficam reservadas até reconciliação: não libertar lugares nem criar novos links sem verificar se o anterior ainda pode ser pago.
- Testar pedido repetido no mesmo browser e com o mesmo email noutro browser. O segundo caso não revela o link nem dados da inscrição anterior; encaminha para suporte.
- Validar disponibilidade das 16 vagas. A lotação foi implementada de forma conservadora e precisa da expiração do prestador corretamente configurada para não manter reservas abandonadas.
- Testar as métricas com consentimento recusado, aceite e revogado. Confirmar pedidos/pagamentos mesmo sem analytics.
- Confirmar contactos, datas, preços, condições, tratamento de pedidos conjuntos/desconto e fluxo de emissão fiscal. O formulário atual é individual; para duas pessoas com desconto direciona para suporte.
- Fechar recolha de dados fiscais e integração de emissão no InvoiceXpress. A tabela atual é de acompanhamento fiscal, não um motor de emissão automática.
- Definir retenção dos registos, exportação/eliminação e política de privacidade antes de produção. Não foi criado um apagamento automático que pudesse eliminar documentos/obrigações fiscais.

## Verificações locais

- Testes Vitest: validação, consentimentos, dados de campanha, assinatura, payloads, preços usados pelo prestador, duplicados, timeouts, controlo de acesso ao CRM e filtros.
- Base de dados PostgreSQL embutida (PGlite), isolada: aplicação das três migrações, RLS, preços, idempotência, reconciliação, reembolso, separação de edições e capacidade.
- Browser: navegação, filtros, notas e faturação na demonstração fictícia; computador e telemóvel sem overflow horizontal.
- Frontend WordPress com servidor simulado: modo desligado, consentimento, total antes de pagar, falhas e reutilização do identificador.
- Compilação da aplicação, verificação TypeScript, sintaxe das funções e parser PHP 7.4.

Estes testes não equivalem a homologação no prestador, Supabase alojado ou WordPress real.

## Referências técnicas

A confirmação do pagamento segue a [documentação de webhooks 2.0 da Eupago](https://eupago.readme.io/reference/realtime-webhooks-20) e a criação usa [PayByLink](https://eupago.readme.io/reference/paybylink). A separação de acesso assenta em [RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) e [MFA](https://supabase.com/docs/guides/auth/auth-mfa). A incorporação do CRM depende da política [frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors) do alojamento; não é algo que um iframe no WordPress possa ultrapassar.
