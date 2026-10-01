# Comparação do Vídeo IA com o Curso IA — 19 setembro 2026

Referência: `45908ba46da26c04676c0ee3d5fe5461d22f878d`, componentes do webinar Vídeo IA e primeira adaptação do curso. Esta revisão mantém o mesmo projeto, autenticação, navegação e componentes. Lisboa, Porto e Online são edições isoladas.

“5x” é uma orientação de melhoria, não uma métrica demonstrada. A avaliação abaixo identifica funcionalidades reais, diferenças e limites. Código testado não equivale a operação homologada em produção.

| Secção | Base Vídeo IA | Curso antes desta revisão | Melhorias implementadas nesta revisão | Validação / limite |
|---|---|---|---|---|
| Dashboard | Funis, filtros temporais, indicadores, gráficos financeiros | Componentes partilhados, métricas do curso e totais acumulados | Fila de próximas ações; inscrições por dia de Lisboa; origem e conversão da coorte de pedidos; distinção explícita entre visitas globais e edição; falha de métricas não apaga inscrições | Dados derivados de registos reais. Não estima visitas sem consentimento, aberturas, cliques ou ROAS sem custos. |
| Pipeline | Kanban, pesquisa, filtros pré/pós, valores, ficha | Kanban original, estados do curso, bloqueio de confirmação manual de pagamento | Fase Durante; gravações de estado protegidas contra alterações concorrentes; ficha com pausa de contacto e histórico; continua a abrir a ficha original | Estados financeiros só mudam pelo circuito de pagamento validado. Não transporta ofertas Premium/Masterclass para o curso. |
| Tabela | Pesquisa, filtros, ordenação, seleção, CSV, ficha | Mesma tabela, edição, sessões antes/depois | Filtro de contactos pausados; coluna de disponibilidade de contacto; ordenação real por edição, próximo contacto e telefone; CSV com sessões, próxima ação, pausa e fatura; histórico de auditoria na ficha | Exporta registos reais, escapa células e fórmulas. Não apresenta “passos” fictícios do funil do webinar. |
| Faturação | KPIs, gráficos, custos, documentos e ações fiscais | KPIs/gráficos/tabela originais; sem registo de custos do curso | Custos por edição no CostModal/CostsSection originais; criação/edição/eliminação com RPC + 2FA; erros de escrita visíveis; isolamento da edição; CSV corrigido; margem sem IVA mesmo com o seletor ligado | Margem apenas sobre custos registados. Emissão real continua a exigir configuração/homologação. Operações fiscais ambíguas não são repetidas. |
| Automações | Fluxo, Métricas, Pessoas, Templates, editor de email | Configuração, pré-visualização e lista limitada | Mesma navegação das automações; contagens de todo o conjunto no servidor; paginação e canal; cancelar ou recolocar em fila apenas operações nunca tentadas; editor original de templates por edição; proteção contra edição concorrente; mesma renderização no preview e worker | Pausa durante o evento; consentimento SMS; limite de um segmento; revalidação antes do envio. “Aceite pelo fornecedor” não significa entregue. |
| Comunicação | Compositor, seleção, pesquisa, preview, agendamento, email/SMS, histórico | Apenas histórico | Reutilização de ComunicacaoView, EmailTab, SmsTab, SendConfirmDialog e previews; fila idempotente; seleção da edição; validação de destinatários e pagamento no servidor; conteúdo congelado antes da tentativa | Mensagens de acompanhamento, não campanhas promocionais. Não usa os endpoints legados de envio direto. Sem teste real ou custo nesta revisão. |
| Recursos | Área de acesso a materiais/gravações do projeto | CRUD por edição e acesso privado condicionado ao pagamento | Pesquisa, filtros de estado, datas, duplicação como rascunho; distingue carregamento/erro/sem conteúdo; evita atualizar outra edição após gravação assíncrona; valida URL sem credenciais no browser e no servidor | Não cria materiais fictícios. Gravações só online, até um ano. Proteção do ficheiro após abertura depende do alojamento. |

