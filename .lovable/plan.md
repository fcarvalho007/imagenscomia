

## Correcoes na pagina /live

### 1. Atualizar URL do Instagram no `webinarConfig.ts`
- Mudar `INSTAGRAM_URL` de `"https://instagram.com/fredericocarvalho"` para `"https://www.instagram.com/frederico.m.carvalho/"`

### 2. Mover texto informativo para dentro da caixa de video (`WebinarVideoArea.tsx`)
- Adicionar o texto "O video fica disponivel automaticamente 30 min antes do inicio. Sugestao: entrar 3-5 min antes." dentro da caixa preta, abaixo do countdown
- Estilo: texto branco com opacidade baixa (`text-white/40`), tamanho pequeno, centrado

### 3. Atualizar bloco abaixo da caixa em `WebinarLive.tsx`
- Remover o paragrafo de texto (ja esta dentro da caixa)
- Manter apenas o botao `<WebinarCalendarButton />` centrado abaixo da caixa

### Ficheiros a modificar
1. `src/components/webinar/webinarConfig.ts` - URL Instagram
2. `src/components/webinar/WebinarVideoArea.tsx` - adicionar texto dentro da caixa
3. `src/pages/WebinarLive.tsx` - remover texto duplicado, manter so calendario

