

# Duplicar /recursos-video → /recursos-masterclass

Nova página de recursos dedicada à Masterclass, com estrutura idêntica à de /recursos-video mas com branding, sessionStorage keys e conteúdo próprios.

## Ficheiros a criar

### 1. `src/pages/RecursosMasterclass.tsx`
Cópia de `RecursosVideo.tsx` com:
- sessionStorage keys: `recursos_masterclass_token`, `recursos_masterclass_email`, `recursos_masterclass_plan`, `recursos_masterclass_name`
- Componentes próprios: `RecursosMasterclassLogin` e `RecursosMasterclassConteudo`

### 2. `src/components/recursos/RecursosMasterclassLogin.tsx`
Cópia de `RecursosVideoLogin.tsx` com:
- Branding "Masterclass · Vídeo com IA" em vez de "Vídeo com IA"
- sessionStorage keys com prefixo `recursos_masterclass_`
- Mesma lógica de acesso cross-webinar (planos masterclass/bundle/video-masterclass/video-bundle)

### 3. `src/components/recursos/RecursosMasterclassConteudo.tsx`
Cópia de `RecursosVideoConteudo.tsx` com:
- Config `MASTERCLASS_RECURSOS_CONFIG` com URLs vazios/placeholder para Vimeo, áudio, workbook, etc.
- Header "Masterclass — Recursos"
- Capítulos placeholder para preencher depois
- Sem upsell de Masterclass (já estão na Masterclass)

## Ficheiro a editar

### 4. `src/App.tsx`
- Adicionar rota `/recursos-masterclass` → `RecursosMasterclass`

