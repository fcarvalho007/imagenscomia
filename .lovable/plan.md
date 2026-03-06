

# Adicionar SMS de Recursos por plano na timeline de Automações

## O que muda

Inserir **3 nodes SMS** na timeline de Automações (ficheiro `AutomationFlowTab.tsx`), logo após os respectivos nodes de email de Recursos. Cada um terá texto pré-preenchido e diferenciado por plano.

## Nodes a adicionar

### 1. SMS Recursos — Premium Pass (após linha 288, node "Recursos — Premium Pass")
- **Filtro**: `planFilter: ["premium"]`
- **Texto SMS**: `Ola! Ja tens acesso a gravacao, workbook e guia GEMs em imagenscomia.com/recursos-video — usa o email de registo para entrar. Lembra-te: sessao Q&A amanha (terca, 10 Mar) as 14:30. Ate ja! — Frederico`

### 2. SMS Recursos — Masterclass (após node "Recursos — Masterclass")
- **Filtro**: `planFilter: ["masterclass"]`
- **Texto SMS**: `Ola! A Masterclass e na quinta, 12 de Marco, as 10h. O link sera enviado na vespera por email. Confirma no teu calendario: calendar.app.google/qX6CxAwxafWHNEaYA — Frederico`

### 3. SMS Recursos — Bundle (após node "Recursos — Bundle")
- **Filtro**: `planFilter: ["bundle"]`
- **Texto SMS**: `Ola! Ja tens acesso a gravacao e materiais em imagenscomia.com/recursos-video — usa o email de registo. A Masterclass e quinta 12 Mar as 10h (link na vespera). Sessao Q&A: terca 10 Mar as 14:30. Ate ja! — Frederico`

## Ficheiro alterado

- `src/components/crm/AutomationFlowTab.tsx` — inserir 3 nodes SMS com `channel: "sms"` e `smsSendConfig` após cada node de Recursos correspondente

## Notas

- Os SMS **não são enviados automaticamente** — mantêm o botão manual existente ("Enviar SMS agora")
- O texto aparece visível no card da timeline e pode ser editado antes do envio (draft guardado em localStorage, como os outros SMS nodes)
- Links do Q&A e Masterclass nunca vão para inscritos gratuitos (filtro por plano garante isso)

