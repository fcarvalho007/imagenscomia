

# Correcção do email pós-evento (video_confirmation_post_event)

## Problema

O template `video_confirmation_post_event` na base de dados:
- Diz "Obrigado pela inscrição" — linguagem de webinar, não de produto
- Faltam os 5 entregáveis completos (falta o "Ficheiro GEM pronto a importar")
- Tom ainda de "inscrição" em vez de acesso a um produto independente

Os templates `video_confirmation` e `video_confirmation_returning` também estão obsoletos (referenciam "5 de Março", calendário, link ao vivo), mas como o sistema já encaminha para `post_event`, são secundários.

## Alterações

### 1. Actualizar template `video_confirmation_post_event` na base de dados

**Subject novo:** `{{fname}}, a tua sessão prática de vídeo com IA 🎬`

**HTML novo** — email limpo, posicionado como produto:
- Header gradient com "Sessão Prática · Vídeo Profissional com IA" e "Acesso imediato aos teus conteúdos"
- Corpo: "Olá {{fname}}, Tudo pronto." Sem referência a inscrição ou webinar passado
- Bloco Premium Pass (€27+IVA) com os **5 entregáveis completos**
- Bloco Masterclass (€47+IVA) com descrição concisa
- CTA: "Obter o Premium Pass" → `/upgrade-video`
- Footer com WhatsApp e assinatura

### 2. Actualizar fallback `buildPostEventHtml` na edge function

Alinhar com o mesmo conteúdo do template da base de dados para consistência, incluindo os 5 entregáveis e a mesma estrutura.

### 3. Actualizar subject no edge function fallback

De `"A sessão prática de vídeo com IA — acesso imediato"` para o mesmo subject do template.

### Ficheiros alterados
- `supabase/functions/send-video-confirmation/index.ts` (fallback HTML e subject)
- Base de dados: UPDATE do template `video_confirmation_post_event`

