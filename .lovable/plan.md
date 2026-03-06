

# Actualizar "O que recebes" em /video

## Alterações em `src/pages/Video.tsx`

### 1. Array `packItems` (linha 172)
Substituir o item "Guia de prompts para vídeo" por dois novos items:

```typescript
{ Icon: FileText, title: "Workbook Resumo da Sessão", desc: "Documento PDF com os pontos-chave e exercícios da sessão." },
{ Icon: FileText, title: "Guia técnico de GEMs para vídeo", desc: "Apoio para criação de GEMs especializados em vídeo no Gemini." },
```

### 2. Texto resumo (linha 816)
Actualizar a frase de `"Sessão HD + guia de prompts + sessão Q&A ao vivo."` para `"Sessão HD + workbook + guia GEMs + sessão Q&A ao vivo."`.

