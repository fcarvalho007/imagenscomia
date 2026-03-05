

# Criar página /recursos-video

## Contexto

A página `/recursos` actual é dedicada ao **webinar Imagens com IA** (18 Fev). Precisa de uma versão duplicada em `/recursos-video` para o **webinar Vídeo com IA** (5 Mar), com conteúdo diferente (vídeo Vimeo, capítulos, recursos PDF, etc.) mas mantendo a mesma estrutura visual e lógica de autenticação.

## Plano

### 1. Novo ficheiro `src/pages/RecursosVideo.tsx`
Duplicar `Recursos.tsx` mas com:
- SessionStorage keys separadas: `recursos_video_token`, `recursos_video_email`, etc.
- Query filtrada por `webinar = 'video'` na validação
- Importar `RecursosVideoLogin` e `RecursosVideoConteudo`

### 2. Novo ficheiro `src/components/recursos/RecursosVideoLogin.tsx`
Duplicar `RecursosLogin.tsx` com:
- Branding "Vídeo com IA" em vez de "Imagens com IA"
- Cor verde (#16a34a) em vez de azul
- SessionStorage keys com prefixo `recursos_video_`

### 3. Novo ficheiro `src/components/recursos/RecursosVideoConteudo.tsx`
Duplicar `RecursosConteudo.tsx` com:
- Título: "Vídeo com IA — Recursos"
- Cor primária verde em vez de azul
- `VIDEO_RECURSOS_CONFIG` com:
  - Vimeo embed URL: placeholder (a preencher depois — webinar ainda a decorrer)
  - Capítulos do webinar vídeo (placeholders)
  - Recursos sidebar: PDFs/links do webinar vídeo (placeholders por agora)
- Header e badge adaptados ao branding "Vídeo com IA"
- Upsell na sidebar: referência à masterclass de 12 Março

### 4. Rota em `src/App.tsx`
Adicionar `<Route path="/recursos-video" element={<RecursosVideo />} />`

### Ficheiros
- **Novos**: `src/pages/RecursosVideo.tsx`, `src/components/recursos/RecursosVideoLogin.tsx`, `src/components/recursos/RecursosVideoConteudo.tsx`
- **Editado**: `src/App.tsx` (1 linha — nova rota)

Os conteúdos (URL Vimeo, PDFs, capítulos) ficam como placeholders editáveis no `VIDEO_RECURSOS_CONFIG`, prontos para actualizar quando o webinar terminar.

