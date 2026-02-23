
# Corrigir datas na pagina /confirmacao e /upgrade-video

## Problema

1. **`/confirmacao`**: A pagina importa `WEBINAR_CONFIG` (Imagens) e mostra "Cria Imagens Profissionais com IA" e "Quarta-feira, 18 de Fevereiro" no card de partilha social — independentemente do webinar. Precisa de ser context-aware.

2. **`/upgrade-video`**: Quando o utilizador nao selecciona nada e clica "skip", redireciona para `/confirmacao` sem parametro `webinar=video`.

## Alteracoes

### 1. `src/components/landing/ConfirmacaoExtras.tsx`

- Aceitar prop opcional `webinar?: "imagens" | "video"`
- Quando `webinar === "video"`, usar titulo e metaLine do `VIDEO_WEBINAR_CONFIG` em vez de `WEBINAR_CONFIG`
- Actualizar o share text e o card de partilha social para reflectir o webinar correcto

### 2. `src/pages/Confirmacao.tsx`

- Ler `searchParams.get("webinar")` para determinar o contexto
- Passar `webinar` como prop a `ConfirmacaoExtras`
- Actualizar o `usePageMeta` dinamicamente (titulo "Webinar Video com IA" quando aplicavel)

### 3. `src/pages/UpgradeVideo.tsx`

- Linha 316: alterar redirect de `/confirmacao` para `/confirmacao?webinar=video` para manter o contexto

## Ficheiros a modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/ConfirmacaoExtras.tsx` | Prop `webinar`, logica condicional para titulo/metaLine |
| `src/pages/Confirmacao.tsx` | Ler param `webinar`, passar a ConfirmacaoExtras, meta dinamico |
| `src/pages/UpgradeVideo.tsx` | Corrigir redirect para incluir `?webinar=video` |
