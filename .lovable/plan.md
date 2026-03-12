

# Corrigir conteúdo do template `video_masterclass_thankyou`

## Alterações

### 1. Fallback HTML no edge function (`supabase/functions/send-video-masterclass-thankyou/index.ts`)

Substituir o corpo do email (linhas 17-35) pelo novo conteúdo:

- **Header**: manter "Masterclass · Vídeo Profissional com IA" (já está)
- **H1**: Remover "A sessão terminou." — sem título H1 explícito, ou usar algo neutro
- **Corpo novo**:
  - "Olá {{fname}},"
  - "Chegou ao fim a Masterclass de Vídeo Profissional com Inteligência Artificial e a sequência de conteúdos ao tema de conteúdo visual."
  - "Para quem teve a oportunidade de assistir ao vivo, obrigado pela presença e participação."
  - Bloco verde: "📦 Nas próximas 24 horas, vou enviar novo email, com o acesso à gravação completa, materiais e conteúdo complementar do que foi partilhado durante a sessão."
  - "Adicionalmente:" com lista numerada:
    1. "Para rever o conteúdo e ficheiros do webinar Imagens com IA (18 Fev):" + link recursos
    2. "Para rever o conteúdo e ficheiros do webinar Vídeo com IA (12 Fev):" + link recursos-video
  - "Acesso através do email registado na plataforma."
  - "Acredito que a documentação e os processos vão trazer valor acrescentado."
- **Assinatura**: manter Frederico Carvalho / DIGITALFC

### 2. Base de dados (`email_templates`)

UPDATE do `html_body` na tabela `email_templates` para `template_key = 'video_masterclass_thankyou'` com o mesmo HTML actualizado.

### Ficheiros alterados
| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/send-video-masterclass-thankyou/index.ts` | Novo corpo do fallback HTML |
| DB `email_templates` | UPDATE html_body |

