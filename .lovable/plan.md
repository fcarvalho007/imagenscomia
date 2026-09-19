# Instalação das mensagens de SMS do curso

Pedido independente. A alteração de password fica pendente e não é tocada nesta ronda.

## Situação encontrada

O ficheiro `20260919110000_course_sms_templates.sql` não existe no projeto: o commit b4cbdc0 ainda não chegou à área de trabalho sincronizada. A revisão anterior está aplicada e o ficheiro da paridade foi registado com o nome `20260919090040_...`.

Também não existe qualquer tabela ou operação de textos de SMS no código atual: as duas mensagens (véspera e acompanhamento aos 14 dias) continuam fixas no código partilhado.

Há dois caminhos.

## Opção A — sincronizar primeiro (preferível)

Envie o commit b4cbdc0 para a branch ligada. Assim que o ficheiro aparecer, aplico-o exatamente como está, sem reescrever nada, e sigo para a publicação e verificação.

## Opção B — gerar a instalação equivalente agora

Se preferir não esperar, escrevo eu a instalação equivalente, seguindo o mesmo padrão dos textos de email já instalados, e fica apenas essa versão registada:

- Nova tabela de textos de SMS por edição, com as duas mensagens permitidas (véspera e acompanhamento), limite de um segmento e sem caracteres especiais.
- Nova operação interna para guardar cada texto, com proteção contra gravações simultâneas.
- Leitura e gravação restritas a administrador com verificação em dois passos; visitantes anónimos sem qualquer acesso.
- Nenhum texto de exemplo é criado: sem registo gravado, mantém-se a mensagem atual.

## A seguir, em qualquer dos casos

1. Ligar o envio de SMS ao texto gravado, quando existir, mantendo os limites atuais (um segmento, sem acentos, consentimento obrigatório).
2. Publicar apenas a função `course-operations`, com os módulos partilhados atuais.
3. Verificar por leitura: existência da tabela e da operação, políticas de administrador com dois passos, negação a anónimos, e zero registos criados.
4. Atualizar `scripts/test-course-db.mjs` com as verificações correspondentes.

## Fora desta instalação

Nada é publicado no frontend; vendas, email, SMS, faturação e agendamento automático continuam desligados; nenhuma mensagem é enviada; nenhuma fatura é emitida; nenhum participante ou campanha de teste é criado; nenhuma password é alterada; a migração de bloqueio do legado continua parada na pasta de rascunho; os ecrãs já sincronizados mantêm-se intactos.
