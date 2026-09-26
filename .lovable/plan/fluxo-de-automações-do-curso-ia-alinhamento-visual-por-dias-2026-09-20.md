# Fluxo de automações do Curso IA — alinhamento visual por dias

## Resposta direta

Sim, o fluxo foi criado em função da edição: as datas, contagens e templates derivam da edição selecionada (`course_editions`), e a sequência real é agendada por inscrição confirmada com base nas datas dessa edição (`queue_course_operations`). O que falta é a apresentação: hoje o fluxo mostra um único separador "Pré-evento/Pós-evento" com cartões genéricos, sem os grupos por dia (Dia 0, Dia 1, …) nem as datas calculadas que existem na vista do Vídeo IA.

## Objetivo

Dar à secção Automações do Curso IA o mesmo alinhamento visual da vista legada: fluxo sequencial vertical com grupos de dia, cores por fase, etiquetas de estado e datas reais calculadas a partir da edição.

## Alterações

### 1. `src/components/course/CourseAutomationFlow.tsx` (único componente alterado)

Reorganizar os 7 passos existentes (sem mudar a sequência real na base de dados) em grupos de dia com o padrão visual do legado:

- **PRÉ-CURSO** (azul) — gatilho "Inscrições submetidas", Confirmação de pagamento (imediato), Agendar 1.ª sessão individual (1h após pagamento), Preparar a participação (48h antes), Lembrete SMS (24h antes).
- **DIA 0 · INÍCIO DA FORMAÇÃO** (violeta) — marco com a data de início da edição; nota "sem mensagens automáticas durante a formação".
- **DIA 1 · PÓS-CURSO** (âmbar) — Continuar com os recursos (1 dia depois do fim).
- **DIA 7 · ACOMPANHAMENTO** (âmbar) — Agendar a sessão de acompanhamento.
- **DIA 14 · LEMBRETE** (âmbar) — SMS da sessão individual.
- **DIA 30 · FECHO** (vermelho) — fim do acompanhamento; lembretes fora do prazo cancelados.

Detalhes:

- Datas reais por grupo calculadas de `startsAt`/`endsAt` da edição (hora de Lisboa), em vez de textos fixos.
- Cartões com borda lateral colorida por grupo, ícone email/SMS, contadores clicáveis (Agendados / Aceites / Bloqueados / A verificar) e botão "Ver email/SMS e template" — mantém os callbacks `onPreview`/`onPeople` existentes.
- Remover o alternador Pré/Pós: o fluxo passa a ser uma única linha temporal, como no Vídeo IA.
- Manter o aviso legal no rodapé e o estado "Sequência autorizada / em pausa".

### 2. Testes — `src/components/course/CourseAutomationFlow.test.tsx`

- Atualizar para a nova estrutura: grupos de dia presentes e ordenados, datas calculadas por edição (ex.: Lisboa 29–30 out → Dia 1 = 31 out), contadores por estado, chamadas de preview/pessoas.
- Correr `npm test`, `tsgo` e build.

## Fora de âmbito

- Nenhuma alteração à sequência real (trigger `queue_course_operations`), templates, flags ou envios.
- Sem novas migrações, sem deploy de funções, sem publicar o frontend.
- Vista legada Vídeo IA intocada.

## Detalhes técnicos

- A sequência real continua a ser agendada por `queue_course_operations` a partir de `course_editions.starts_at`/`ends_at`; o componente apenas passa a apresentar esses mesmos offsets por dia.
- Tokens de cor via classes utilitárias já usadas no componente; pt-PT, sentence case.
