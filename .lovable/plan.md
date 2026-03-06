

# Corrigir dias da semana e nota de acesso nos 3 templates

## Erros encontrados

1. **Dia da semana errado** — 10 de Março é **terça-feira** (diz "Segunda-feira"), 12 de Março é **quinta-feira** (diz "Quarta-feira")
2. **Falta nota de acesso** — após o botão "Aceder aos Recursos →", não explica que o acesso em /recursos-video é feito com o email de registo

## Alterações em `supabase/functions/send-video-recursos-access/index.ts`

### premiumHtml
- Linha 59: após o CTA "Aceder aos Recursos →", adicionar nota: "Para aceder, insere o email com que te registaste."
- Linha 65: "Segunda-feira" → "Terça-feira"
- Linha 78: "Quarta-feira" → "Quinta-feira"

### masterclassHtml
- Linha 104: "Quarta-feira" → "Quinta-feira"
- Após CTA do Premium Pass (linha 134), não tem CTA de recursos — sem alteração de nota

### bundleHtml
- Linha 163: após o CTA "Aceder aos Recursos →", adicionar nota: "Para aceder, insere o email com que te registaste."
- Linha 168: "Quarta-feira" → "Quinta-feira"

### Após deploy
- Invocar com `dry_run: true` para sincronizar os 3 templates na BD

