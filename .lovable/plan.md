

# Activar YouTube Live em /live-video

## Alterações

### 1. `src/components/webinar/videoWebinarConfig.ts`
- `YOUTUBE_VIDEO_ID: "gmEFoOugl6k"`
- `isLive: true`

### 2. `src/components/webinar/VideoWebinarVideoArea.tsx`
- Ler `isLive` e `YOUTUBE_VIDEO_ID` da config
- Se `isLive` e ID preenchido → mostrar iframe YouTube embed (`https://www.youtube.com/embed/gmEFoOugl6k`) em 16:9 + botão "Abrir no YouTube" como fallback (padrão já usado em `WebinarVideoArea.tsx`)
- Caso contrário → manter countdown actual

