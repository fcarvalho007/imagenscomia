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
- [x] Consultas públicas diretas migradas para funções estreitas com token: recursos (3 áreas), confirmação, sessão ao vivo, faturação, upgrade, upgrade-vídeo e upgrade-gravação. Bypass por email de administrador removido.
- [x] Recuperação de acesso por email envia apenas ligação (legacy-access-link), com destino em lista fixa e limite 10 min / 3 por dia; nunca devolve dados nem token.
- [x] register-free devolve token ao próprio, create-payment exige token e webinar correto sem alterar plano pago, group checkout não sobrescreve registos alheios, generate-reminder exige administrador com MFA.
- [x] Analytics: InitiateCheckout no arranque do checkout; Purchase só com pagamento confirmado e deduplicado por transação.
- [x] CRM exige MFA efetivamente verificada; páginas públicas leem apenas a vista pública de definições.
- [x] 16 testes unitários novos da recuperação de acesso e da posse de token; nome e ligação escapados no email; destinos validados por propriedade própria.
- [ ] Publicar legacy-access-link, create-payment, register-free, generate-reminder (a aguardar autorização; nada publicado).
- [ ] Aplicar a migração apenas com os percursos públicos adaptados e testados. Ficheiro permanece em supabase/migrations-draft, fora da instalação automática.

A segurança das tabelas antigas NÃO está resolvida em produção por este rascunho. Não publicar como se a integração estivesse encerrada nem executar o SQL isoladamente. Os pedidos anteriores em fila no Lovable estão pausados e são substituídos por este estado consolidado.

## Conferência final de integração (19 set, CONCLUÍDA)
- [x] Componentes verificados: CourseAutomationFlow, CourseOperations, ComunicacaoView e restantes presentes e a compilar
- [x] Migrações 20260919090040 e 20260919092733 confirmadas como aplicadas; duplicada 20260919110000 removida e caminho atualizado em scripts/test-course-db.mjs
- [x] Testes: 112 aplicação + 90 BD + tipos + build, tudo a passar
- [x] Nenhuma migração em falta; nenhuma função nova publicada (course-operations já estava atualizada)
- PENDENTE (reservado ao titular): pedidos de password/autenticação

## Comunicação do Curso IA (revisão) — concluída em código, sem ativações
- [x] Painel "Enviar teste para mim" (email para a sessão, SMS para 915015508), limite atómico, registo separado, idempotência.
- [x] Editor visual com sanitização partilhada cliente/servidor e indicador de formato (texto simples / texto formatado).
- [x] Diagnóstico de configuração e worker; guião de cron idempotente (não instalado).
- [ ] Ativar canais e agendamento — decisão do titular.

## Plano "10 pontos Curso IA" (21 set, aprovado) — ponto 9 concluído
- [x] Painel de diagnóstico reforçado: aviso de canais desligados, alerta de processo atrasado (>15 min) ou com falha, tabela de envios por estado e edição. Função course-diagnostics publicada. 147 testes + tipos a passar.
- [ ] Pontos 1, 2, 4, 7, 10 bloqueados em ações/decisões do titular (ligações por edição, credencial SMS, COURSE_WP_BRIDGE_SECRET, vendas reais, publicação).
- [ ] Ponto 3: fecho RLS do legado em rascunho, à revisão do titular.
- [ ] Pontos 5, 6, 8: textos das mensagens, percurso ponta a ponta, integrar 99 verificações SQL do titular.
