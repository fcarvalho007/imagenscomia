
# Ajustes na pagina /confirmacao

## Alteracoes

### 1. Titulo com primeiro nome (Confirmacao.tsx, linha 93-95)

Mudar o titulo para usar o primeiro nome apenas e tratamento por "tu":

- Antes: `O seu lugar está reservado, ${userName}!`
- Depois: `${firstName}, o teu lugar está reservado!`

Extrair o primeiro nome do parametro `name` da URL:
```
const firstName = userName.split(" ")[0];
```

Quando nao ha nome: "O teu lugar está reservado!"

### 2. Remover "A sua inscrição foi confirmada." (linha 98-100)

Remover completamente o paragrafo com essa frase. Manter apenas a frase do calendario.

### 3. Manter "Adicione ao calendário para não se esquecer." (linha 102-103)

Esta frase ja existe e esta correcta. Manter como esta.

### 4. Verificar botao Google Calendar (ConfirmacaoExtras.tsx)

O link do Google Calendar esta a ser gerado dinamicamente com o formato correcto:
- URL: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...`
- Formato de data: `20260305T100000Z` (correcto para Google Calendar API)

O botao abre num novo separador (`target="_blank"`). A logica esta correcta, mas o problema reportado anteriormente (URL sem parametros `name`/`email`/`plan`) sugere que o utilizador testou na versao publicada (antes das alteracoes). Na versao de preview o calendario devera funcionar correctamente.

## Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/pages/Confirmacao.tsx` | Extrair primeiro nome; mudar titulo para "Frederico, o teu lugar está reservado!"; remover frase "A sua inscrição foi confirmada." |

Apenas 1 ficheiro a alterar.
