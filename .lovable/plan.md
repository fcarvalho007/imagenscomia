

# Actualizacao de datas e informacao em /confirmacao, /upgrade-video e /live-video

## Resumo

Corrigir datas incorrectas, substituir o botao de calendario generico por link directo ao Google Calendar do Frederico, e tornar toda a informacao de datas/eventos transparente e consistente nas 3 paginas.

---

## Problemas encontrados

### /confirmacao (ConfirmacaoExtras.tsx)
- Usa `WebinarCalendarButton` generico (add-to-calendar-button-react) em vez do link directo ao Google Calendar do Frederico

### /upgrade-video (UpgradeVideo.tsx)
- Linha 219: "3 Mar . 21h00" -- data e hora erradas (deve ser 5 Mar, 10h)
- Sidebar Premium: nao menciona Q&A dia 10 Mar 14:30h
- Sidebar Masterclass: nao menciona data correcta

### /upgrade-video (StepVideoPremium.tsx)
- Nao menciona Q&A dia 10 de Marco, 14:30h-15:00h

### /upgrade-video (StepMasterclass.tsx)
- Linha 61: "Pagamento unico . 5 de Marco" -- data errada (Masterclass e 12 de Marco)
- Nao especifica horario (10h-13h)

### /live-video (WebinarLiveVideo.tsx)
- Linha 19: subtitle "Terca-feira, 3 de Marco, 21h" -- data e hora erradas
- VideoWebinarSidebar linha 123: "5 de Marco (quinta-feira)" -- data errada para Masterclass (deve ser 12 de Marco)
- Premium Pass no sidebar: nao menciona Q&A dia 10 Mar

### /upgrade/sucesso (UpgradeSucesso.tsx)
- Usa `WebinarCalendarButton` generico -- deve usar link Google Calendar do Frederico (mesmo que /confirmacao)
- Titulo meta referencia "Imagens" mas pode ser acedido apos compra de Video

---

## Alteracoes por ficheiro

### 1. `src/components/landing/ConfirmacaoExtras.tsx`

**Passo 2 -- Calendario**: Substituir `<WebinarCalendarButton>` por link directo ao Google Calendar:
```
<a href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MTI2azhxdmZzMWs0OWsxMWhqcHIyODZoYTQgZnJlZGVyaWNvZGlnaXRhbEBt&tmsrc=fredericodigital%40gmail.com"
   target="_blank" rel="noopener noreferrer"
   class="botao estilizado com icone Google Calendar">
   Adicionar ao Google Calendar
</a>
```
Remover import de `WebinarCalendarButton`.

### 2. `src/pages/UpgradeVideo.tsx`

- Linha 219: trocar "3 Mar . 21h00" por "5 Mar . 10h00"
- Sidebar Premium (linha 201): acrescentar sub-linha "Q&A: 10 Mar, 14:30h"
- Sidebar Masterclass (linha 210): trocar sub "3h . Online" por "12 Mar . 10h-13h . Online"

### 3. `src/components/upgrade/StepVideoPremium.tsx`

- Adicionar bullet ou sub-texto no Q&A: "Terca-feira, 10 de Marco, 14:30h-15:00h"
- Actualizar subtitulo do bullet existente "Sessao Q&A exclusiva (30 min)" para incluir a data

### 4. `src/components/upgrade/StepMasterclass.tsx`

- Linha 61: trocar "Pagamento unico . 5 de Marco" por "Quinta-feira, 12 de Marco . 10h-13h"
- Nos event details (linha 87-89): adicionar "📅 12 de Marco" ao array

### 5. `src/components/webinar/VideoWebinarSidebar.tsx`

- Premium Pass: acrescentar benefit ou dateLine com "Q&A: Terca, 10 Mar, 14:30h"
- Masterclass dateLine (linha 123): trocar "5 de Marco (quinta-feira)" por "12 de Marco (quinta-feira) . 10h-13h"

### 6. `src/pages/WebinarLiveVideo.tsx`

- Linha 19: trocar subtitle de "Terca-feira, 3 de Marco, 21h" por "Quarta-feira, 5 de Marco, 10h"

### 7. `src/pages/UpgradeSucesso.tsx`

- Substituir `<WebinarCalendarButton />` (linha 149) por link directo ao Google Calendar do Frederico (mesmo URL que /confirmacao)
- Remover import de `WebinarCalendarButton`

### 8. `src/components/webinar/VideoWebinarVideoArea.tsx`

- O GOOGLE_CAL_URL generico (linhas 14-21) ja esta correcto para 5 de Marco -- manter

---

## Datas de referencia (fonte de verdade)

| Evento | Data | Hora | Dia da semana |
|--------|------|------|---------------|
| Webinar Video | 5 Marco 2026 | 10h00-11h00 | Quarta-feira |
| Q&A Premium | 10 Marco 2026 | 14:30h-15:00h | Terca-feira |
| Masterclass | 12 Marco 2026 | 10h00-13h00 | Quinta-feira |

## Ficheiros a modificar

| Ficheiro | Alteracoes |
|----------|-----------|
| `src/components/landing/ConfirmacaoExtras.tsx` | Substituir WebinarCalendarButton por link Google Calendar |
| `src/pages/UpgradeVideo.tsx` | Corrigir datas no sidebar (3 instancias) |
| `src/components/upgrade/StepVideoPremium.tsx` | Adicionar data do Q&A ao bullet |
| `src/components/upgrade/StepMasterclass.tsx` | Corrigir data para 12 Marco + horario |
| `src/components/webinar/VideoWebinarSidebar.tsx` | Corrigir Masterclass date + adicionar Q&A info |
| `src/pages/WebinarLiveVideo.tsx` | Corrigir subtitle do RegistrationModalProvider |
| `src/pages/UpgradeSucesso.tsx` | Substituir WebinarCalendarButton por link Google Calendar |

## Notas

- Nenhuma alteracao de BD ou edge functions
- O link do Google Calendar do Frederico e estatico (pre-criado) -- nao depende de config
- As alteracoes sao puramente de copy/datas
