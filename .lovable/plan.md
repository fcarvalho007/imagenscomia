
## Alterar texto do Q&A no Premium Pass

### Problema
O texto do benefício de Q&A está em dois ficheiros com conteúdo desatualizado:
- "Q&A exclusivo (60 min)" 
- "Dúvidas respondidas com foco no caso real."

### Solução
Alterar para o novo texto em ambos os ficheiros:
- "Sessão extra com Q&A exclusivo em grupo (30 min)"
- "Dúvidas respondidas ao vivo"

### Ficheiros afectados

| Ficheiro | Linha | Campo | Alteração |
|---|---|---|---|
| `src/components/webinar/WebinarSidebar.tsx` | 82 | Texto do benefício | "Q&A exclusivo (60 min)" → "Sessão extra com Q&A exclusivo em grupo (30 min)" |
| `src/components/upgrade/StepPremium.tsx` | 15 | `title` | "Q&A exclusivo (60 min)" → "Sessão extra com Q&A exclusivo em grupo (30 min)" |
| `src/components/upgrade/StepPremium.tsx` | 16 | `sub` | "Dúvidas respondidas com foco no caso real." → "Dúvidas respondidas ao vivo" |

### Alterações técnicas

1. Na `WebinarSidebar.tsx` (linha 82), alterar o texto no benefits array
2. Na `StepPremium.tsx` (linhas 15-16), alterar o object do bullet array
