

# Substituir player por ecrã de "Transmissão concluída"

## Alterações

### 1. `videoWebinarConfig.ts`
- Mudar `isLive: false` (a transmissão terminou)
- Adicionar `isEnded: true`

### 2. `VideoWebinarVideoArea.tsx`
- Adicionar um novo bloco condicional no topo: se `isEnded` → mostrar caixa preta (aspect-video) com:
  - Badge "Transmissão concluída" (com ícone CheckCircle2)
  - Título: "Agradecemos por participar!"
  - Texto: "A gravação em alta definição + materiais de suporte (sumários, listas de verificação e instruções) estão disponíveis por 27 €."
  - CTA: "Assistir ao vídeo gravado com Inteligência Artificial →" apontando para `/gravacao`
- O estado de countdown/waiting fica como fallback mas não será atingido

Design: reutilizar o mesmo padrão visual do `WebinarVideoArea` ended state — fundo escuro com grid subtil, texto branco centrado.

### Ficheiros
- `src/components/webinar/videoWebinarConfig.ts`
- `src/components/webinar/VideoWebinarVideoArea.tsx`

