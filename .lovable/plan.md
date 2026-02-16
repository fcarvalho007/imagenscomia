

## Redesign da Ficha de Cliente (InscritoModal) -- UX/UI melhorado

### Resumo

Refactoring profundo do InscritoModal para melhorar hierarquia visual, separar informacao de accoes, criar timeline de logs com filtros, e adicionar modal de pre-validacao no reenvio. O ficheiro actual tem 1222 linhas -- sera partido em componentes menores.

### Ficheiros

| Ficheiro | Accao |
|----------|-------|
| `src/components/crm/InscritoModal.tsx` | Refactoring completo: novo header, seccoes separadas, timeline |
| `src/components/crm/modal/ClientHeader.tsx` | Novo -- header compacto com estado, plano, ref, proxima accao |
| `src/components/crm/modal/ActionsSection.tsx` | Novo -- bloco de accoes ordenado (primario, secundario, perigoso) |
| `src/components/crm/modal/LinkFollowUpSection.tsx` | Novo -- info de link/follow-up limpa com badges acessiveis |
| `src/components/crm/modal/ResendModal.tsx` | Novo -- modal de pre-validacao antes de reenviar email |
| `src/components/crm/modal/ActivityTimeline.tsx` | Novo -- timeline compacta com chips de filtro |
| `src/components/crm/modal/InvoiceSection.tsx` | Extraido do InscritoModal (ja existe inline) |

### Arquitectura de Componentes

```text
InscritoModal
  +-- TopBar (navegacao prev/next + fechar) [manter inline]
  +-- LeftPanel (nome, email, whatsapp, gender, accoes admin)
  |     Simplificado: remover accoes de pagamento daqui
  +-- RightPanel
        +-- ClientHeader (NOVO -- sticky summary)
        +-- ActionsSection (NOVO -- botoes de pagamento agrupados)
        +-- LinkFollowUpSection (NOVO -- estado do link + follow-up)
        +-- ResendModal (NOVO -- dialog de pre-validacao)
        +-- InvoiceSection (extraido)
        +-- FunnelView (manter)
        +-- Origem + Duvida + Notas (manter)
        +-- ActivityTimeline (NOVO -- substitui Tabs actuais)
```

---

### 1. ClientHeader -- Header compacto fixo no topo do painel direito

Substitui o "Compact Summary" actual (linhas 579-621). Informacao agrupada, sem duplicacao.

**Conteudo:**
- Chip de estado colorido: "Pago" (verde), "Aguarda pagamento" (vermelho), "Seleccionou e saiu" (laranja), "Gratuito" (cinza)
- Plano + preco (ex: "Bundle -- EUR76,26")
- Ref EuPago com botao copiar (truncada, tooltip com valor completo)
- Proxima accao: data/hora do proximo follow-up OU "Concluido" OU "Em atraso"
- Passo X/5

**Layout:** uma unica linha flex-wrap com chips, sem card pesado. `sticky top-0 z-10 bg-white` para ficar visivel durante scroll.

### 2. ActionsSection -- Bloco "Accoes" separado

Remove accoes de pagamento que estao espalhadas (linhas 624-878) e centraliza tudo num unico bloco organizado por prioridade.

**Ordem dos botoes:**
1. **Primario:** "Abrir link" (ExternalLink) -- azul solido, so aparece se `last_payment_link` existe
2. **Secundarios:** "Copiar link" | "Reenviar email" (com microcopy cooldown) | "Copiar ref EuPago"
3. **Perigoso:** "Regenerar link EuPago" -- border vermelho/laranja, com confirm dialog
4. **Menu "Mais opcoes" (...):** "Gerar NOVO link de pagamento (Gmail)" -- o botao grande amber actual move-se para ca

**Microcopy no Reenviar:**
- Se `reminder_manual` enviado < 6h: botao disabled + texto "Ultimo reenvio ha Xh"
- Se nunca enviado: "Reenviar email de pagamento"

**Visibilidade:** so aparece para `payment_status !== "free"` e `!paid_at`.

### 3. LinkFollowUpSection -- Info de link limpa

Substitui o bloco actual de follow-up info (linhas 627-710).

