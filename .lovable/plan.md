

# Reestruturar o funil /upgrade-video

## Problema 1: Erro de acesso

Quando se acede a `/upgrade-video` sem parametros de email no URL, aparece o ecra de recuperacao. Funciona correctamente — basta introduzir o email. O erro na consola (ref warning no WhatsAppSupportButton) e apenas um aviso de React, nao impede o funcionamento. Vou corrigi-lo tambem.

## Problema 2: Nova ordem dos passos

### Fluxo actual (4 passos)
1. Qualificacao (sources + role + team)
2. Upsell gravacao 15 EUR
3. Upsell masterclass 47 EUR
4. Confirmacao/pagamento

### Novo fluxo pedido (5 passos)

| Passo | Conteudo |
|---|---|
| 1 | Titulo grande "ESPERE..." + perguntas de role e equipa (sem a pergunta "como soubeste") |
| 2 | Upsell masterclass **47 EUR** (troca de ordem) |
| 3 | Upsell gravacao **15 EUR** (troca de ordem) |
| 4 | Pergunta aberta: "Qual a maior duvida que este webinar pode ajudar a resolver?" (campo `duvida` ja existe na BD) |
| 5 | Confirmacao/pagamento (se algo foi seleccionado) |

Se no passo 2 e 3 nao seleccionar nada, o passo 4 (duvida) continua a aparecer e depois redireciona para a confirmacao gratuita.

---

## Alteracoes tecnicas

### 1. `src/components/upgrade/StepQualification.tsx`
- Remover a seccao "Como soubeste desta formacao?" (sources) — fica so role + team
- Mudar o titulo para "ESPERE..." em tamanho grande, com subtitulo explicativo
- Manter role e team_size obrigatorios

### 2. `src/pages/UpgradeVideo.tsx`
- Mudar `totalSteps` de 4 para 5
- Nova sequencia:
  - Passo 1: StepQualification (role + team, sem sources)
  - Passo 2: StepMasterclass (47 EUR) — era passo 3
  - Passo 3: StepVideoPremium (15 EUR) — era passo 2
  - Passo 4: Novo componente StepDuvida (pergunta aberta)
  - Passo 5: VideoConfirmation (pagamento)
- Actualizar labels da progress bar para reflectir a nova ordem
- Actualizar logica de `saveStepData` e `plan_selected` para a nova sequencia
- Actualizar a logica de recovery (restaurar step correcto)
- Remover props `sources`/`setSources`/`otherSource`/`setOtherSource` do StepQualification (ja nao sao necessarias neste fluxo)

### 3. Novo componente `src/components/upgrade/StepDuvida.tsx`
- Campo textarea com a pergunta "Qual a maior duvida que este webinar pode ajudar a resolver?"
- Botao "Seguinte" (campo opcional — pode saltar)
- Guarda na coluna `duvida` da tabela `registrations`

### 4. `src/components/landing/WhatsAppSupportButton.tsx`
- Corrigir o warning de ref: o componente `WhatsAppIcon` nao aceita refs — nao precisa de alteracao porque o warning vem do framer-motion/React tentando passar ref. Basta garantir que nao ha ref leak.

### 5. Sidebar do desktop (`UpgradeVideo.tsx`)
- Actualizar os banners de confirmacao para reflectir que a masterclass (47 EUR) aparece primeiro

### Logica de skip actualizada

- Passo 2 (masterclass): skip → avanca para passo 3
- Passo 3 (gravacao): skip → avanca para passo 4
- Passo 4 (duvida): skip → se tem algo no carrinho, avanca para passo 5; se nao, redireciona para confirmacao gratuita
- Passo 5: pagamento

