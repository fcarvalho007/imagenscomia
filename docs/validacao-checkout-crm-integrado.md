# Checkout e CRM do curso — revisão de 19 de setembro de 2026

## Integração visual
O curso está em `/crm?project=curso-ia`; `/crm/curso-ia` redireciona para essa vista. A revisão de reutilização substitui as vistas paralelas do curso por `PipelineView`, `TableView`, `FaturacaoView`, `InvoiceTable` e `InscritoModal` originais. O dashboard reutiliza `ConversionFunnelBlock`, `FaturacaoKPIs` e `FaturacaoCharts`, com indicadores do curso. Tipografia, tokens de cor, cartões, pesquisa, ordenação e exportação pertencem à base original. `course-crm.css` deixou de ser importado.

`crmAdapter` converte os dados do curso para apresentação, mantendo a identificação explícita do domínio, estados, edições e valores monetários. Não converte o curso num plano dos webinars. As mutações continuam a usar exclusivamente os RPCs do curso. Componentes partilhados não montam consultas, envios ou faturação do legado quando recebem o contexto do curso. Acompanhamento, sessões individuais, operações e recursos específicos conservam as regras desenvolvidas.

A seleção carrega todas as páginas de inscrições antes de apresentar os totais nas vistas; pesquisa, ordenação e exportação usam esse conjunto. Os KPIs de período continuam a vir de `course_period_metrics`. Custos do curso ainda não estão ligados: margem/ROAS aparecem indisponíveis, sem reutilizar despesas de webinars. Campos e ações não aplicáveis (planos de webinars, emissão fiscal em lote do legado, marcação manual de pagamento) não são apresentados no curso.

Pré-visualização Lovable verificada após sincronização: o seletor Projeto abre Curso de IA e a pipeline partilhada apresenta os cinco estados operacionais. A base real está sem inscrições do curso; os exemplos visuais locais são fictícios. Os três prompts antigos permanecem pausados e não foram retomados.

## Checkout
Rota `/curso-ia/checkout`, edição recebida da landing page. Preços consultados no backend por intermédio da ponte WordPress assinada. O navegador nunca recebe a chave de ligação. Contactos enviados apenas ao submeter; consentimentos opcionais desmarcados. O complemento de 67 € existe só na demonstração.

O novo endpoint WordPress de configuração não devolve segredos. CORS limita-se a imagenscomia.com e aos previews deste projeto; o checkout funciona sem cookies WordPress. Valores, disponibilidade, confirmação do pagamento e faturação continuam validados no servidor. A página de retorno consulta o estado; não confirma pagamentos por parâmetros de URL.

## Validação executada
- Compilação e TypeScript.
- 102 testes de aplicação, incluindo autenticação/MFA, isolamento por edição, adaptação de valores/reembolsos, navegação nos componentes originais, regressão de planos dos webinars e ausência de consultas ao legado nas fichas/faturação do curso.
- 53 testes isolados da base de dados do curso; 67 verificações do rascunho RLS do legado.
- Checkout real com rede totalmente simulada: Lisboa/Porto/Online, computador e telemóvel, total com IVA, ausência do complemento, retorno e dados de faturação. Nenhum pagamento, inscrição, email ou fatura real criado.
- Navegador local: sidebar partilhada, pipeline, tabela, pesquisa, mudança de edição, automações, comunicação e menu móvel; sem erros de execução nem overflow horizontal da página.

## Estado e limitações
WordPress atualizado para 0.7.0. O endpoint de configuração devolve 200 e CORS apenas para a origem autorizada; uma origem desconhecida recebe 403. As inscrições continuam desativadas. Diagnóstico WordPress confirmou autenticação da ponte e acesso à base de dados. Isto não equivale a homologação de fornecedores. O frontend não deve ser publicado enquanto os problemas críticos de acesso do legado não estiverem corrigidos e verificados.

Pagamentos do curso, envios e emissão fiscal permanecem desativados. Faltam a configuração final do pagamento assinado/worker, os agendamentos individuais, acessos às sessões e condições finais. Não ativar fornecedores com dados fictícios. Não aplicar isoladamente o rascunho RLS antes de coordenar os percursos públicos, funções e frontend compatíveis.

### Revisão adicional antes de publicar o legado
O checkout de grupos existente ainda necessita de reconciliação de participantes já inscritos: não pode cobrar novamente um participante já pago nem associar um registo de outra pessoa só por conhecer o email. O checkout individual também precisa de uma ordem própria para compras adicionais de registos pagos; preservar apenas `plan_selected` não basta se a referência de pagamento for substituída. Não aplicar a migração/publicar o conjunto antes de resolver e testar estes percursos.
