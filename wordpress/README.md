# Plugin WordPress — Curso IA

Versão 0.5.0. O pacote instalável inclui `fc-curso-ia/page/` com a landing page V90 e os respetivos assets. Os três ficheiros de integração estão versionados aqui; o pacote completo, incluindo os assets visuais, é entregue separadamente como `fc-curso-ia-0.5.0.zip`. A landing não é servida pelo CRM.

Instalar o ZIP no WordPress e escolher substituir a versão anterior. Não ativar simultaneamente o plugin de preview 0.2.0 e este plugin. Criar/selecionar a página com slug `curso-de-inteligencia-artificial` em Curso IA. O tema e as restantes páginas não são modificados.

Configurar a chave dedicada `FCIA_BRIDGE_SECRET` no wp-config.php (mínimo 32 caracteres aleatórios), igual ao segredo `COURSE_WP_BRIDGE_SECRET` no Lovable Cloud. Nunca colocar service_role, chaves de pagamentos ou InvoiceXpress no frontend/WordPress.

A integração fica desativada por defeito. Ativar depois da homologação do pagamento e dos dados de faturação. Para cron e backend consultar `docs/operacao-curso.md`.

A versão 0.5.0 corrige a pré-visualização: `?fc_ia_preview=1` redireciona para `preview=primeira-visita`, ignorando preferências guardadas apenas nesse teste. O comportamento de regresso da página pública mantém-se. O painel distingue landing, CRM atual e pagamentos ainda desativados. O link inicial do CRM é `/crm` até publicar o novo módulo.
