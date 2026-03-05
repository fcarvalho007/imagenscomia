

# Relatório: Tags E-goi incorrectas + Plano de correcção

## Causa raiz

A função `register-free` chama **sempre** a função `sync-egoi` (linhas 216-238), independentemente do webinar. A função `sync-egoi` aplica a tag 31 (`webinar_imagens_com_ia_18_fev`) a **todos** os contactos.

Resultado: quem se registou **apenas** no vídeo recebeu indevidamente a tag de imagens.

A função `bulk-sync-egoi` tem o mesmo problema — não filtra por webinar.

## Relatório de inscrições cruzadas

```text
┌─────────────────┬───────┐
│ Categoria       │ Total │
├─────────────────┼───────┤
│ Só Imagens      │  197  │
│ Só Vídeo        │  208  │
│ Ambos           │   39  │
├─────────────────┼───────┤
│ Total inscritos │  444  │
└─────────────────┴───────┘
```

- **197** pessoas inscreveram-se apenas no webinar de Imagens — tag 31 correcta
- **39** pessoas inscreveram-se em ambos — tags 31 + 34 correctas
- **208** pessoas inscreveram-se apenas no Vídeo — têm tag 31 **indevidamente**, devem ter apenas tag 34

## Plano de execução

### 1. Corrigir `register-free/index.ts` (prevenir novas ocorrências)

Envolver a chamada a `sync-egoi` (linhas 52-75 e 216-238) numa condição que só executa quando `webinar !== "video"`:

```typescript
// Linha 52 e 216: adicionar condição
if ((webinar || "imagens") !== "video") {
  // chamada a sync-egoi (tag imagens)
}
```

### 2. Corrigir `bulk-sync-egoi/index.ts`

Adicionar filtro `.eq("webinar", "imagens")` à query de registrations (linha 22).

### 3. Criar edge function `cleanup-egoi-tags/index.ts`

Nova função que:
1. Busca os 208 emails que existem na BD apenas com `webinar = 'video'`
2. Para cada um, encontra o `contact_id` na E-goi via API
3. Usa o endpoint `POST /lists/5/contacts/actions/detach-tag` com `tag_id: 31` para remover a tag de imagens
4. Reporta resultados (removidos / não encontrados / erros)

A API E-goi de detach-tag funciona de forma idêntica ao attach-tag:
```
POST /lists/5/contacts/actions/detach-tag
{ "tag_id": 31, "contacts": ["contact_id"] }
```

### 4. Invocar a função de cleanup

Executar `cleanup-egoi-tags` uma vez para limpar os 208 contactos incorrectos.

### Resultado esperado

Após execução:
- **Só Imagens (197)**: tag 31 ✓
- **Só Vídeo (208)**: tag 34 ✓, tag 31 removida ✓
- **Ambos (39)**: tags 31 + 34 ✓ (sem alteração)

