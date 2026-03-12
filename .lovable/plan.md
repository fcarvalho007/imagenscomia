

# Remover frase do template `video_masterclass_thankyou`

## Alterações

### 1. Edge function fallback (`supabase/functions/send-video-masterclass-thankyou/index.ts`)
- Remover linha 30: `<p ...>Mesmo que não tenhas conseguido estar presente, vais receber tudo na mesma.</p>`

### 2. Base de dados (`email_templates`)
- UPDATE do `html_body` para remover a mesma frase do template guardado na DB.

