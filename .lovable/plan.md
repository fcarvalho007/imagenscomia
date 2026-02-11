

# Refinamento do Premium Pass + Layout do Upsell

## Parte 1 — StepPremium.tsx (copy + UX)

### Bullets (remover tom negativo)
Substituir os 3 bullets atuais por versoes orientadas a beneficio:
1. **"Gravacao HD (acesso continuo)"** — "Rever e aplicar quando for mais conveniente."
2. **"Q&A exclusivo (60 min)"** — "Duvidas respondidas com foco no caso real."
3. **"Guia completo de prompts (30+ paginas)"** — "Estruturas prontas para acelerar resultados."

### Cabecalho de preco
- Manter "PREMIUM PASS" e "€15 + IVA"
- Substituir microcopy "€18,45 total · pagamento unico" por: **"Para implementar com calma, sem depender do direto."**

### Badge early bird
- De: "Sobe para €27 / depois do webinar"
- Para: **"Early bird: €15 + IVA" / "Depois do webinar: €27 + IVA"**

### Remover label "Com o Premium tens acesso a:"
- Os bullets sao autoexplicativos

### Linha de posicionamento (antes do CTA)
Adicionar: **"Upgrade ideal para aplicar o metodo depois do webinar."** (texto pequeno, discreto)

### CTA
- De: "Adicionar Premium Pass →"
- Para: **"Garantir Premium Pass →"**
- Adicionar microcopy abaixo: **"Pagamento unico · acesso a gravacao incluido"**

### Skip link
- Manter "Continuar sem gravacao, Q&A nem guia →" (ja esta neutro)

---

## Parte 2 — Layout e UX (Upsell.tsx + SummaryPanel.tsx + StepMasterclass.tsx)

### Grelha (Upsell.tsx)
- Reduzir coluna esquerda: `lg:grid-cols-[340px_1fr]` para **`lg:grid-cols-[280px_1fr]`**
- Aumentar max-w dos cards de `max-w-[480px]` para **`max-w-[560px]`** (StepPremium e StepMasterclass)
- Cards internos de `max-w-[460px]` para **`max-w-[520px]`**

### SummaryPanel.tsx — simplificar
- Reduzir padding lateral de 28px para **24px**
- Compactar subtextos: "18 Fev · 10h00 · 75 minutos" para **"18 Fev · 10h00"**
- "Gravacao · Q&A · Guia" para **"Gravacao + Q&A + Guia"** (mais curto)

### StepMasterclass.tsx — remover repeticao de data
- No rodape com icones, remover a data (ja esta no cabecalho):
  - De: `["📅 5 de Marco (quinta-feira)", "💻 Online", "⏱ 3 horas", "👥 Max. 30"]`
  - Para: **`["💻 Online", "⏱ 3 horas", "👥 Max. 30"]`**

---

## Ficheiros a editar

| Ficheiro | Alteracoes |
|----------|-----------|
| `StepPremium.tsx` | Bullets, badge, CTA, microcopy, linha posicionamento |
| `Upsell.tsx` | Grelha 280px coluna esquerda |
| `SummaryPanel.tsx` | Padding, textos compactos |
| `StepMasterclass.tsx` | Remover data duplicada do rodape, max-w 560/520 |

