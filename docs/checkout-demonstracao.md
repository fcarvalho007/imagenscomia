# Checkout de demonstração

Abrir `/curso-ia/checkout-demonstracao` no servidor de desenvolvimento. O CRM local tem um atalho "Ver checkout de demonstração". A rota, o atalho e o carregamento do módulo estão limitados a import.meta.env.DEV; o conteúdo demonstrativo não é incluído no bundle de produção.

Uma oferta, desmarcada: Imagem e vídeo com IA — da ideia à publicação. 67 euros líquidos exclusivamente para simulação. As duas sessões individuais, os templates, checklists e videoaulas de resumo continuam incluídos no curso principal. Sem consultoria extra. Edições de exemplo: Lisboa e Porto 497 euros líquidos; online 397. IVA de simulação: 23%, calculado em cêntimos. Preços base são fixtures da apresentação, sem consulta ou alteração do catálogo de vendas.

O componente apenas mantém estado React em memória. Não pede dados pessoais, não cria pagamentos, não invoca o backend e não guarda escolhas no browser. Concluir simulação mostra um resumo; Editar simulação permite voltar. A publicação comercial depende da aprovação de conteúdo, preço, prazo de acesso e disponibilidade do pacote, e de nova integração/testes de pagamento, faturação e recursos. Não promete duração, número de aulas, sessões em direto ou atualizações contínuas.

Os materiais antigos são referências para preparar a futura oferta, não conteúdos já atualizados ou entregues por esta demonstração. A masterclass existente contém datas e promessas próprias; não importar automaticamente esses textos nem os respetivos direitos de acesso.

Validação: 44 testes de aplicação; seis percursos com/sem pacote nas três edições no navegador, totais e regresso à edição; teclado; 390px sem overflow; nenhuma chamada de escrita ao backend. TypeScript e build passam. Checkout excluído do bundle de produção verificado. A revisão comercial e operacional dos checkouts antigos continua necessária antes de publicar a integração real; não foram alterados nesta implementação.
