# Instalação das automações do curso — já concluída

## Estado verificado agora

A instalação pedida já está feita; verifiquei por leitura neste momento:

- O ficheiro `supabase/migrations/20260919110000_course_sms_templates.sql` existe no repositório (sincronizado do commit b4cbdc0).
- A migração **já está aplicada na base de dados**: a tabela de textos de SMS do curso existe, a operação de gravação de textos (RPC) existe, e não há nenhuma linha de dados criada (0 registos).
- A função de servidor `course-operations` já foi publicada com os módulos partilhados atuais na ronda anterior.

Aplicar a migração outra vez falharia (os objetos já existem) e voltar a publicar a função não mudaria nada.

## O que este plano faz

1. **Nada a aplicar** — nenhuma migração nova, nenhum deploy novo, nenhum ficheiro alterado.
2. Confirmar por leitura, em relatório final:
   - tabela de textos de SMS com proteção de linhas ativa e leitura restrita a administrador com verificação em dois passos (aal2);
   - RPC de gravação de textos com validação de texto e exigência de administrador aal2;
   - zero dados de teste (sem participantes, campanhas ou textos criados);
   - nenhuma migração duplicada no repositório — não é preciso criar equivalente timestamped nem tocar em `scripts/test-course-db.mjs`.
3. O pedido de autenticação/password fica **pendente e intocado**, como pediu.

## O que este plano NÃO faz

- Não publica frontend, não altera layouts.
- Não altera flags de vendas, envios, faturação ou cron.
- Não contacta fornecedores nem envia mensagens.
- Não cria credenciais, participantes, campanhas ou dados de teste.
- Não toca na migração `legacy_rls_lockdown` (continua em rascunho).

## Nota técnica

Verificações feitas via consultas de leitura ao catálogo da base de dados e às políticas de acesso; nenhuma escrita será executada.
