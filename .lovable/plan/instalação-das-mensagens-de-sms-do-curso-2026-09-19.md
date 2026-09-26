# Instalação das mensagens de SMS do curso

Área de trabalho relida: o ficheiro `20260919110000_course_sms_templates.sql` já está sincronizado, o envio de SMS já consulta a nova tabela e o novo ecrã de fluxo de automações está presente. Não vou escrever nenhuma versão alternativa.

## O que vou executar

1. Aplicar a instalação tal como está no ficheiro sincronizado, uma única vez, sem reescrever o conteúdo. Cria a tabela de textos de SMS por edição (véspera e acompanhamento), com limite de um segmento e sem caracteres especiais, e a operação para guardar cada texto com proteção contra gravações simultâneas.
2. Publicar apenas a função `course-operations`, com os módulos partilhados atuais.
3. Verificar por leitura: existência da tabela e da operação, leitura restrita a administrador com verificação em dois passos, execução negada a visitantes anónimos e permitida a administradores, e zero registos criados.

## O que não é tocado

Autenticação e password, credenciais, opções de vendas, email, SMS, faturação e agendamento automático, dados existentes, frontend publicado e os ecrãs já sincronizados. Nenhuma mensagem enviada, nenhuma fatura emitida, nenhum participante ou campanha de teste criado. A migração de bloqueio do legado continua parada na pasta de rascunho.
