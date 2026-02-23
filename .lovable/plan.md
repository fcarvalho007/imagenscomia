

# Corrigir troca de video de fundo

## Problema

O video `hero-vidro.mp4` foi erradamente substituido pelo novo ficheiro, quando o correcto era substituir o `rosa-video.mp4` (usado na seccao "O mercado exige Video.", linha 416 de `src/pages/Video.tsx`).

## Alteracoes

### 1. Restaurar `hero-vidro.mp4`

Reverter `public/videos/hero-vidro.mp4` para o ficheiro original (antes da troca errada). Remover tambem o `scale(1.06)` e `objectPosition: center 40%` que foram adicionados — o hero original nao tinha marca de agua, portanto nao precisava de crop.

**Ficheiro:** `src/pages/Video.tsx` (linha 268)

De:
```
style={{ zIndex: 0, opacity: 0.35, objectFit: "cover", objectPosition: "center 40%", transform: "scale(1.06)" }}
```

Para:
```
style={{ zIndex: 0, opacity: 0.35, objectFit: "cover" }}
```

### 2. Substituir `rosa-video.mp4` pelo novo video

Copiar o ficheiro enviado pelo utilizador (`user-uploads://Animar_em_loop_202602231226_6c6lv.mp4`) para `public/videos/rosa-video.mp4`.

### 3. Aplicar crop ao video na seccao "O mercado exige Video."

O novo video tem a marca "veo" no canto inferior direito. Aplicar o mesmo truque de scale + object-position para a esconder.

**Ficheiro:** `src/pages/Video.tsx` (linha 415)

De:
```html
<video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0, opacity: 0.7 }}>
```

Para:
```html
<video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full" style={{ zIndex: 0, opacity: 0.7, objectFit: "cover", objectPosition: "center 40%", transform: "scale(1.06)" }}>
```

---

## Ficheiros afectados

| Ficheiro | Alteracao |
|----------|-----------|
| `public/videos/hero-vidro.mp4` | Restaurar ficheiro original (reverter copia errada) |
| `public/videos/rosa-video.mp4` | Substituir pelo novo video enviado pelo utilizador |
| `src/pages/Video.tsx` (linha 268) | Remover crop desnecessario do hero |
| `src/pages/Video.tsx` (linha 415) | Adicionar crop para esconder marca "veo" |

