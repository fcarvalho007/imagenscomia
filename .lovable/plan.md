

# Simplificar CTAs + Tipografia do /upgrade

## 1. Todos os botoes abrem o modal directamente

Actualmente, o botao na `ProgramSection` usa um link de ancora (`href="#form-gratis"`) que faz scroll ate a seccao de pricing em vez de abrir o modal. Como so existe um tipo de accao (inscricao gratuita), todos os botoes devem abrir o modal directamente.

### Ficheiro: `src/components/landing/ProgramSection.tsx`
- Importar `useRegistrationModal`
- Converter o `<motion.a href="#form-gratis">` para `<motion.button onClick={() => open("free")}>`
- Manter o texto "Reservar lugar gratuito"

---

## 2. Aumentar fontes no /upgrade para consistencia

Aplicar o mesmo principio da landing page: minimo 14px, corpo 15-17px, titulos maiores.

### Ficheiro: `src/pages/Upsell.tsx`
- Progresso "Passo X de 5": de `13px` para `14px`

### Ficheiro: `src/components/upgrade/StepQualification.tsx`
- H2: de `22px` para `24px`
- Corpo "Para garantir...": de `15px` para `17px`
- Label "Como soubeste...": de `16px` para `17px`
- Nota "(opcional...)": de `12px` para `14px`
- Opcoes de checkbox: de `14px` para `15px`
- Botao "Proximo passo": de `15px` para `16px`
- "Saltar esta pergunta": de `13px` para `14px`

### Ficheiro: `src/components/upgrade/StepPersonalization.tsx`
- H2: de `22px` para `24px`
- Corpo: de `15px` para `17px`
- Nota azul: de `13px` para `14px`
- Textarea placeholder: de `15px` para `16px`
- Contador caracteres: de `12px` para `14px`
- Botao: de `15px` para `16px`
- "Saltar": de `13px` para `14px`

### Ficheiro: `src/components/upgrade/StepPremium.tsx`
- H2: de `22px` para `24px`
- Corpo: de `15px` para `17px`
- Kicker "PREMIUM PASS": de `11px` para `14px`
- Preco IVA: de `12px` para `14px`
- Badge "Sobe para €27": de `11px` para `14px`; sub de `10px` para `14px`
- "Com o Premium tens...": de `13px` para `14px`
- Bullet titles: de `14px` para `15px`
- Bullet subs: de `12px` para `14px`
- Separador "ou": de `13px` para `14px`

### Ficheiro: `src/components/upgrade/StepMasterclass.tsx`
- H2: de `22px` para `24px`
- Corpo: de `15px` para `17px`
- Kicker "MASTERCLASS ONLINE": de `11px` para `14px`
- Preco total: de `12px` para `14px`
- Badge: de `11px` e `10px` para `14px`
- "Da imagem ao video...": de `13px` para `14px`
- Bullet titles: de `14px` para `15px`
- Bullet subs: de `12px` para `14px`
- Event details: de `12px` para `14px`
- Separador "ou": de `13px` para `14px`

### Ficheiro: `src/components/upgrade/StepConfirmation.tsx`
- H2 (VariantFree): de `22px` para `24px`
- Confirmation items: de `14px` para `15px`
- Referral titulo: de `16px` para `17px`
- Referral corpo: de `14px` para `15px`
- H2 (VariantPayment): de `22px` para `24px`
- Order lines: de `14px` para `15px`
- Subtotal/IVA: de `13px` para `14px`
- Total label: manter `16px`
- IVA label "c/ IVA": de `12px` para `14px`
- "Pagamento seguro": de `12px` para `14px`
- "Voltar": de `13px` para `14px`

### Ficheiro: `src/components/upgrade/SummaryPanel.tsx`
- Subtitulo: de `12px` para `14px`
- Kicker "A TUA INSCRICAO": de `11px` para `14px`
- Datas nos items: de `12px` para `14px`
- "Gratuito" label: de `11px` para `14px`
- IVA spans nos precos: de `11px` para `14px`
- Total label: de `13px` para `14px`
- Security block: de `12px` para `14px`
- Mobile bar texto: de `13px` para `14px`
- Mobile bar preco: de `15px` para `16px`
- Mobile IVA: de `10px` para `14px`

---

## Ficheiros a editar (resumo)

| Ficheiro | Alteracao |
|----------|-----------|
| `ProgramSection.tsx` | Converter ancora em botao que abre o modal |
| `Upsell.tsx` | Progresso 13->14px |
| `StepQualification.tsx` | H2 22->24px, corpo 15->17px, label 16->17px, nota 12->14px, opcoes 14->15px, botao 15->16px, saltar 13->14px |
| `StepPersonalization.tsx` | H2 22->24px, corpo 15->17px, nota 13->14px, textarea 15->16px, contador 12->14px, botao 15->16px, saltar 13->14px |
| `StepPremium.tsx` | H2 22->24px, corpo 15->17px, kicker/badges/subs todos para min 14px |
| `StepMasterclass.tsx` | H2 22->24px, corpo 15->17px, kicker/badges/subs todos para min 14px |
| `StepConfirmation.tsx` | H2 22->24px, items 14->15px, subtotais 13->14px, pagamento 12->14px |
| `SummaryPanel.tsx` | Todos os textos abaixo de 14px sobem para 14px |

