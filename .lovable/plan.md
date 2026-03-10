

# Resultados da verificação + Tab de Comunicação na ficha de cliente

## 1. Inscritos Bundle sem email de recursos

Encontrei **2 inscritos bundle** que **não receberam** o email de recursos:

| Nome | Email | Plano | Webinar |
|------|-------|-------|---------|
| Pedro Vilarinho | pedro.vilarinho@gmail.com | bundle | imagens |
| Silvana Curado | silvanacurado@gmail.com | bundle | imagens |

Todos os outros bundle (video-bundle) já receberam. Na implementação, invocarei a edge function `send-video-recursos-single` para ambos.

## 2. Nova tab "Comunicação" na ficha de cliente

Adicionar uma 5ª tab ao `InscritoModal` chamada **"Comunicação"** que permite enviar email ou SMS individualmente a esse inscrito.

### Conteúdo da tab:
- **SMS**: Reutiliza o `SmsComposer` já existente (com selector de provider SMSEasy/E-goi), mas embebido na tab em vez de inline na sidebar
- **Email**: Campo de assunto + editor HTML simples (textarea) + botão enviar que chama `send-email` via edge function, pré-preenchendo o destinatário com o email do inscrito
- **Botão "Enviar email de recursos"**: Atalho rápido para a edge function `send-video-recursos-single` (visível apenas para pagos)

### Ficheiros alterados:
- `src/components/crm/modal/TabComunicacao.tsx` (novo) — componente da tab com SMS composer + email composer individual
- `src/components/crm/InscritoModal.tsx` — adicionar tab "Comunicação" ao array TABS e renderizar `TabComunicacao`

### Acções imediatas (no mesmo deploy):
- Enviar email de recursos para Pedro Vilarinho e Silvana Curado via `send-video-recursos-single`

