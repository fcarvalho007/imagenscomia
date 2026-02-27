

# Refinar Steps 3 e 4 do /upgrade-video

## Resumo

5 fixes cirurgicos nos componentes StepMasterclass e StepVideoPremium, mais ajustes no UpgradeVideo.tsx para sticky bottom bar e posicionamento vertical.

---

## FIX 1 -- Sticky bottom bar (Steps 3 e 4)

### StepMasterclass.tsx

Remover do componente:
- Botao primario "Garantir lugar..." (linhas 122-139)
- Social proof "Grupo limitado..." (linhas 141-144)
- Separador "ou" (linhas 147-152)
- Botao secundario "Continuar com inscricao gratuita" (linhas 154-172)
- Reassurance text (linhas 174-177)

O componente passa a renderizar apenas o card de pricing e o confirmation dialog. Os CTAs movem-se para fora.

Adicionar nova prop `onPrimaryClick` (alem de `onAddMasterclass` e `onSkip`) -- ou reutilizar: o botao primario no sticky bar faz `() => setShowConfirm(true)`. Problema: o `showConfirm` state vive dentro do componente.

**Solucao**: Mover o AlertDialog e `showConfirm` state para fora -- elevar para UpgradeVideo.tsx. Ou: manter tudo dentro do StepMasterclass mas exportar tambem o sticky bar content via render prop.

**Abordagem mais simples**: Manter `showConfirm` dentro do componente. Passar uma nova prop `renderStickyBar` como render prop que o componente chama com `{ onPrimary: () => setShowConfirm(true), onSkip }`. O UpgradeVideo.tsx usa um portal ou posiciona o sticky bar fora do card.

**Abordagem mais simples ainda**: O StepMasterclass renderiza o sticky bar como parte do seu output, posicionado com `fixed`. O sticky bar fica visualmente fora do card mas no DOM esta dentro do componente. Funciona perfeitamente com React.

Adicionar ao final do JSX do StepMasterclass (antes do AlertDialog):

```text
<div style={{
  position: "fixed", bottom: 0, left: 0, right: 0,
  background: "white", borderTop: "1px solid #e5e7eb",
  padding: "12px 24px",
  paddingBottom: "max(12px, env(safe-area-inset-bottom))",
  zIndex: 50,
  boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
}}>
  <div style={{ maxWidth: 600, margin: "0 auto" }}>
    <button primary CTA ... />
    <p social proof centered 11px #9ca3af />
    <button secondary text link ... />
  </div>
</div>
```

Adicionar `padding-bottom: 128px` ao wrapper `<div className="text-center">` para que o conteudo nao fique escondido atras do sticky bar.

### StepVideoPremium.tsx

Mesma abordagem. Remover CTA, separador, secondary do card. Adicionar sticky bar fixed com cor azul (#1e40af).

---

## FIX 2 -- Reduzir altura do pricing card

### StepMasterclass.tsx

Remover:
- Label "MASTERCLASS ONLINE" (linha 77-79)
- Meta row "calendario Online relogio 3 horas" (linhas 117-120)

Benefits: remover sub-descriptions, manter so titulos. Reduzir `space-y-3.5` para `space-y-2`. Cada item: flex, gap-2, height 36px, align-items center.

Titulos simplificados:
- "Sistema completo de producao de video curto"
- "Ferramentas certas -- sem confusao"
- "Prompts para video reutilizaveis"
- "Gravacao da Masterclass incluida" (bold)

### StepVideoPremium.tsx

Remover sub-descriptions dos benefits. Mesma abordagem.

Titulos:
- "Gravacao HD -- acesso continuo"
- "Pack de apoio completo"
- "Sessao Q&A exclusiva (30 min) -- Terca, 10 Mar"

---

## FIX 3 -- "(opcional)" badge no Step 4

No StepVideoPremium.tsx, substituir:
```text
<span style={{ fontSize: 28, fontWeight: 400, color: "#9ca3af" }}>(opcional)</span>
```

Por um badge inline abaixo do headline:
```text
<span style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af",
  border: "1px solid #e5e7eb", borderRadius: 6,
  padding: "2px 8px", background: "white",
  display: "inline-block", marginTop: 8 }}>
  OPCIONAL
</span>
```

E ajustar o h2 para `display: block` (remover `display: inline`).

---

## FIX 4 -- Posicionamento vertical do card

No UpgradeVideo.tsx, linha 462:
```text
className="flex-1 flex items-start sm:items-center justify-center..."
```

Ajustar para que steps 3 e 4 usem `items-start` com `pt-8` (32px), e step 5 use `items-center` (como steps 1 e 2).

Logica: adicionar condicional no className:
- Steps 1, 2, 5: `items-center` (centrado verticalmente)
- Steps 3, 4: `items-start` com padding-top 32px
- Steps 0, 6, 7: `items-center`

Implementar com: `const verticalCenter = [1, 2, 5, 0, 6, 7].includes(step);` e aplicar `items-center` vs `items-start pt-8`.

---

## FIX 5 -- Spacing audit

No UpgradeVideo.tsx, o card padding ja esta definido como `48px 40px` desktop e `32px 20px` mobile. Confirmar que esta consistente.

Dentro dos componentes StepMasterclass e StepVideoPremium:
- Apos step label: gap 20px (actualmente 24px -- reduzir `<div style={{ height: 24 }} />` para 20)
- Apos headline+subheadline: gap 28px (actualmente 28px -- OK)
- Antes do CTA: removido do card (agora no sticky bar)

Header: 56px ja esta definido. Confirmar.

Progress bar: 3px ja esta definido. Label right-aligned 11px #9ca3af ja esta correcto.

---

## Ficheiros alterados

1. **StepMasterclass.tsx** -- remover elementos redundantes, simplificar benefits, adicionar sticky bar fixed
2. **StepVideoPremium.tsx** -- mesmas alteracoes + badge "OPCIONAL"
3. **UpgradeVideo.tsx** -- ajustar posicionamento vertical do card (items-start vs items-center por step)

## O que NAO muda

- Steps 1, 2, 5 (conteudo e logica)
- AlertDialog / confirmation flow (mantido dentro dos componentes)
- onAddMasterclass / onAddPremium callbacks
- onSkip callbacks
- Supabase writes, EuPago, email triggers
- Step 0, 6, 7
- Qualquer outro ficheiro

