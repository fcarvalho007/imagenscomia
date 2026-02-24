
# Corrigir link Google Calendar do webinar Video em todos os locais

O link correcto do evento Google Calendar e:
```
https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MTI2azhxdmZzMWs0OWsxMWhqcHIyODZoYTQgZnJlZGVyaWNvZGlnaXRhbEBt&tmsrc=fredericodigital%40gmail.com
```

Actualmente, 3 locais usam links gerados automaticamente (incorrectos) em vez deste link real do evento:

## Locais a corrigir

### 1. Email de confirmacao (Edge Function)
**Ficheiro:** `supabase/functions/send-video-confirmation/index.ts` (linha 12-13)
- Substituir o URL `calendar.google.com/calendar/render?action=TEMPLATE&text=...` pelo link correcto do evento
- Isto corrige o botao "Adicionar ao Google Calendar" no primeiro email enviado

### 2. Pagina /live-video — area de video com countdown
**Ficheiro:** `src/components/webinar/VideoWebinarVideoArea.tsx` (linhas 14-21)
- Substituir a constante `GOOGLE_CAL_URL` gerada dinamicamente pelo link correcto
- Isto corrige o botao "Guardar no Google Calendar" na sala de espera

### 3. Pagina /confirmacao — modal "o teu lugar esta reservado"
**Ficheiro:** `src/components/landing/ConfirmacaoExtras.tsx` (linhas 45-48)
- Quando `webinar === "video"`, usar o link fixo do evento em vez de gerar dinamicamente
- Manter a geracao dinamica para o webinar de imagens (que nao tem evento criado)

### Ja correcto
- `src/pages/UpgradeSucesso.tsx` (linha 150) — ja usa o link correcto

## Resumo tecnico

| Ficheiro | Tipo | Alteracao |
|---|---|---|
| `send-video-confirmation/index.ts` | Edge Function | Substituir GOOGLE_CAL_URL pelo link do evento real |
| `VideoWebinarVideoArea.tsx` | Componente | Substituir GOOGLE_CAL_URL pelo link do evento real |
| `ConfirmacaoExtras.tsx` | Componente | Condicional: link fixo para video, dinamico para imagens |

Apos as alteracoes, e necessario re-deploy da edge function (automatico).
