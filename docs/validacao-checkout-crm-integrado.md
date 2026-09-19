# Checkout e CRM do curso — revisão de 19 de setembro de 2026

## Integração visual
O módulo Curso IA reutiliza `CRMSidebar` do WebinarCRM. Projeto e Edição ficam na barra lateral; Dashboard, Pipeline, Tabela, Faturação, Automações, Comunicação e Recursos usam a mesma navegação. Os webinars anteriores mantêm os seus componentes e dados. O curso conserva tabelas próprias para não confundir pagamentos e participantes entre produtos.

Pipeline e Tabela mostram os registos carregados, com pesquisa local explicitamente identificada. Carregar mais preserva a paginação existente. Não se apresentam contagens parciais como totais globais. A exportação CSV respeita edição/estado/pesquisa dos registos carregados e neutraliza fórmulas.

## Checkout
Rota `/curso-ia/checkout`, edição recebida da landing page. Preços consultados no backend por intermédio da ponte WordPress assinada. O navegador nunca recebe a chave de ligação. Contactos enviados apenas ao submeter; consentimentos opcionais desmarcados. O complemento de 67 € existe só na demonstração.

O novo endpoint WordPress de configuração não devolve segredos. CORS limita-se a imagenscomia.com e aos previews deste projeto; o checkout funciona sem cookies WordPress. Valores, disponibilidade, confirmação do pagamento e faturação continuam validados no servidor. A página de retorno consulta o estado; não confirma pagamentos por parâmetros de URL.

## Validação executada
- Compilação e TypeScript.
- 94 testes de aplicação, incluindo autenticação/MFA, isolamento por edição e navegação na barra lateral partilhada.
- 53 testes isolados da base de dados do curso; 67 verificações do rascunho RLS do legado.
- Checkout real com rede totalmente simulada: Lisboa/Porto/Online, computador e telemóvel, total com IVA, ausência do complemento, retorno e dados de faturação. Nenhum pagamento, inscrição, email ou fatura real criado.
- Navegador local: sidebar partilhada, pipeline, tabela, pesquisa, mudança de edição, automações, comunicação e menu móvel; sem erros de execução nem overflow horizontal da página.

## Estado e limitações
Diagnóstico WordPress confirmou autenticação da ponte e acesso à base de dados. Isto não equivale a homologação de fornecedores. O frontend não deve ser publicado enquanto os problemas críticos de acesso do legado não estiverem corrigidos e verificados.

Pagamentos do curso, envios e emissão fiscal permanecem desativados. Faltam a configuração final do pagamento assinado/worker, os agendamentos individuais, acessos às sessões e condições finais. Não ativar fornecedores com dados fictícios. Não aplicar isoladamente o rascunho RLS antes de coordenar os percursos públicos, funções e frontend compatíveis.
