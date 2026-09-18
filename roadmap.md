# Estado técnico — 18 setembro 2026

## Curso IA
- [x] 7 migrações canónicas instaladas e funções do curso publicadas.
- [x] Plugin WordPress 0.6.1 instalado com LP1/LP2 aprovada.
- [x] Remetente existente e resposta info@fredericocarvalho.pt configurados.
- [x] 65 testes de aplicação, 53 verificações DB do curso e 20 testes dos handlers, sem fornecedores.
- [x] Seis cenários de checkout de demonstração, incluindo telemóvel, sem inscrições ou cobranças reais.
- [ ] Chave da ponte WordPress/backend: criação e submissão pelo titular.
- [ ] Credenciais e configuração do canal/worker do curso; verificação da ligação e do agendamento.
- [ ] Links definitivos de sessões individuais, acesso às sessões online, recursos/gravações e condições de inscrição.
- [ ] Publicação do frontend e ativação comercial após integração completa. Todos os canais do curso continuam desligados.

## Segurança do legado
- [x] Funções de envio protegidas por autenticação verificada; cinco funções adicionais publicadas nesta ronda.
- [x] Callback Eupago clássico exige chave_api válida; POST 2.0 exige assinatura. EUPAGO_API_KEY existente; EUPAGO_WEBHOOK_KEY ainda ausente. Nenhuma transação real foi testada.
- [x] Rascunho SQL de RLS revisto: não autoriza por email, exige token existente para dados próprios, protege planos já pagos e separa administrador com MFA.
- [x] 67 testes SQL isolados do rascunho, com grants equivalentes aos públicos e verificação de RLS real.
- [ ] Migrar consultas públicas diretas e implementar recuperação segura de acesso nas páginas antigas. Rever também create-payment/register-free/group checkout antes da ativação desta migração.
- [ ] Aplicar a migração apenas com os percursos públicos adaptados e testados. Ficheiro permanece em supabase/migrations-draft, fora da instalação automática.

A segurança das tabelas antigas NÃO está resolvida em produção por este rascunho. Não publicar como se a integração estivesse encerrada nem executar o SQL isoladamente. Os pedidos anteriores em fila no Lovable estão pausados e são substituídos por este estado consolidado.
