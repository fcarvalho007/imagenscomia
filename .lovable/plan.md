# Acesso total de teste para fredericodigital@gmail.com

## O que encontrei

- O seu email já existe na base de dados com duas inscrições (Imagens IA e Vídeo IA), ambas **sem** acesso premium e sem pagamento registado. Por isso as páginas reservadas não abrem.
- Descoberta importante: as páginas de recursos, upgrades e confirmação passaram, na revisão de segurança, a usar operações de acesso que **ainda não existem na base de dados** (ficaram no rascunho por rever). Neste momento essas páginas não abrem para ninguém, nem com a ligação pessoal. É preciso instalar essas operações para o acesso voltar a funcionar — para si e para os participantes.

## O que proponho fazer

### 1. Instalar as operações de acesso em falta
Aplicar apenas a parte do rascunho que cria as operações de leitura/gravação por ligação pessoal (procurar inscrição, guardar respostas, acesso a recursos, faturação). Não inclui o fecho de permissões das tabelas antigas — essa parte continua em rascunho à sua revisão, para não arriscar quebrar percursos públicos.

### 2. Dar acesso completo ao seu email
Nas duas inscrições do seu email:
- ativar o acesso premium (masterclass, gravação, recursos, recursos da masterclass);
- marcar como pago para fins de acesso, com valor 0 e origem identificada como teste, para não contaminar receita nem métricas de vendas;
- manter as ligações pessoais já existentes (não são recriadas).

Fica com acesso a: sessão ao vivo, masterclass, gravação, recursos, recursos da masterclass, upgrades e páginas de confirmação.

### 3. Secção "Links" com as suas ligações de teste
Na secção **Links** do menu do CRM (visível só a administrador com verificação em dois passos), acrescentar um bloco **Ligações de teste (a sua conta)** com as ligações pessoais completas — as que incluem a chave de acesso — para cada página reservada de cada webinar, com botões copiar e abrir. Assim testa tudo com um clique.

### 4. Checkout inicial
O checkout (`/comprar`) é público e não exige ligação pessoal: fica também listado na secção Links, com os parâmetros de plano, para rever o percurso de compra desde o início. Não mexo no desenho nem nos preços.

## Detalhes técnicos

- Migração: nova migração com apenas as funções `legacy_reg_lookup`, `legacy_reg_session`, `legacy_reg_save_step`, `legacy_recursos_access`, `legacy_reg_attendance`, `legacy_invoice_get` (extraídas do rascunho `20260918190000_legacy_rls_lockdown.sql`), com `grant execute` a `anon`/`authenticated` e sem alterar RLS das tabelas legadas.
- Dados: `UPDATE` nas duas linhas de `registrations` do email indicado (`premium_unlocked`, `paid_at`, `paid_amount=0`, `registration_source='teste-admin'`, `premium_granted_by`). Nenhuma linha criada.
- Frontend: novo bloco em `src/components/crm/WebinarLinks.tsx` que lê as ligações do próprio administrador através de uma operação restrita a admin com dois passos, mais testes.
- Nada de envios, pagamentos, faturas ou publicação de frontend. Testes, tipos e compilação executados no fim.

## Limites

- Não altero autenticação, passwords nem o fecho de permissões das tabelas antigas.
- Não toco em LP1/LP2 no WordPress nem no design do checkout.
