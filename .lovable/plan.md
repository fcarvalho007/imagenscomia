

# Restaurar vídeo de fundo do Hero na página /video

## Resumo

Copiar o vídeo enviado pelo utilizador para `public/videos/hero-vidro.mp4`, substituindo o ficheiro errado que lá está actualmente. O código já está correcto (sem crop/scale) desde a última edição, portanto não é necessária nenhuma alteração de código.

## Alterações

### 1. Substituir o ficheiro de vídeo

Copiar `user-uploads://14114346_1920_1080_30fps.mp4` para `public/videos/hero-vidro.mp4`.

O elemento `<video>` na linha 268 de `src/pages/Video.tsx` já aponta para este caminho com os estilos correctos (`objectFit: "cover"`, sem scale/crop), portanto não é preciso alterar código.

## Ficheiros afectados

| Ficheiro | Alteração |
|----------|-----------|
| `public/videos/hero-vidro.mp4` | Substituído pelo vídeo original enviado pelo utilizador |

