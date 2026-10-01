# Automações do Curso IA: navegação e novo início da sequência

## Como o sistema sabe que a pessoa pagou (confirmado)
O WordPress envia cada encomenda WooCommerce ao CRM com assinatura segura. Cada aviso inclui o estado (`pending`, `processing`, `completed`, `refunded`…), um indicador `paid` e a data de pagamento. A sequência só começa quando a encomenda chega marcada como paga. Inscrições submetidas mas não pagas não recebem mensagens.

Ponto a decidir: hoje, quando a encomenda vem do WooCommerce, o CRM **cancela** o email "Confirmação de pagamento" (`managed_by_woocommerce`), porque o WooCommerce já envia o recibo. O pedido muda isto: o novo email não é um recibo, é um agradecimento pessoal. O plano mantém o recibo e a fatura do lado do WooCommerce e passa a enviar este agradecimento pelo CRM.

## 1. Breadcrumbs e botão de voltar
No topo das Automações, depois de escolher uma edição:

```text
Automações  >  Lisboa · 19 NOV
[ < Voltar às edições ]
```
- "Automações" e "Voltar" levam de novo à escolha de edição.
- O mesmo trilho aparece nos separadores Templates e Pessoas quando há edição escolhida.

## 2. Nova ordem da sequência (pré-curso)
```text
Inscrição submetida (sem mensagens até ao pagamento)
  ↓ pagamento confirmado pelo WooCommerce
1 · Email de agradecimento — logo a seguir
    Agradece a confiança e assume o compromisso de corresponder às expectativas.
  ↓ imediatamente a seguir (só com consentimento e entre as 08h e as 20h)
2 · SMS — "Obrigado pela inscrição. Enviámos um email para agendarmos a 1.ª sessão individual."
  ↓ 1 hora depois
3 · Email: agendar a 1.ª sessão individual (Zoom)
    Pede ao participante que responda ao email com duas datas e horas convenientes.
    Sem Calendly. Responder usa o endereço de resposta já configurado (info@fredericocarvalho.pt).
  ↓ 48 horas antes
4 · Preparar a participação (email)
```
- O SMS das 24 horas antes deixa de existir; o SMS passa para logo a seguir ao agradecimento. Peço que confirme isto (ver pergunta abaixo).
- Os passos depois do curso (Dia 1, 7, 14, 30) ficam iguais.
- Os SMS continuam desligados até o problema da credencial (erro 401) ser resolvido. O passo aparece no fluxo, mas não envia nada.

## Textos propostos (pt-PT, para rever)
- Agradecimento — assunto: "Obrigado pela sua confiança". Corpo: agradece a inscrição na edição; "Farei tudo para corresponder às suas expectativas"; diz que segue um email para agendar a 1.ª sessão individual.
- SMS (até 160 caracteres, sem acentos): "Curso IA: obrigado pela inscricao! Enviamos um email para agendarmos a sua 1a sessao individual. Frederico Carvalho"
- Agendamento: "Responda a este email com duas datas e horas que lhe sejam convenientes para a primeira sessão individual por Zoom (cerca de X minutos)." A duração fica por definir: não a vou inventar.

## Pergunta em aberto
- O SMS de lembrete 24 horas antes do curso deve ser removido ou mantido, além do novo SMS?

## Detalhes técnicos
- `CourseOperations.tsx`: componente de breadcrumb com o shadcn `Breadcrumb` já existente e um botão para voltar, que limpa a edição escolhida e mostra a grelha de edições.
- `CourseAutomationFlow.tsx`: novos passos `thank_you` e `thank_you_sms`; `confirmation` sai do fluxo das encomendas WooCommerce.
- Migração: na receção de uma encomenda paga, juntar a `course_jobs` os passos `thank_you` (email, agora), `thank_you_sms` (SMS, agora, com a janela das 08h às 20h e o consentimento) e `individual_before` (agora + 1 h). Manter o cancelamento de `confirmation` e de `invoice` (`managed_by_woocommerce`). Os passos só são criados uma vez, com o mesmo controlo de duplicados da encomenda.
- `_shared/course/emails.ts` e `sms.ts`: novos templates `thank_you` e `thank_you_sms`; rever o texto de `individual_before` (responder com duas datas, Zoom); atualizar os rótulos.
- Testes: fluxo (ordem e breadcrumb), comércio (paga → agradecimento, SMS e agendamento; não paga → nada), `test-course-db`.
- Publicar `course-operations` e `course-wordpress-ingest`. Não publicar o frontend, não enviar mensagens e não ativar SMS.
