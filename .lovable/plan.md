

# Diagnóstico: Discrepância entre SMS enviado e texto visível no CRM

## O que aconteceu

O SMS foi enviado às **08:44 UTC** (antes da minha última actualização do código). Confirmei 20 envios com `template_key: sms_recursos_post` nesse timestamp.

A causa raiz é o sistema de **drafts em localStorage**:

```text
Fluxo de decisão do texto SMS (linha 968):
  1. customText (passado directamente)  ← prioridade máxima
  2. customSmsTexts[tplKey]            ← draft guardado em localStorage
  3. config.smsText                    ← texto default no código
```

Quando gravaste um draft personalizado **antes** da minha actualização, esse texto antigo ficou guardado no `localStorage` do browser (chave `crm_sms_drafts`). O código actualizado mudou o **default** (ponto 3), mas o localStorage (ponto 2) tem prioridade — logo, o SMS enviado usou o texto antigo com "gravação" e "imagenscomia.com/recurso" (URL truncada/errada).

No CRM, o texto visível mostra o default actualizado **apenas se não houver draft guardado**. Se houver, mostra o draft (com badge "✎ Texto personalizado").

## Problemas identificados

1. **Texto antigo no localStorage** — draft com "gravação e materiais" sobrepõe-se ao default actualizado
2. **URL errada no SMS enviado** — "imagenscomia.com/recurso" em vez de "imagenscomia.com/recursos-video"
3. **Sem mecanismo de invalidação** — quando o default muda no código, drafts antigos no localStorage nunca são limpos

## Plano de correção

### A. Invalidar drafts obsoletos automaticamente
Adicionar lógica no `AutomationFlowTab.tsx` que compara o draft guardado com o default anterior. Se o default mudou (via hash ou versão), limpar o draft automaticamente para que o novo default seja usado.

Implementação simples: guardar no localStorage não só o texto mas também o default de referência. Se o default actual não coincidir com o de referência, descartar o draft.

### B. Alternativa mais simples (recomendada)
Limpar todos os drafts SMS existentes ao carregar o componente, dado que os defaults foram todos reescritos. Adicionar um `SMS_DRAFT_VERSION` constante — quando mudar, limpa o localStorage.

```typescript
const SMS_DRAFT_VERSION = 2; // bump when defaults change
// On mount: if stored version !== current, clear drafts
```

### C. Nenhuma alteração nos SMS já enviados
Os 20 SMS já foram entregues com o texto antigo — isto não pode ser revertido. A correção garante que envios futuros usem sempre o texto correcto.

## Ficheiros a alterar

1. **`src/components/crm/AutomationFlowTab.tsx`** — adicionar versionamento de drafts SMS com limpeza automática quando a versão muda

