# Prompts de integração no Lovable

Projeto: https://lovable.dev/projects/bacfa751-bc77-4ced-ab7c-bb62e7ceb144

**Pré-requisito:** o código da branch `codex/curso-ia-wordpress` tem de estar disponível na branch ativa do Lovable. Em 18/09/2026, a última revisão local é `684d18a`; o utilizador já autorizou o envio para o repositório público. O ZIP 0.5.0 é apenas o plugin WordPress; não instala o backend no Lovable.

## Prompt 1 — instalar o desenvolvimento existente

Integra neste projeto o módulo Curso IA já desenvolvido no repositório imagenscomia. Preserva o CRM dos webinars Imagens IA e Vídeo IA, os seus participantes e as automações existentes. Não recries nem redesenhes a landing page: LP1 e LP2 estão no WordPress e devem manter o desenho e o percurso aprovados.

Antes de alterar qualquer coisa, verifica que esta branch contém `src/pages/CourseCRM.tsx`, `src/pages/CourseResources.tsx`, as cinco migrations de curso de setembro de 2026 e `docs/correcao-wordpress-2026-09-18.md`. O código veio da branch `codex/curso-ia-wordpress`, última revisão local `684d18a`. Se os ficheiros estiverem ausentes, para e informa que falta sincronizar o código; não reconstruas uma versão alternativa por inferência.

Lê `docs/operacao-curso.md`, `docs/correcao-wordpress-2026-09-18.md` e `docs/checkout-demonstracao.md`. `docs/curso-wordpress.md` é histórico: não uses os seus estados antigos para substituir os documentos atuais.

1. Dependências: utiliza package.json e o lockfile da branch. Instala as versões bloqueadas; não atualizes bibliotecas nem acrescentes frameworks sem necessidade identificada. Executa os testes, a verificação TypeScript e o build; corrige falhas relacionadas com a integração.
2. Base de dados: usa o backend já ligado a este projeto, `gwphpsehcnhwjiypyolg`. Verifica o histórico de migrations e o esquema existente; aplica apenas migrations pendentes, por ordem, sem apagar ou reaplicar as antigas:
   - `20260918140000_course_ia_wordpress.sql`
   - `20260918143000_course_editions_payments.sql`
   - `20260918144500_course_billing_tracking.sql`
   - `20260918150000_course_operations.sql`
   - `20260918151500_course_resources.sql`
   Se houver tabelas parcialmente instaladas ou divergências, resolve-as com uma migration corretiva e preserva dados. Mantém RLS e o acesso administrativo com MFA aal2.
3. Publica as funções `course-wordpress-ingest`, `course-eupago-webhook`, `course-operations` e `course-resources`, com os módulos partilhados. Inclui as correções existentes de autenticação de `create-invoice` e `followup-abandoned`, verificando regressões nos respetivos chamadores. Mantém os controlos de assinatura/autenticação implementados e o supabase/config.toml; não abras endpoints para contornar erros.
4. Organização: Projeto → Curso de IA aplicada ao negócio → Lisboa / Porto / Online / Visão geral. O filtro de edição deve ser consistente nos dashboards, inscrições, pipeline, faturação, automações e recursos. As datas e os preços vêm das migrations e do servidor; não inventes valores no frontend.
5. Endereços: CRM `https://imagenscomia.com/crm/curso-ia`; recursos `https://imagenscomia.com/curso-ia/recursos`; landing `https://fredericocarvalho.pt/curso-de-inteligencia-artificial/`. Configura COURSE_APP_URL e COURSE_PUBLIC_URL com estes domínios. Não substituas a landing por uma nova página React.
6. Segredos: verifica os nomes exigidos pelo código e pelo documento de operação. Reutiliza fornecedores existentes apenas quando forem compatíveis, sem alterar chaves dos webinars. Usa o gestor de segredos, nunca o chat, frontend, Git ou logs para os valores. Lista apenas nomes e estado dos segredos em falta. A chave COURSE_WP_BRIDGE_SECRET deve corresponder à FCIA_BRIDGE_SECRET do WordPress; não assumes que essa ligação já existe.
7. Mantém COURSE_PAYMENTS_ENABLED, COURSE_AUTOMATIONS_ENABLED e COURSE_INVOICING_ENABLED desativados; COURSE_PAYMENT_ENV=sandbox; vendas e automações por edição desativadas. Prepara `scripts/install-course-cron.sql` com Vault e autenticação própria; não agendes envios reais antes de homologar.
8. Conteúdo: duas sessões individuais já incluídas no curso principal. Não criar upsell de consultoria. O único complemento é a demonstração “Imagem e vídeo com IA — da ideia à publicação”, 67 € + IVA apenas em simulação. Mantém a demonstração isolada, desmarcada e sem ligação a pagamentos, inscrições ou emails reais; não exponhas a rota DEV em produção.
9. Os links Calendly/Zoom ainda não existem. Não os inventes. Campos pendentes devem ser identificados no CRM e bloquear apenas a comunicação que deles depende. Testes de email, quando autorizados e tecnicamente disponíveis, destinam-se exclusivamente a info@fredericocarvalho.pt. Não enviar a participantes nem emitir faturas reais.

