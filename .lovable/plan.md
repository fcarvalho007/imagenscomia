

# Melhorar tab Email em Comunicação

## Objectivo

Alinhar a tab Email com a qualidade da tab SMS: editor de texto rico (negrito, itálico, sublinhado, listas), filtros por lista/webinar, selecção múltipla de destinatários com chips, e modal de confirmação de envio.

## Alterações

### 1. `src/components/crm/ComunicacaoView.tsx`

**Extrair EmailTab** para ficheiro próprio `src/components/crm/comunicacao/EmailTab.tsx` (consistência com SmsTab).

### 2. `src/components/crm/comunicacao/EmailTab.tsx` (novo)

**a) Filtros de lista** — barra de toggles no topo:
- **Webinar**: "Imagens IA" | "Vídeo IA" | "Todos"
- **Plano**: "Todos" | "Pagos" | "Premium" | "Masterclass" | "Free"
- Filtra a lista de inscritos disponível no dropdown de pesquisa

**b) Selecção múltipla de destinatários** — mudar de `to: string` para `recipients: Inscrito[]`:
- Chips com avatar, nome e X para remover
- Pesquisa filtra por nome/email nos inscritos filtrados
- Botão "Seleccionar todos os filtrados" quando há filtro activo

**c) Editor de texto rico** — substituir o `<textarea>` HTML por um editor com toolbar:
- Toolbar com botões: **B**, *I*, U, lista, link
- Usa `contentEditable` div com `execCommand` (simples, sem dependência extra)
- Gera HTML automaticamente para o campo `html` do envio
- Manter opção de alternar para "modo HTML raw" via toggle

**d) Envio em lote** — se múltiplos destinatários:
- Itera sobre cada recipient e invoca `send-email` individualmente
- Mostra progresso (X/Y)

**e) Modal de resultado** — após envio:
- Overlay animado com ícone de sucesso/falha
- Lista de destinatários com status individual
- Botão "Enviar outro" e "Fechar"

### 3. `src/components/crm/comunicacao/SmsTab.tsx`

**Adicionar os mesmos filtros** para consistência:
- Toggle de webinar: "Imagens IA" | "Vídeo IA" | "Todos"
- Toggle de plano: "Todos" | "Pagos" | "Premium" | "Masterclass" | "Free"
- Selecção múltipla de destinatários (chips) — envio em lote

### 4. Lógica de filtragem (partilhada)

```text
webinar="imagens" → i.webinar === "imagens" || !i.webinar
webinar="video"   → i.webinar === "video"
webinar="todos"   → sem filtro

plano="pagos"       → i.paid_at !== null
plano="premium"     → i.plan === "premium"
plano="masterclass" → i.plan === "masterclass" || i.plan === "bundle"
plano="free"        → i.paid_at === null
plano="todos"       → sem filtro
```

## Resumo
- 1 ficheiro novo (`EmailTab.tsx`)
- 2 ficheiros editados (`ComunicacaoView.tsx`, `SmsTab.tsx`)
- Editor rich-text com toolbar (sem dependências externas)
- Filtros por webinar e plano em ambas as tabs
- Selecção múltipla + envio em lote
- Modal de resultado animado

