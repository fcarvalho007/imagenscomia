
# Fixes focados nos Steps 3 e 4 do /upgrade-video

## FIX 1 -- Reduzir top spacing nos steps 3 e 4

No `UpgradeVideo.tsx` (linha 462), o wrapper actual usa `py-6 sm:py-10` com `pt-8` para steps 3/4. Alterar para:

- Steps 3, 4: `pt-2 sm:pt-4` (8px mobile, 16px desktop) em vez de `pt-8`
- Manter `py-6 sm:py-10` para os outros steps

Implementacao: condicional no className:
```text
[3, 4].includes(step) ? "items-start pt-2 sm:pt-4 pb-6" : "items-start sm:items-center py-6 sm:py-10"
```

## FIX 2 -- Restyle "Masterclass garantida" no Step 4

No `StepVideoPremium.tsx`:

**Remover** o banner verde (linhas 28-32): o bloco `{masterclassSelected && (<div className="mb-4 rounded-lg...">...</div>)}`.

**Alterar** a linha do step label (linha 35) para incluir o pill inline:
```text
<p style={{ fontSize: 12, color: "#9ca3af" }}>
  Passo 4 de 5 — Gravacao Video
  {masterclassSelected && (
    <span style={{
      fontSize: 10, fontWeight: 600, color: "#16a34a",
      background: "#f0fdf4", border: "1px solid #bbf7d0",
      borderRadius: 20, padding: "2px 8px", marginLeft: 8,
      verticalAlign: "middle", display: "inline-block",
    }}>
      checkmark Masterclass
    </span>
  )}
</p>
```

Mesma condicao (`masterclassSelected`), apenas muda a apresentacao visual.

## FIX 3 -- Mobile audit para steps 3 e 4

### 3a. Header bar mobile (UpgradeVideo.tsx linhas 440-443)

Ja esta compacto: `"emoji Webinar Video . 5 Mar checkmark"` a 12px. Ajustar height mobile para 44px:

Adicionar classe mobile ao header: `className="... h-[44px] sm:h-[56px]"` em vez do `style={{ height: 56 }}` fixo.

### 3b. Progress bar label mobile (linhas 451-452)

Ja esta implementado: mobile mostra `"Passo X/5"` sem subtitulo, desktop mostra com subtitulo. Sem alteracao necessaria.

### 3c. Pricing card mobile -- StepMasterclass.tsx e StepVideoPremium.tsx

Aplicar estas classes mobile adicionais:

**Price font**: `max-sm:text-[36px]` (ja tem `max-sm:text-[38px]`, reduzir para 36px)

**Badge font**: `max-sm:text-[8px]` nos badges (actualmente 9px fixo)

**Benefits list mobile**: adicionar `max-sm:text-[13px]` nos titulos e `max-sm:w-4 max-sm:h-4` nos icones check, `max-sm:space-y-1.5` no wrapper

**Date box mobile**: `max-sm:p-[10px_12px]` e `max-sm:text-[12px]` no subtitulo

**Early bird badge mobile**: `max-sm:text-[10px]` (actualmente 11px)

### 3d. Sticky bar mobile -- ambos componentes

**CTA font mobile**: `max-sm:text-[15px]` no botao primario

**Secondary text mobile**: `max-sm:text-[12px]` no link "ou continuar..."

### 3e. Back arrow (UpgradeVideo.tsx linhas 487-494)

Ja tem `width: 44, height: 44` -- tap target correcto. Sem alteracao.

## Ficheiros alterados

1. **`src/pages/UpgradeVideo.tsx`** -- FIX 1 (top spacing condicional), FIX 3a (header height mobile)
2. **`src/components/upgrade/StepMasterclass.tsx`** -- FIX 3c/3d (mobile sizing)
3. **`src/components/upgrade/StepVideoPremium.tsx`** -- FIX 2 (pill badge), FIX 3c/3d (mobile sizing)

## O que NAO muda

- Steps 1, 2, 5, 6, 7
- Logica de pagamento EuPago
- Supabase writes/reads
- AlertDialog/confirmation flow
- Callbacks onAddMasterclass, onAddPremium, onSkip
- Nenhum outro ficheiro