## Estratégia de acompanhamento

- Pagamento confirmado: confirmação e pedido de dados fiscais; uma hora depois, convite à sessão individual, antes do início da formação.
- Dois dias antes: informação prática específica da edição. Inscrições tardias recebem a informação enquanto ainda decorre a janela pré-evento.
- Um dia antes: SMS opcional, com consentimento, telefone válido e canal autorizado.
- Durante a formação: sem emails ou SMS automáticos.
- Um dia depois: acesso aos recursos reais disponíveis. No online, o worker exige também a gravação antes de enviar este email.
- Sete dias depois: convite à sessão individual incluída; catorze dias depois, SMS opcional enquanto a sessão estiver por agendar. Janela termina aos 30 dias.
- Agendar/concluir a sessão cancela lembretes pendentes. Pagamento reembolsado ou inscrição cancelada deixa de ser elegível. Pausar o contacto suspende comunicações sem interferir com a faturação.
- Editar templates altera apenas mensagens ainda não tentadas. Mensagens ambíguas mantêm-se em revisão para evitar duplicados.

## O que não é paridade literal

O webinar tinha fluxos de venda de planos/upsells e ações manuais específicas dessas ofertas. O curso é uma inscrição paga com duas sessões individuais incluídas: copiar essas campanhas criaria ofertas erradas. O editor do curso usa texto seguro, mantendo saudação, assinatura e links operacionais; não aceita HTML arbitrário. Importação de relatórios de SMS, reconciliação de entrega/aberturas e faturação em lote com aprovação fiscal ainda não têm equivalência integral no curso. Não se afirma que todas as funções do webinar foram reproduzidas nem que o resultado está “5x melhor”.

## Instalação coordenada

Migração aplicada no Lovable (verificação por leitura, sem dados de exemplo): `20260919090040_9988a0ca-e1eb-4a1b-9ad9-2acc888a72ce.sql`; função `course-operations` publicada com os helpers partilhados. O duplicado original foi removido, mantendo o identificador efetivamente aplicado pelo Lovable. Não ativa vendas, fornecedores, cron ou mensagens. Nenhuma migração desta revisão insere participantes, campanhas, custos, templates ou recursos de exemplo.

A publicação pública permanece dependente da resolução/verificação dos bloqueios de segurança legados já identificados e da homologação dos fornecedores. Também faltam links reais de agendamento, conteúdos finais e confirmação do cron. Não confundir uma interface visível com serviço de entrega ativo.

## Verificação

- TypeScript e build de produção.
- Suite de aplicação: autenticação/2FA, componentes originais, checkout e integração; novos testes de atribuição, calendário de Lisboa, coorte, templates e campanhas com fornecedor simulado.
- PGlite: migrações, RLS, preços, pagamento, isolamento, duplicados, custos, edição concorrente, pausa, templates e alterações seguras da fila.
- Navegador isolado: sete secções, desktop e 390 px, com pedidos externos bloqueados. Fixtures usadas exclusivamente nos testes, nunca inseridas no CRM.

Validação desta ronda: 108 testes de aplicação, 82 verificações SQL, TypeScript e build aprovados. O endereço local usa o backend e autenticação reais; as fixtures ficaram restritas aos ficheiros de teste.

No preview autenticado do Lovable, Dashboard, Pipeline, Tabela, Faturação, Automações, Comunicação e Recursos abriram com o backend real. Lisboa mostrou o template de confirmação com datas e local reais; não havia inscrições do curso. O serviço de envio continua identificado como “por verificar”, não como ativo.

A importação SMS do webinar chama `backfill-sms-logs`, cuja implementação não está neste repositório. Não foi assumido que esse botão demonstra um circuito de reconciliação funcional nem copiado um endpoint ausente para o curso.
