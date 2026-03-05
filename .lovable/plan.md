

# Bug: /upgrade-gravacao Step 1 bloqueado — botão "Próximo passo" nunca activa

## Causa raiz

O componente `StepQualification` tem esta condição para permitir avançar:

```js
const canProceed = !!(role && teamSize && (!isOtherRole || otherRole.trim()));
```

No entanto, a página `UpgradeGravacao` **não passa** as props `role`, `setRole`, `teamSize` nem `setTeamSize` ao componente. Como `role` e `teamSize` são `undefined`, `canProceed` é **sempre `false`**, e o botão fica permanentemente desactivado (cinzento).

Este bug foi introduzido quando o `StepQualification` foi actualizado para suportar o funil de vídeo (com role/teamSize obrigatórios), mas o funil de gravação (imagens) não foi actualizado para passar essas props.

## Solução

No funil `/upgrade-gravacao`, o Step 1 só precisa das **sources** (como soubeste da formação). Não precisa de role/teamSize.

**Ficheiro:** `src/components/upgrade/StepQualification.tsx`

Alterar a lógica de `canProceed` para que, quando `setRole` não é fornecido (modo gravação/imagens), o botão avance sem exigir role e teamSize:

```js
const canProceed = setRole
  ? !!(role && teamSize && (!isOtherRole || otherRole.trim()))
  : true; // sources mode — always allow (optional question)
```

Esta alteração de 1 linha corrige o bloqueio sem afectar o funil de vídeo (`/upgrade-video`), onde `setRole` é passado e as perguntas de role/teamSize continuam obrigatórias.

### Ficheiros alterados
- `src/components/upgrade/StepQualification.tsx` — corrigir lógica de `canProceed`

