

# Redesign Hero + Pricing — CRO & UX Upgrade

---

## 1. Hero — Quick Info Cards

Substituir a barra escura actual (linha 39-59 de `HeroSection.tsx`) por **4 cards individuais** dispostos em grid 2x2 mobile / 4 colunas desktop. Cada card tera:
- Fundo `bg-surface` com borda `border` e `rounded-xl`
- Icone colorido (azul/cyan) + texto curto
- Ligeira sombra (`shadow-sm`)

Cards:
1. Calendar + "Ao vivo — 18 Fevereiro"
2. Clock + "10h00 (Portugal)"
3. Timer + "75 minutos"
4. GraduationCap + "Gratuito"

**CTAs** — manter os dois botoes mas ajustar copy:
- Primario: "Reservar Lugar Gratis" (manter como esta, com icone Check)
- Secundario: mudar de "Garantir Premium €15" para **"Ver Premium (€15 + IVA)"** com icone Sparkles

A micro trust line ("Sem spam. Dados protegidos (RGPD). Cancelamento simples.") ja existe e fica como esta.

**Ficheiro:** `src/components/landing/HeroSection.tsx`

---

## 2. Pricing — Redesign como comparacao lado a lado

### Titulo da seccao
Mudar de "Escolha como participar" para **"Como participar"**.

### Free features (simplificar)
Reduzir a lista para corresponder ao pedido:
```
- Webinar ao vivo (75 min)
- Demonstracao ao vivo
- Resumo PDF da sessao
```
Remover: "Acesso a aplicacoes especializadas", "Grupo WhatsApp do evento", "Certificado digital".

### Premium features (ajustar)
Mudar para:
```
- Gravacao da sessao (30 dias)
- Sessao Q&A exclusiva em grupo — 60 min
- Guia completo de prompts (30+ paginas)
```
Remover: "App Gerador de Prompts", "Gravacao HD vitalicia".

### Badge do Premium
Mudar de "RECOMENDADO" para **"Mais completo"**.

### Nota sob os cards
Adicionar: *"O Premium e recomendado para aplicacao pratica depois do evento."*

### Layout dos cards
- Manter grid 2 colunas em desktop
- Em mobile: **Free primeiro, Premium segundo** (inverter a ordem actual que mostra Premium primeiro)
- Free card: borda normal, sem destaque
- Premium card: borda `border-2 border-blue-600`, badge "Mais completo"

### Referral block e trust badges
Manter sem alteracoes.

**Ficheiro:** `src/components/landing/PricingCardsSection.tsx`

---

## Resumo tecnico

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/HeroSection.tsx` | Substituir barra escura por grid de 4 info cards; ajustar copy do CTA secundario |
| `src/components/landing/PricingCardsSection.tsx` | Titulo "Como participar"; simplificar listas free/premium; badge "Mais completo"; nota final; ordem mobile free-primeiro |

Nenhuma dependencia nova. Apenas alteracoes de markup e classes Tailwind.

