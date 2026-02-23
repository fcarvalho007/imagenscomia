

# Ficha de Cliente — Redesign para Clareza e Legibilidade

## Problema

A ficha de cliente tem varios problemas visuais:
1. **StatusBlock** ("Aguarda pagamento") mostra "video-free" em vez de label legivel, e o layout e apertado
2. **TabResumo** — os 3 cards de info (Origem/Webinar/Qualificacao) usam texto demasiado pequeno (10-14px), dificil de ler
3. **Funil horizontal** — badges minusculas com texto a 10px, quase ilegivel
4. **Qualificacao e Equipa** — texto pequeno e sem destaque, confunde-se com labels auxiliares
5. Tudo usa tamanhos de fonte entre 10-14px sem hierarquia clara

## Solucao

Redesign focado em clareza visual: fontes maiores, hierarquia mais forte, labels humanizados, e melhor uso do espaco.

---

## Ficheiros a modificar

| Ficheiro | Alteracoes |
|---|---|
| `src/components/crm/modal/StatusBlock.tsx` | Normalizar plan label (remover "video-" prefix); aumentar fontes; melhorar espacamento |
| `src/components/crm/modal/TabResumo.tsx` | Redesign dos 3 cards com fontes maiores; redesign do funil; melhorar cards de qualificacao |
| `src/components/crm/modal/SidebarFunnel.tsx` | Aumentar fontes e espacamento para legibilidade |

---

## ALTERACAO 1 — StatusBlock: normalizar plan e melhorar UX

### Problema actual
- Mostra `video-free` como texto do plano (raw value da DB)
- Fontes a 11-12px, apertado

### Alteracoes
1. **Normalizar plan label**: adicionar logica para limpar o prefixo "video-" antes de procurar em `PLAN_LABELS`. Se `plan_selected = "video-free"`, mostrar "Gratuito" em vez de "video-free"
2. **Aumentar fonte do estado** de 12px para 14px
3. **Aumentar fonte do plano** de 12px para 13px
4. **Aumentar fonte do link info** de 11px para 12px
5. **Aumentar o botao "Reenviar"** de 11px para 12px, com mais padding

```typescript
// Normalizar plan_selected
const rawPlan = inscrito.plan_selected || inscrito.plan || "free";
const normalizedPlan = rawPlan.replace(/^video-/, "");
const planLabel = PLAN_LABELS[normalizedPlan] || (normalizedPlan === "free" ? "Gratuito" : normalizedPlan);
```

Tambem adicionar ao PLAN_LABELS:
```typescript
free: "Gratuito",
```

---

## ALTERACAO 2 — TabResumo: redesign para clareza

### 2a. Cards de info (Origem, Webinar, Qualificacao)

**Antes**: 3 colunas iguais com texto a 14px, labels a 10px, sub-labels a 11px
**Depois**: 2 colunas na primeira row (Origem + Webinar) e 1 row separada para Qualificacao (full width)

- **Labels**: de 10px para 11px
- **Valores**: de 14px para 16px, font-bold
- **Sub-labels**: de 11px para 12px
- **Qualificacao**: card full-width com 2 colunas internas (Funcao | Equipa) para melhor legibilidade
- **Padding**: de p-2.5 para p-3.5

```tsx
{/* ROW 1 — Origem + Webinar (2 cols) */}
<div className="grid grid-cols-2 gap-3">
  <div className="rounded-xl p-3.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
    <div className="flex items-center gap-1.5 mb-1.5">
      <MapPin size={14} className="text-muted-foreground" />
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#888" }}>Origem</span>
    </div>
    <p className="text-[16px] font-bold" style={{ color: "#111" }}>
      {abbreviateSource(inscrito.source[0]) || "—"}
    </p>
  </div>
  {/* Webinar card similar */}
</div>

{/* ROW 2 — Qualificacao full width */}
<div className="rounded-xl p-3.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
  <div className="flex items-center gap-1.5 mb-2">
    <User size={14} className="text-muted-foreground" />
    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#888" }}>Qualificacao</span>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "#aaa" }}>Funcao</p>
      <p className="text-[15px] font-semibold" style={{ color: "#111" }}>{inscrito.role || "Nao preenchido"}</p>
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "#aaa" }}>Equipa</p>
      <p className="text-[15px] font-semibold" style={{ color: "#111" }}>{inscrito.team_size || "—"}</p>
    </div>
  </div>
</div>
```

### 2b. Duvida / Objectivo
- Aumentar fonte do texto da duvida de 14px para 15px
- Aumentar label de 10px para 11px

### 2c. Funil horizontal — redesign

**Antes**: badges minusculas a 10px com icones de 8-10px, quase ilegivel
**Depois**: badges maiores com labels sempre visiveis, texto a 12px, progress bar visual

```tsx
<div>
  <span className="text-[11px] font-bold uppercase tracking-[1.5px] block mb-2.5" style={{ color: "#888" }}>
    Progresso no Funil
  </span>
  {/* Progress bar */}
  <div className="flex gap-0.5 mb-2.5 rounded-full overflow-hidden h-[6px]" style={{ background: "#e2e8f0" }}>
    {[1,2,3,4,5].map(s => (
      <div key={s} className="flex-1" style={{ background: s <= step ? "#16a34a" : "transparent" }} />
    ))}
  </div>
  {/* Step pills */}
  <div className="flex items-center gap-1.5 flex-wrap">
    {[1,2,3,4,5].map((s, idx) => {
      const completed = s <= step;
      const isExit = s === step && step < 5;
      return (
        <div key={s} className="flex items-center gap-1">
          <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{
            background: completed ? "rgba(22,163,74,0.1)" : "#f1f5f9",
            border: completed ? "1px solid rgba(22,163,74,0.25)" : "1px solid #e2e8f0",
            color: completed ? "#16a34a" : "#94a3b8",
          }}>
            {completed ? "✓" : "○"} {STEP_NAMES[s]}
          </span>
          {isExit && <span className="text-[10px] font-bold" style={{ color: "#ef4444" }}>SAIU</span>}
        </div>
      );
    })}
    <span className="ml-auto text-[13px] font-bold" style={{ color: "#333" }}>{pct}%</span>
  </div>
</div>
```

### 2d. Historico de Webinars
- Aumentar fonte do label de 10px para 11px
- Aumentar fonte dos cards de 11px para 12-13px

---

## ALTERACAO 3 — SidebarFunnel: melhorar legibilidade

- Aumentar texto dos steps de 11px para 12px
- Aumentar icones de 9-11px para 12-13px
- Aumentar status text de 10px para 11px
- Mais padding vertical entre steps

---

## O que NAO muda

- Nenhuma funcionalidade, query, ou logica
- Layout geral do modal (2 colunas, sidebar + content)
- Tabs e navegacao
- Actions da sidebar
- Nenhum outro componente CRM

