
# 4 Correcoes em /upgrade-video, /video, /confirmacao e /live-video

## 1. Scroll to top ao mudar de passo (/upgrade-video)

O `advanceStep` ja faz `window.scrollTo({ top: 0 })`, mas a animacao framer-motion pode causar que o scroll nao aconteca antes do render. Vou adicionar um `useEffect` que detecta mudancas no `step` e forca scroll to top, garantindo que cada passo comeca de cima.

**Ficheiro:** `src/pages/UpgradeVideo.tsx`
- Adicionar `useEffect` com dependencia em `step` que faz `window.scrollTo({ top: 0, behavior: "instant" })`

## 2. Countdown centrado em mobile (/video)

Na sticky top bar da pagina /video, o countdown esta alinhado a esquerda (`flex items-center justify-between`). Em mobile, o botao CTA esta `hidden sm:block`, sobrando espaco a direita. Vou centrar o countdown em mobile adicionando `max-sm:mx-auto` ou `max-sm:justify-center` ao container.

**Ficheiro:** `src/pages/Video.tsx` (linhas 224-225)
- Mudar o container flex para centralizar o countdown em mobile: adicionar `max-sm:justify-center` ao div pai

## 3. Corrigir botoes sociais na confirmacao

O LinkedIn share URL actual usa `sharing/share-offsite` que funciona. Mas o pedido e: remover X/Twitter e adicionar WhatsApp. O botao WhatsApp usara `https://wa.me/?text=...` para partilha directa.

**Ficheiro:** `src/components/landing/ConfirmacaoExtras.tsx`
- Remover import `Twitter` de lucide-react
- Remover o botao X/Twitter
- Adicionar botao WhatsApp com URL `https://wa.me/?text={SHARE_TEXT + URL}` e cor verde (#25D366)
- Manter LinkedIn e Copiar link

## 4. Adicionar WhatsApp Support Button a /video

A pagina /video nao tem o `WhatsAppSupportButton`. As paginas /upgrade-video e /live-video ja o tem. Basta adicionar o import e o componente antes do fecho do div principal.

**Ficheiro:** `src/pages/Video.tsx`
- Adicionar `import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton"`
- Adicionar `<WhatsAppSupportButton />` antes do `<RegistrationModal />`

---

## Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/pages/UpgradeVideo.tsx` | useEffect para scroll to top ao mudar step |
| `src/pages/Video.tsx` | Countdown centrado em mobile + WhatsApp FAB |
| `src/components/landing/ConfirmacaoExtras.tsx` | Remover Twitter, adicionar WhatsApp share |
