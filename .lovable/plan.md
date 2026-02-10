
# Padronizar Botões CTA — Distinção Visual + Copy Consistente

---

## Problema

Os dois botões (Grátis e Premium) usam gradientes muito semelhantes (purple→blue e blue→cyan), tornando difícil distingui-los rapidamente. O copy também varia entre secções ("Reservar lugar grátis", "Garantir lugar grátis", "Inscrever grátis").

---

## Solução

### 1. Distinção visual clara

- **Botão Grátis (primário)**: Manter o gradiente purple→blue (`from-neon-purple to-blue-600`) — este é o CTA principal
- **Botão Premium (secundário)**: Mudar para estilo **outline/border** com texto cyan, sem gradiente preenchido. Classe: `border-2 border-neon-cyan text-neon-cyan bg-transparent hover:bg-neon-cyan/10`. Isto cria contraste visual imediato entre os dois

### 2. Copy padronizado em todas as secções

| Secção | Botão Grátis | Botão Premium |
|--------|-------------|---------------|
| HeroSection | "Reservar Lugar Grátis!" | "Garantir Premium €15" |
| CTAFinalSection | "Reservar Lugar Grátis!" | "Garantir Premium €15" |
| PricingCardsSection | Já tem "Inscrever grátis" e "Garantir Premium €15" — manter |

---

## Ficheiros a editar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/landing/HeroSection.tsx` | Mudar estilo do botão premium para outline cyan; padronizar copy |
| `src/components/landing/CTAFinalSection.tsx` | Mesmas alterações de estilo e copy |
