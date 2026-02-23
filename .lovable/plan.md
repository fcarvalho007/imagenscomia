

# TableView — Limpar layout da coluna PLANO e melhorar legibilidade

## Problema

A coluna PLANO acumula demasiados badges empilhados verticalmente (plano, estado de pagamento, tempo, follow-up, proximo follow-up, ultimo email) causando overflow visual e rows com alturas desproporcionadas. A informacao fica "encavalitada" e ilegivel.

## Solucao

Separar a informacao que esta toda comprimida na coluna PLANO em colunas/celulas distintas e simplificar o que aparece inline.

---

## Alteracoes no ficheiro `src/components/crm/TableView.tsx`

### 1. Separar "Estado" do "Plano"

Actualmente a coluna PLANO mostra: badge do plano + badge de pagamento + tempo + follow-up + proximo follow-up + ultimo email — tudo na mesma celula.

**Reorganizar assim:**

| Coluna PLANO | Coluna ESTADO | Coluna FOLLOW-UP |
|---|---|---|
| Badge do plano (Gratuito/Premium/MC/Bundle) | Badge pagamento (Aguarda pgto / Pago / Seleccionou) + tempo | Follow-up stage + proximo |

- **PLANO**: Apenas o badge do plano (1 linha, limpo)
- **ESTADO** (nova coluna, ao lado de PLANO): Badge de payment_status + pending time. Maximo 1 linha
- **FOLLOW-UP** (nova coluna, so para quem tem follow-up activo): "1/3" + "Prox. 4h" numa unica linha compacta

### 2. Mover "Ultimo email" para a coluna NOTAS ou remover da tabela

O badge do ultimo email ("Tentativa de resolver pagamento . ha 50min") e demasiado longo para uma celula de tabela. Duas opcoes:

**Opcao escolhida**: Mover para um tooltip no icone de email na propria row. Adicionar um pequeno icone de envelope com dot colorido (verde/vermelho/amarelo) na nova coluna "Email". Ao fazer hover, mostra o nome do template + timestamp.

### 3. Estrutura final das colunas

```
[x] | Webinar? | NOME | EMAIL | WHATSAPP | PLANO | ESTADO | EMAIL | PASSO | FUNCAO | EQUIPA | ORIGEM | DUVIDA | INSCRICAO | NOTAS | FATURA | ...
```

Colunas novas/alteradas:
- **PLANO**: so o badge de cor (Gratuito, Premium, MC, Bundle) — 1 badge, sem nada mais
- **ESTADO**: badge de pagamento (Aguarda pgto / Pago / Seleccionou e saiu) + tempo pendente. Se follow-up activo, mostra "F-up 1/3" inline separado por "·". Tudo numa unica linha truncada
- **EMAIL** (novo header, largura 40px): Icone envelope com dot de cor baseado no ultimo email. Tooltip com detalhes. Sem texto visivel

### 4. Detalhes tecnicos

**Coluna PLANO (simplificada):**
```tsx
<td className="px-4 py-3">
  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
    {badge.label}
  </span>
</td>
```

**Coluna ESTADO (nova):**
```tsx
<td className="px-3 py-3">
  <div className="flex items-center gap-1 flex-nowrap">
    {/* Payment status badge */}
    {payment_status badge — compacto, 1 linha}
    {/* Pending time */}
    {pendingTime && <span className="text-[10px]">{pt.text}</span>}
    {/* Follow-up inline */}
    {showFollowup && <span className="text-[10px] text-ink-400">· F{stage}/3</span>}
  </div>
</td>
```

**Coluna EMAIL (nova, icone):**
```tsx
<td className="px-2 py-3 text-center">
  <span title={`${templateLabel} · ${timeAgo}`} className="cursor-help">
    <Mail size={14} />
    <span className="dot" /> {/* verde/vermelho/amarelo */}
  </span>
</td>
```

**Header atualizado:**
- Adicionar `{ key: null, label: "Estado", cls: "min-w-[120px]" }` apos Plano
- Adicionar header "Email" (nao sortable) com min-w-[40px]
- Reduzir min-w do PLANO de 100px para 80px

### 5. O que NAO muda

- Funcionalidade de filtros, ordenacao, paginacao
- Quick filter chips
- Export CSV
- Logica de seleccao
- Step dropdown
- Colunas Funcao, Equipa, Origem, Duvida, Inscricao, Notas, Fatura
- Nenhum outro componente CRM

