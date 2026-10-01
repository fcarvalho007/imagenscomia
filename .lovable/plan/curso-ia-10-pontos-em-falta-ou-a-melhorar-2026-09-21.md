# Curso IA — 10 pontos em falta ou a melhorar

## Trabalho identificado (por prioridade)

1. **Preencher as ligações por edição** — nas três edições (Lisboa, Porto, Online) faltam `join_url`, `resources_url`, `recordings_url`, `before_url` e `after_url`. Sem elas, várias sequências de email ficam retidas. Decisões por definir: plataforma da sessão online (Zoom/outra), local do Porto, e onde ficam os materiais e gravações.

2. **Corrigir a credencial de SMS** — o teste devolve 401 (credencial inválida/expirada no fornecedor SMSOnline). O titular precisa de atualizar a credencial na conta do fornecedor e confirmar que o remetente do curso está registado (o legado usava IMAGENSIA). Sem isto, os SMS automáticos e de teste não funcionam.

3. **Fechar a revisão de segurança do legado** — a parte das operações de acesso já está instalada, mas o fecho das permissões das tabelas antigas (registrations, invoice_details, webinar_settings) continua em rascunho à revisão do titular. Inclui corrigir os avisos do relatório de segurança (funções internas executáveis, vista pública, proteção contra passwords comprometidas desligada).

4. **Preencher o segredo da ponte WordPress** — `COURSE_WP_BRIDGE_SECRET` continua vazio; sem ele, as inscrições vindas do WordPress (LP1/LP2) não entram no sistema.

5. **Definir e preencher os textos das mensagens do curso** — os modelos de email e SMS do curso precisam de revisão de conteúdo real (confirmação, preparação, recursos, acompanhamento, lembretes) antes de haver inscritos reais.

6. **Validar o percurso completo de ponta a ponta** — com um inscrito de teste marcado como teste: inscrição → pagamento sandbox → confirmação → emails das sequências → recursos. Hoje há zero inscritos; todo o fluxo só foi validado em testes automáticos.

7. **Ativar vendas reais quando autorizado** — checkout, faturação e envios reais continuam desligados por decisão do titular. Ligar exige: EuPago em produção, faturação configurada e um teste de compra real controlado.

8. **Integrar as 99 verificações SQL locais do titular** — existem testes de percurso e deduplicação nas três edições guardados localmente, por juntar a `scripts/test-course-db.mjs`.

9. **Painel de saúde operacional** — o diagnóstico existe, mas pode ganhar: alerta quando uma execução agendada falha, contagem de emails enviados/falhados por edição, e indicação clara de canais desligados no topo do CRM.

10. **Publicação do frontend** — todo o trabalho recente (Automações por dia, Links, ligações de teste, editor melhorado) está apenas na pré-visualização. Publicar exige validação final do titular e permanece bloqueado até ordem expressa.

## 5 perguntas para refinar o projeto

1. Qual a plataforma da sessão online e das sessões individuais — Calendly, Zoom, outra? Sem isto não preencho as ligações nem os textos que as mencionam.
2. Onde vão viver os materiais e as gravações do curso (Vimeo, como no Vídeo IA, ou outro sítio), e quem os carrega?
3. Quer manter o complemento de 67 € + IVA apenas como demonstração, ou passa a ser uma oferta real do curso? Isso muda checkout, faturação e textos.
4. Quem escreve/valida os textos finais dos emails e SMS das sequências — o titular sozinho, ou quer uma proposta de rascunho meu para rever?
5. Qual a data limite real para ter inscritos reais a entrar pelo WordPress? Isso define a ordem: ponte WordPress e credenciais primeiro, ou segurança do legado primeiro.

## Notas

- Nenhum item desta lista implica enviar mensagens, criar dados de teste reais ou publicar o frontend sem autorização.
- Pedidos de autenticação/passwords ficam reservados ao titular e fora deste plano.
