

## Alteracoes na pagina /live e calendario

### 1. Atualizar `webinarConfig.ts` - location do calendario
- Mudar `location` de `"Online"` para `"https://imagenscomia.com/live"`

### 2. Header em `WebinarLive.tsx`
- Substituir "DIGITALFC" por "Frederico Carvalho" com estilo mais suave (font-weight medium em vez de bold, tracking normal)

### 3. Remover WhatsApp da caixa de video (`WebinarVideoArea.tsx`)
- Apagar o link WhatsApp e o microcopy "Problemas com acesso ou audio?" do waiting state
- Manter apenas countdown + texto + botao calendario
- Remover import de `MessageCircle`

### 4. Remover 2 bullets do conteudo (`WebinarContent.tsx`)
- Apagar "Variaveis que mudam o resultado: estilo, consistencia e controlo"
- Apagar "Erros comuns que fazem tudo parecer 'stock' ou generico"
- Ficam apenas 3 bullets

### 5. Botao calendario ja esta funcional
- O componente `AddToCalendarButton.tsx` ja usa `add-to-calendar-button-react` com os dados do `webinarConfig.ts`
- Ja esta presente na `/live` (WebinarVideoArea) e no `/upgrade` step 5 (StepConfirmation)
- Basta atualizar o `location` no config para refletir a nova URL

### Ficheiros a modificar
1. `src/components/webinar/webinarConfig.ts` - location
2. `src/pages/WebinarLive.tsx` - header text
3. `src/components/webinar/WebinarVideoArea.tsx` - remover WhatsApp
4. `src/components/webinar/WebinarContent.tsx` - remover 2 bullets

