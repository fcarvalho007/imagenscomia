

# Actualizar índice da sessão em /recursos-video

## Alterações em `src/components/recursos/RecursosVideoConteudo.tsx`

### 1. Substituir `chapters` no `VIDEO_RECURSOS_CONFIG` (linhas 15-20)
Novos 5 capítulos com os títulos e descrições fornecidos. Cada item terá `time`, `label` (título curto) e `description` (texto explicativo).

### 2. Redesenhar a lista do índice (linhas 111-143)
Em vez de items clicáveis simples com timestamp, mostrar cards com:
- Número do capítulo
- Título em bold
- Descrição em texto pequeno (cinza)
- Sem timestamps (não foram fornecidos)

### 3. Remover secção "Apoio ao conhecimento" (linhas 145-183)
Apagar o divider e toda a secção com os 3 links (Workbook, Guia GEMs, Ficheiro GEM) — já estão na sidebar.

### 4. Limpar imports não utilizados
Remover `BookOpen` do import (já não é usado).