No fim, apresenta uma tabela curta: componente, estado comprovado, teste realizado, pendência. Distingue código compilado, backend instalado, preview testada e domínio publicado. Não declares “pronto para vender” apenas porque o build passou. Prepara a versão de preview para homologação antes de alterar a publicação pública.

## Prompt 2 — homologar depois da instalação

Valida o módulo instalado do Curso IA sem afetar participantes reais. Mantém as vendas públicas e as campanhas do curso desligadas.

- Executa os testes da aplicação, `npm run test:course-db`, TypeScript e build. Os testes SQL devem correr na base isolada do script, nunca com fixtures na base de participantes.
- Confirma a rota `/crm/curso-ia`, login/MFA, permissões, RLS e separação de Lisboa, Porto e online. Verifica que Imagens IA e Vídeo IA continuam operacionais.
- Testa o checkout nas três edições num ambiente isolado/sandbox, com preços e IVA calculados pelo servidor, idempotência, lotação, dupla submissão, retorno antes do webhook, assinatura inválida, callback duplicado, cancelamento, expiração e reembolso. Se faltarem credenciais sandbox ou não existir isolamento suficiente, reporta o bloqueio e não uses dinheiro real.
- Valida a ponte WordPress com assinatura correta/incorreta, nonce, origem e cache. Não consideres uma configuração preenchida como prova de conectividade.
- Valida os cinco modelos de email, os links e os bloqueios por configuração incompleta. Testa a fila sem duplicar envios, retries e interrupção do worker. Restringe qualquer envio de teste a info@fredericocarvalho.pt. Não uses inscrições reais.
- Confirma que não há envios durante a formação; no online, o intervalo inclui todas as quatro sessões. Confirma cron e heartbeat apenas quando o worker estiver efetivamente configurado.
- Testa o portal: pagamento confirmado, edição correta, token inválido, reembolso e expiração de gravações online após um ano. Não declares ficheiros protegidos se forem URLs públicas no fornecedor.
- Testa a faturação por mocks ou conta de testes confirmada. Nunca emitir documentos fiscais reais como ensaio.
- Valida a demonstração do complemento com e sem seleção nas três edições, em computador e telemóvel. Totais esperados: presencial 611,31 € sem complemento / 693,72 € com; online 488,31 € / 570,72 €. A demonstração não pode efetuar pedidos de pagamento, inscrição ou email e continua fora do build público.

Entrega uma tabela com resultados reais e pendências concretas. Para cada impedimento, indica o campo ou acesso necessário e o impacto. Mantém os serviços reais desligados enquanto houver falhas de homologação. Não inventes links de agendamento, condições de cancelamento, disponibilidade do Porto ou conteúdos ainda não produzidos.
