
## Publicar a App para Atualizar a Produção

### Problema
O código está correto — `isLive: true` e a lógica de `isDuringWebinar` já estão implementados. Confirmei nos ficheiros atuais:

- `webinarConfig.ts`: `isLive: true` ✓  
- `WebinarLive.tsx`: `const isLive = WEBINAR_CONFIG.isLive || isNearStart || isDuringWebinar;` ✓

O que está a acontecer é que `imagenscomia.com/live` está a servir a versão antiga, antes destas correções. **O site de produção não foi republicado** após as últimas alterações.

### Solução

**Não é necessário alterar nenhum ficheiro.** A única ação necessária é publicar a app para que o deploy de produção incorpore as mudanças já feitas:

1. Clicar no botão **"Publish"** (canto superior direito da interface do Lovable).
2. Aguardar o deploy (normalmente 1–2 minutos).
3. Abrir `imagenscomia.com/live` — o player do YouTube estará visível.

### Por que acontece isto?
O Lovable tem dois ambientes separados:
- **Preview** (o que vês na janela de pré-visualização do Lovable): atualiza automaticamente com cada mudança de código.
- **Produção** (`imagenscomia.com`): só atualiza quando clicas em "Publish" manualmente.

As últimas três rondas de alterações (redirect de `/` para `/live`, fix do CRM, e `isLive: true`) foram todas feitas no ambiente de preview mas **nunca foram publicadas para produção**.
