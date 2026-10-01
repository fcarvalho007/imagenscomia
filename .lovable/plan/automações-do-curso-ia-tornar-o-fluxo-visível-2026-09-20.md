# Automações do Curso IA — tornar o fluxo visível

## Resposta à dúvida

O fluxo **já está criado**. Não é preciso construir nada de raiz.

O que acontece é que ele só aparece depois de escolher uma edição na barra lateral. Com "Todas as edições" selecionado, o ecrã mostra apenas os três cartões informativos (Lisboa, Porto, Online) — e esses cartões são texto simples, não são botões, por isso clicar neles não faz nada. Daí a sensação de que falta o fluxo que existe no Vídeo IA.

Falta apenas uma ronda de acabamento na apresentação.

## O que vai mudar

1. **Cartões das edições passam a ser clicáveis.** Clicar em Lisboa, Porto ou Online seleciona essa edição (igual a escolhê-la na barra lateral) e abre logo o fluxo sequencial dessa edição. O cartão da edição ativa fica destacado.
2. **Com "Todas as edições" passa a haver conteúdo útil.** Acima dos cartões, uma linha explícita: "Escolha uma edição para ver o fluxo sequencial de contacto", e cada cartão mostra as datas da edição e o estado da sequência (autorizada/em pausa), em vez da frase que remete para a barra lateral.
3. **Texto de apoio corrigido** na secção de baixo, que hoje diz "Selecione Lisboa, Porto ou Online…" mesmo quando já não é preciso ir à barra lateral.
4. **Sem alterações** ao fluxo em si, aos contadores, aos templates, ao Vídeo IA, a envios, flags, migrações ou backend.

## Rondas necessárias

**Uma ronda.** É trabalho só de apresentação em dois ficheiros:

- `src/components/course/CourseOperations.tsx` — cartões clicáveis, estado da edição ativa, datas.
- `src/pages/CourseCRM.tsx` — texto de apoio e passagem da função de seleção de edição.
- `src/components/course/CourseOperations.test.tsx` — testes de clique no cartão e de o fluxo aparecer depois.

Validação: testes da aplicação, verificação de tipos e compilação. Sem publicar frontend, sem envios, sem tocar em SMS, pagamentos ou faturação.

## Notas técnicas

O `CourseAutomationFlow` está condicionado a `tab==="fluxo" && selected`, e `selected` deriva de `edition` (vazio em "Todas as edições"). O bloco `!edition && loaded` renderiza `<div>` estáticos. A correção é converter esses cartões em `<button>` que chamam o `onEditionChange` já existente na `CRMSidebar`, elevando esse callback para o `CourseOperations` via prop.