**Conteudo:**
- Validade do link: badge com texto + icone (nao depender so da cor)
  - "Link valido (~16h restantes)" + CheckCircle verde
  - "Link a expirar (~3h)" + AlertTriangle amarelo
  - "Link expirado" + XCircle vermelho
- Criado em: data/hora
- Ultimo envio: data/hora (de `last_payment_link_sent_at`)
- Proximo envio: data/hora (de `next_followup_at`)
- Follow-up automatico: etapa X/3

**Layout:** grid 2x2 compacto com labels em caps pequenas.

### 4. ResendModal -- Pre-validacao antes de reenviar

Substitui o `showResendConfirm` inline actual (linhas 756-795) por um Dialog/modal dedicado.

**Fluxo ao clicar "Reenviar email":**
1. Abre modal
2. Faz HEAD (com fallback GET) ao `last_payment_link` via edge function ou client-side
3. Mostra resultado:
   - "Link OK (status 200)" com CheckCircle verde
   - "Link expirado (status 404)" com XCircle vermelho + opcao "Regenerar e reenviar" (um so clique)
4. Confirma destinatario (email do inscrito, read-only)
5. Botao "Confirmar envio"
6. Apos envio: toast com `provider_message_id`

**Nota tecnica:** A validacao do link pode ser feita client-side com `fetch(url, { method: "HEAD", mode: "no-cors" })` -- mas como no-cors nao da status, melhor chamar a edge function `followup-abandoned` em modo `validate_link` (novo mode) ou fazer a validacao no invoice-upsert. Alternativa mais simples: usar o resultado do ultimo `message_log` com `link_validation` no campo error. Para MVP, mostrar a idade do link (ja calculada) como proxy de validade e oferecer "Regenerar" se > 24h.

**Decisao pratica para MVP:** Usar a idade do link como proxy (< 12h = OK, 12-24h = A expirar, > 24h = Expirado). Se expirado, o botao muda para "Regenerar e reenviar". Nao adicionar nova edge function so para validar link -- a validacao real ja acontece no momento do envio (followup-abandoned).

### 5. ActivityTimeline -- Logs em timeline com filtros

Substitui as Tabs "Emails" / "Pagamentos" actuais (linhas 1093-1212).

**Filtros (chips horizontais):**
- Tudo | Emails | Pagamentos | Erros | Manual
- Toggle "So falhas" (checkbox/switch)

**Timeline unificada:**
- Merge de `messageLogs` + `paymentEvents` numa unica lista ordenada por data (desc)
- Cada item:
  - Icone lateral (Mail para emails, CreditCard para pagamentos, AlertTriangle para erros)
  - Linha de tempo vertical (border-left tracejado)
  - Titulo: template label humano ou event_type
  - Badges: estado (sent/failed/queued), canal (Resend/Internal), hora relativa
  - IDs truncados com botao "Copiar"
  - "Ver detalhes" collapsible para payload/error

**Layout:** vertical timeline com `border-l-2 border-dashed` e dots nos pontos.

### 6. Acessibilidade e Consistencia

Em todos os componentes novos:
- `aria-label` em botoes de copiar (ex: "Copiar referencia EuPago")
- `aria-label` em botoes de abrir (ex: "Abrir link de pagamento")
- Contraste minimo: nunca texto cinza claro em fundo branco sem peso >= 500
- Botoes com altura consistente: `h-8` para secundarios, `h-9` para primarios
- Labels em portugues consistentes (sem mistura en/pt)
- Badges com texto + icone (nunca so cor)

### 7. Limpeza do InscritoModal principal

O ficheiro principal fica como orquestrador:
- Mantém state management (logs, loading, etc.)
- Renderiza: TopBar + LeftPanel + RightPanel
- RightPanel usa os novos componentes
- Remove ~500 linhas de JSX inline, move para componentes

### O que NAO muda

- Props interface do InscritoModal (compatibilidade total com CRM.tsx)
- Logica de fetch de logs, payment events
- Left panel (nome, email, whatsapp, gender, accoes admin como arquivar/eliminar)
- FunnelView, Origem, Duvida, Notas
- InvoiceSection (apenas extraido para ficheiro proprio)
- Nenhuma edge function ou DB migration

