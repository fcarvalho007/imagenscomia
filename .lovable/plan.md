# Alterar a password de fredericodigital@gmail.com

A autenticação mantém-se exatamente como está: email e password e, a seguir, o código de seis dígitos da aplicação de autenticação. Nada muda no ecrã de entrada nem nas permissões.

## Sobre as três passwords

Uma conta só pode ter uma password ativa de cada vez, por isso não é possível deixar as três a funcionar em simultâneo. As três indicadas são variantes da mesma palavra.

Vou definir `Click123@`, a mais completa, por dois motivos: inclui maiúscula, números e símbolo, e as outras duas constam de listas públicas de passwords comprometidas, pelo que poderiam vir a ser recusadas caso ative essa proteção nas definições de contas.

Se preferir outra das três, diga qual antes de aprovar e defino essa em vez desta.

## Como será feito

1. Criar uma ação interna temporária no servidor, protegida por um segredo de execução, que altera a password da conta indicada com permissões administrativas.
2. Executá-la uma única vez para essa conta.
3. Apagar a ação logo a seguir, para não ficar nenhuma porta aberta.
4. Confirmar por leitura que a conta continua com permissão de administrador e com a verificação em dois passos ativa.

## O que não é tocado

Ecrã de entrada, regras de acesso aos dados, exigência de verificação em dois passos, opções de vendas, email, SMS, faturação e agendamento automático, dados existentes e frontend publicado. Nenhuma mensagem é enviada, nenhuma fatura emitida. A migração de bloqueio do legado continua parada na pasta de rascunho. A password não será mostrada em registos do servidor.
