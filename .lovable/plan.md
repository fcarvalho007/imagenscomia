# Alterar a password de entrada no CRM

A autenticação mantém-se exatamente como está: email + password e, a seguir, o código de 6 dígitos da app de autenticação. Nada muda no ecrã nem nas regras de acesso.

Objetivo único: definir uma nova password para a conta fredericodigital@gmail.com.

## Qual das três

Das opções que indicou, recomendo a terceira (a que tem letra maiúscula, números e símbolo). As outras duas são demasiado simples e constam de listas públicas de passwords comprometidas, pelo que podem ser recusadas se ativar a proteção de passwords comprometidas.

Se preferir outra, diga qual e uso essa.

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
