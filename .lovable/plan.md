

# Remover Funil Duplicado e Melhorar Visual na Tab Resumo

## Problema

O funil aparece em dois sitios: na sidebar esquerda (componente `SidebarFunnel`) e dentro da tab "Resumo" (secção "Progresso no Funil"). Informação duplicada que ocupa espaço desnecessário.

---

## Alterações

### 1. Remover funil da sidebar

**Ficheiro:** `src/components/crm/InscritoModal.tsx`

Remover as linhas 315-319 (o bloco "Funil" + `SidebarFunnel`) e o divider acima (linha 313). Isto liberta espaço na sidebar para as acções ficarem mais respiradas.

Remover também o import de `SidebarFunnel` (linha 15).

### 2. Redesign do funil na Tab Resumo — visualmente apelativo

**Ficheiro:** `src/components/crm/modal/TabResumo.tsx`

Substituir o bloco actual (linhas 109-144) por um design mais impactante:

- **Percentagem grande e central**: número a 32px bold com cor baseada no progresso (verde se >= 80%, âmbar se >= 40%, cinza se < 40%)
- **Barra de progresso**: mais alta (8px em vez de 6px), com gradiente verde
- **Steps em lista vertical compacta**: cada step numa row com ícone check/circle, nome do step, e status ("Concluído" / "Actual" / "—"), mais legível que pills horizontais
- **Indicador de saída**: linha vermelha entre o step actual e o próximo, com label "SAIU AQUI"
- **Card contentor**: tudo dentro de um card com fundo #f8fafc e border, consistente com os outros cards

Layout:

```text
+------------------------------------------+
|  PROGRESSO NO FUNIL              60%     |
|  [========----------] barra              |
|                                          |
|  ✓  Inscrição          Concluído         |
|  ✓  Origem             Concluído         |
|  ✓  Dúvida             Concluído         |
|  ── SAIU AQUI ──────────────────         |
|  →  Premium            Actual            |
|  ○  Masterclass        —                 |
+------------------------------------------+
```

### Detalhes técnicos

**InscritoModal.tsx** — remover:
- Linha 15: `import SidebarFunnel from "./modal/SidebarFunnel";`
- Linhas 313-319: o divider + bloco do funil na sidebar

**TabResumo.tsx** — substituir ROW 4 (linhas 109-144):

```tsx
{/* ROW 4 — Funnel card */}
<div className="rounded-xl p-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
  {/* Header com label + percentagem */}
  <div className="flex items-center justify-between mb-3">
    <span className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: "#888" }}>
      Progresso no Funil
    </span>
    <span className="text-[28px] font-bold" style={{
      color: pct >= 80 ? "#16a34a" : pct >= 40 ? "#d97706" : "#94a3b8"
    }}>
      {pct}%
    </span>
  </div>

  {/* Progress bar */}
  <div className="rounded-full overflow-hidden h-2 mb-4" style={{ background: "#e2e8f0" }}>
    <div className="h-full rounded-full transition-all" style={{
      width: `${pct}%`,
      background: pct >= 80 ? "#16a34a" : pct >= 40 ? "#d97706" : "#94a3b8"
    }} />
  </div>

  {/* Steps vertical list */}
  <div className="space-y-0">
    {[1,2,3,4,5].map(s => {
      const completed = s <= step;
      const isCurrent = s === step;
      const isExit = s === step && step < 5;
      // ... step rows with check/arrow/circle icons
      // ... red "SAIU AQUI" separator after exit point
    })}
  </div>
</div>
```

---

## O que NAO muda

- Nenhuma funcionalidade ou lógica
- Sidebar continua com: identity, status block, actions
- Restantes secções da tab Resumo (Origem, Webinar, Qualificação, Dúvida, Histórico)
- O ficheiro `SidebarFunnel.tsx` pode ficar (não causa problemas), mas deixa de ser importado
