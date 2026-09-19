# Alterar a password de entrada no CRM

A autenticação mantém-se exatamente como está: email + password e, a seguir, o código de 6 dígitos da app de autenticação. Nada muda no ecrã nem nas regras de acesso.

Objetivo único: definir uma nova password para a conta fredericodigital@gmail.com.

## Sobre as três passwords

Uma conta só pode ter uma password ativa de cada vez — não é possível manter as três a funcionar em simultâneo. Indicou três variantes da mesma palavra, por isso vou usar a terceira, a mais completa (maiúscula, números e símbolo), que também abrange as outras duas em memória: se escrever qualquer uma das variantes mais simples, basta acrescentar o resto.

Se preferir uma das outras duas, diga qual e defino essa em vez desta. Nota: as duas versões mais simples constam de listas públicas de passwords comprometidas e podem ser recusadas caso ative essa proteção nas definições de contas.

## Como vai ser feito

1. Crio uma ação interna temporária no servidor que define a nova password da sua conta.
2. Executo-a uma única vez para o seu endereço.
3. Removo essa ação imediatamente a seguir, para não ficar nenhuma porta aberta.
4. Confirmo por leitura que a conta continua com permissão de administrador e com a verificação em dois passos ativa.

Depois disto entra em `/crm` com o seu email e a nova password, seguido do código de 6 dígitos habitual.

## Extra opcional

Posso acrescentar ao ecrã de entrada uma ligação "Esqueci-me da password", que envia um email de reposição. Assim, numa próxima vez, altera a password sozinho sem precisar de mim. Diga se quer.

## Detalhes técnicos

- Edge function temporária com service role a chamar `auth.admin.updateUserById`, protegida por um segredo de execução e apagada logo após a utilização. A password não é escrita em ficheiros do projeto nem em registos.
- Sem alterações a `CRMLogin.tsx`, `CRM.tsx`, políticas RLS ou requisito `aal2`.
- Nada é publicado no frontend; nenhuma mensagem comercial, pagamento ou fatura é gerada.
- A migração `legacy_rls_lockdown` continua parada em `migrations-draft`.
