

## Modal de Confirmacao nos Passos 3 e 4 + Botao "Saltar" mais visivel

### Problema
Nos passos 3 (Premium) e 4 (Masterclass), o botao principal ("Garantir Premium Pass") e a unica accao visualmente dominante. O link "Continuar sem..." e discreto (13px, cinza claro). Utilizadores que so querem avancar podem clicar no botao de compra por falta de alternativa clara, gerando falsos "Seleccionou e saiu" no CRM.

### Solucao: duas alteracoes complementares

**A) Modal de confirmacao ao clicar no botao de compra**

Quando o utilizador clica "Garantir Premium Pass" ou "Garantir lugar na Masterclass", aparece um modal de confirmacao antes de adicionar ao carrinho:

```text
+----------------------------------------+
|  Boa escolha!                          |
|                                        |
|  Vais adicionar o [Premium Pass /      |
|  Masterclass] ao teu checkout.         |
|  No proximo passo podes rever tudo     |
|  antes de pagar.                       |
|                                        |
|  [Sim, adicionar ao checkout]  (azul)  |
|  [Cancelar]                   (outline)|
+----------------------------------------+
```

Isto garante intencionalidade real — so quem confirma e contado como "Seleccionou".

**B) Botao "Saltar" mais visivel**

Transformar o link discreto num botao secundario com mais presenca visual:
- De: texto 13px cinza, so hover underline
- Para: botao outline com borda, padding, 14px, com texto claro ("Continuar sem extras" ou equivalente)
- Manter abaixo do separador "ou" mas com mais peso visual

### Ficheiros a alterar

| Ficheiro | Alteracao |
|---|---|
| `src/components/upgrade/StepPremium.tsx` | Adicionar estado para modal de confirmacao; transformar skip link em botao outline |
| `src/components/upgrade/StepMasterclass.tsx` | Idem — modal de confirmacao + botao skip mais visivel |

### Detalhe tecnico

Ambos os componentes passam a ter um estado `showConfirm` (boolean). O modal usa o componente `AlertDialog` ja existente no projecto (Radix). Ao clicar "Sim, adicionar", chama `onAddPremium` / `onAddMasterclass` como antes. Ao clicar "Cancelar", fecha o modal sem accao.

O botao de skip passa de `<p>` para `<button>` com classes: `w-full py-3 rounded-xl border border-ink-200 text-ink-500 hover:bg-ink-50 font-medium text-[14px] transition-colors`.

