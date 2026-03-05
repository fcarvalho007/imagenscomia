

# Actualizar recursos do webinar Vídeo com IA

## Alterações em `src/components/recursos/RecursosVideoConteudo.tsx`

### 1. Configuração (`VIDEO_RECURSOS_CONFIG`)
- `vimeoEmbedUrl` → `"https://player.vimeo.com/video/1170832797?badge=0&autopause=0&player_id=0&app_id=58479"`
- `resumoPdfUrl` → remover (não mencionado pelo user)
- `audioUrl` → `"https://drive.google.com/file/d/1X4dLWqXg0w4In-n7QFWdM_0Ajh6p7lxp/view?usp=sharing"`
- Adicionar novos campos:
  - `workbookUrl` → `"https://drive.google.com/file/d/1qX_t_Sh3qadFj2PviOZkGvOHTQPzapPW/view?usp=sharing"`
  - `guiaGemsUrl` → `"https://drive.google.com/file/d/18o9LPR9st0I1lZaQUBqgi-9-Wp2W0Y2x/view?usp=sharing"`
  - `ficheiroGemUrl` → `"https://drive.google.com/file/d/13UsoucnxmGSYY1UhDLo7SjqFIjkQ4Xyk/view?usp=sharing"`

### 2. Secção "Apoio ao conhecimento" (main column)
Substituir os 2 placeholders "Em breve" por recursos activos:
- **Workbook Vídeo com IA** (link workbook)
- **Guia de Apoio GEMs - Google Gemini** (link guia GEMs)
- **Ficheiro para anexar ao GEM** (link ficheiro GEM)

### 3. Sidebar "Recursos"
- Manter **Resumo da sessão** (ainda "Em breve" — não foi fornecido)
- **Áudio do Webinar** → link real, remover "Em breve"
- Substituir **SOP de Prompts** e **Recurso Extra** pelos novos recursos (workbook, guia GEMs, ficheiro GEM)

### Ficheiro a editar (1)
- `src/components/recursos/RecursosVideoConteudo.tsx`

