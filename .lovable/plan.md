

# Substituir video na seccao "Video e o formato que o mercado exige"

## Resumo

Substituir o ficheiro de video de fundo actual (`rosa-video.mp4`) pelo novo ficheiro enviado pelo utilizador.

## Alteracoes

### 1. Copiar novo ficheiro

Copiar `user-uploads://4_rosa_video_webinar_frederico-2.mp4` para `public/videos/rosa-video.mp4`, substituindo o ficheiro existente.

### 2. Sem alteracoes de codigo

O `src/pages/Video.tsx` ja referencia `/videos/rosa-video.mp4` (linha 403), por isso nao e necessario alterar nenhum codigo — basta substituir o ficheiro.

---

## Detalhes tecnicos

- **Ficheiro substituido:** `public/videos/rosa-video.mp4`
- **Ficheiro fonte:** `user-uploads://4_rosa_video_webinar_frederico-2.mp4`
- **Ficheiros de codigo alterados:** nenhum

