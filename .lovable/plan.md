

## Mover botao calendario para fora da caixa de video e refinar visualmente

### Alteracoes

#### 1. `WebinarVideoArea.tsx` - Remover calendario de dentro da caixa
- Remover o `<WebinarCalendarButton />` do waiting state (linha 112)
- Remover o import de `WebinarCalendarButton`
- Remover as duas linhas de texto informativo ("O video fica disponivel..." e "Sugestao: entrar 3-5 min antes") - ficam dentro da caixa apenas o badge "A transmissao comeca em breve" e o countdown
- Refinar visualmente a caixa: adicionar uma borda subtil (`border border-white/5`), melhorar o gradiente de fundo, e dar mais padding vertical para respirar

#### 2. `WebinarLive.tsx` - Adicionar calendario abaixo da caixa de video
- Importar `WebinarCalendarButton`
- Adicionar um bloco entre `<WebinarVideoArea>` e `<WebinarContent>` (apenas no estado waiting, nao live/ended):
  - Texto pequeno: "O video fica disponivel automaticamente 30 min antes do inicio. Sugestao: entrar 3-5 min antes."
  - O botao `<WebinarCalendarButton />` 
  - Estilo: centrado, com spacing adequado (`py-4`), texto em `text-ink-400`

#### 3. Sobre a questao do link direto
- O `add-to-calendar-button` ja oferece menu com Apple, Google, Outlook e Microsoft 365 - e a melhor UX porque cada pessoa escolhe o seu calendario
- Nao e necessario dar apenas o link do Google; o componente ja resolve isso automaticamente

### Ficheiros a modificar
1. `src/components/webinar/WebinarVideoArea.tsx` - limpar interior da caixa
2. `src/pages/WebinarLive.tsx` - adicionar calendario + texto abaixo da caixa

