

## Redesign: Funil unificado no modal do CRM

### Problema actual

A informacao de progresso esta duplicada em 3 sitios:
1. **Painel esquerdo**: "Progresso" com 5 passos e checkmarks
2. **Painel direito**: card "Progresso no flow" com barra e "X de 5"
3. **Painel direito**: "Actividade" timeline que repete os mesmos passos com timestamps identicos (todos usam a data de inscricao, sem valor real)

O utilizador nao consegue perceber rapidamente: onde parou? converteu? mostrou interesse?

### Solucao: Funil visual unico

Substituir as 3 secoes por **um unico bloco "Funil"** no painel direito, e simplificar o painel esquerdo.

---

### Painel esquerdo (simplificado)

Remover a seccao "Progresso" inteira (os 5 passos com checkmarks). Manter apenas:
- Avatar, nome, email, WhatsApp
- Badge do plano
- Data de inscricao
- Accoes (email, follow-up, arquivar, eliminar)

Adicionar um indicador compacto: **"Chegou ao passo 3/5"** junto ao badge do plano, para referencia rapida.

---

### Painel direito: novo bloco "Funil"

Substituir os cards "Progresso no flow" + "Plano seleccionado" + "Clicou em pagar" + a timeline "Actividade" por um unico componente visual:

```text
FUNIL DO INSCRITO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Inscricao          ✅ Concluido
   12 Fev 2026 · 21:19

2. Origem (Passo 1)   ✅ Respondeu
   Instagram, WhatsApp

3. Duvida (Passo 2)   ✅ Respondeu
   "Como criar imagens..."

4. Premium (Passo 3)  ⚡ Clicou para pagar
   Plano: Premium · €15

5. Masterclass (P.4)  ○ Nao atingiu

6. Conclusao (P.5)    ○ Nao atingiu
   ─── SAIU AQUI ───

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progresso: ████████░░░░ 60% (3/5)
```

Cada passo mostra:
- **Estado visual claro**: check verde (concluido), circulo azul com raio (mostrou interesse/clicou), circulo vazio cinza (nao atingiu)
- **Sub-info contextual**: o que respondeu, que plano escolheu, se pagou
- **Marcador "SAIU AQUI"**: uma linha vermelha/laranja apos o ultimo passo atingido, para ser imediatamente obvio onde o utilizador abandonou
- **Barra de progresso** no fundo com percentagem

### Logica dos estados por passo

| Passo | Concluido | Com interesse | Sem accao | Nao atingiu |
|---|---|---|---|---|
| Inscricao | Sempre verde | — | — | — |
| Origem | Respondeu fontes | — | Saltou (SKIPPED) | step < 1 |
| Duvida | Respondeu duvida | — | Saltou (SKIPPED) | step < 2 |
| Premium | paid_at + premium/bundle | upgrade_clicked_at + plan_selected=premium | Viu mas nao clicou | step < 3 |
| Masterclass | paid_at + masterclass/bundle | upgrade_clicked_at + plan_selected=masterclass | Viu mas nao clicou | step < 4 |
| Conclusao | step >= 5 | — | — | step < 5 |

### Indicadores visuais de interesse no Premium/Masterclass

- **Converteu** (pagou): check verde + "Pago · €X" em verde
- **Clicou para pagar** (upgrade_clicked_at existe mas sem paid_at): icone de raio amarelo + "Clicou para pagar" — indica interesse forte
- **Viu mas nao converteu**: circulo vazio + "Nao converteu"
- **Nao atingiu**: circulo cinza tracejado + "Nao chegou a este passo"

---

### O que e removido (duplicacoes)

| Removido | Razao |
|---|---|
| Seccao "Progresso" no painel esquerdo | Substituida pelo funil |
| Card "Progresso no flow" (barra + X/5) | Integrado na barra do funil |
| Card "Plano seleccionado (upgrade)" | Integrado no passo Premium/Masterclass |
| Card "Clicou em pagar" | Integrado no passo relevante |
| Timeline "Actividade" inteira | Os passos ja mostram tudo; eventos de pagamento e notas ficam nas seccoes proprias |

### O que se mantem

- Cards "Plano" e "Pago em" e "Ref. EuPago" (informacao financeira)
- Seccao "Origem" (badges das fontes)
- Seccao "Maior Duvida" (quote)
- Seccao "Notas"

---

### Ficheiro afectado

`src/components/crm/InscritoModal.tsx`

### Alteracoes tecnicas

1. Remover bloco "Progresso" do painel esquerdo (linhas 304-338)
2. No painel direito, substituir o grid de detalhes por:
   - Linha 1: cards Plano + Pago em + Ref. EuPago (3 cards, sem "Progresso no flow" nem "Plano seleccionado" nem "Clicou em pagar")
   - Novo componente `FunnelView` com os 6 passos e barra de progresso
3. Remover timeline "Actividade" (linhas 495-512)
4. Manter seccoes Origem, Duvida e Notas

