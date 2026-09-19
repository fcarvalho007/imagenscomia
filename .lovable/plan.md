# Entrada no CRM apenas com email

Objetivo: remover a password da entrada em `/crm`. Só dois endereços podem entrar:

- comunicacao@fredericocarvalho.pt
- fredericodigital@gmail.com

Sem password e sem link mágico clicável.

## Como fica o ecrã de entrada

1. Um único campo: email.
2. Se o email não estiver na lista permitida, mensagem genérica de acesso restrito.
3. Se estiver, o sistema envia um código de 6 dígitos para esse email e mostra os mesmos quadrados de código que já existem hoje.
4. Código correto, entra. Nada de password, nada de link para clicar.

O visual atual (caixa escura, logótipo WebinarCRM, botão azul, campos de código) mantém-se tal como está.

## Ponto importante antes de avançar

Há duas formas de fazer isto e mudam o nível de proteção:

- **Opção A — email + código de 6 dígitos (recomendada).** Continua a ser "só o email" do ponto de vista de quem entra: escreve o endereço e recebe o código nessa caixa de correio. Quem não tiver acesso à caixa não entra. É a única forma de manter os dados de inscritos, pagamentos e faturação protegidos.
- **Opção B — só escrever o email, sem qualquer verificação.** Qualquer pessoa que conheça um dos dois endereços entra no CRM a partir de qualquer computador. Além disso, as regras atuais da base de dados exigem verificação em dois passos para ler inscritos, faturação e comunicação; para esta opção funcionar seria preciso baixar essas regras, o que expõe os dados internos e reabre exatamente os problemas críticos identificados na revisão de segurança.

O plano abaixo assume a Opção A. Diga se prefere a B e ajusto, assumindo o risco descrito.

## O que muda em concreto

- Ecrã de entrada: sai o campo de password e o olho de mostrar/esconder; fica só o email e o passo do código.
- Os dois endereços ficam definidos como lista permitida no ecrã e validados também do lado do servidor, para a lista não poder ser contornada pelo navegador.
- A conta do endereço comunicacao@ passa a ter permissão de administrador, tal como a existente, para poder consultar o CRM.
- O passo do autenticador (app de códigos) deixa de ser pedido; o código enviado por email passa a ser a segunda prova.
- O botão de sair continua igual.

## Detalhes técnicos

- Ativar o início de sessão por código de email (OTP de 6 dígitos, `shouldCreateUser: false`), sem `emailRedirectTo`, para não gerar ligação clicável.
- `src/components/crm/CRMLogin.tsx`: remover `signInWithPassword` e os ecrãs de TOTP; passar a `signInWithOtp` + `verifyOtp` reutilizando o componente `InputOTP` já existente.
- `src/pages/CRM.tsx`: substituir a verificação `aal2` por sessão válida + `has_role(admin)`.
- Base de dados: substituir a condição `auth.jwt()->>'aal'='aal2'` nas funções e políticas internas por uma verificação de administrador na lista permitida, mantendo tudo fechado a anónimos. Migração preparada e revista antes de aplicar.
- A migração `legacy_rls_lockdown` continua parada em `migrations-draft`, sem ser aplicada.
- Nada de envios comerciais, pagamentos, faturas ou alterações às opções do curso.

## Fora deste plano

- Páginas de recursos (`/recursos`, `/recursos-video`, `/recursos-masterclass`) mantêm-se como estão. Diga se também quer a mesma entrada por email nessas três páginas.
- Componentes originais do WebinarCRM, LP1/LP2 no WordPress e o módulo do Curso IA não são tocados.
