
# Alteracoes no modal de registo e fluxo pos-registo

## Resumo

Separar o campo "Nome" em "Primeiro Nome" e "Ultimo Nome", redirecionar para /upgrade apos registo, e limpar elementos desnecessarios do modal.

## Alteracoes

### 1. Base de dados — adicionar colunas first_name e last_name

Adicionar duas colunas `first_name` e `last_name` a tabela `registrations`. Manter a coluna `name` existente (preenchida com a concatenacao) para retrocompatibilidade.

```sql
ALTER TABLE public.registrations ADD COLUMN first_name text;
ALTER TABLE public.registrations ADD COLUMN last_name text;
```

### 2. Edge function — register-free/index.ts

- Aceitar `firstName` e `lastName` em vez de `name`
- Gravar `first_name`, `last_name` e `name` (concatenado) na tabela

### 3. RegistrationModal.tsx — formulario

**Campos:**
- Substituir o campo unico "Nome" por dois campos lado a lado:
  - "Primeiro Nome" (com icone User)
  - "Ultimo Nome" (com icone User)
- Manter Email e WhatsApp como estao

**Remover:**
- O bloco "A seguir: recebe um email com o link de acesso e opcao para adicionar ao calendario." (linhas 261-265)
- A segunda ocorrencia de "Opcional --" na linha 225 (o texto "Opcional -- apenas para lembretes do evento" abaixo do campo WhatsApp). O placeholder "WhatsApp (opcional)" ja indica que e opcional.

**Redireccionamento:**
- Apos registo com sucesso, redirecionar para `/upgrade` em vez de `/confirmacao`:
  ```
  navigate(`/upgrade?name=${encodeURIComponent(firstName + " " + lastName)}&email=${encodeURIComponent(email)}`)
  ```

### 4. Validacao

- Validar que tanto `firstName` como `lastName` estao preenchidos antes de submeter

## Ficheiros editados

1. **Migracao SQL** — adicionar `first_name` e `last_name`
2. **supabase/functions/register-free/index.ts** — aceitar campos separados
3. **src/components/landing/RegistrationModal.tsx** — dois campos de nome, remover texto extra, redirecionar para /upgrade
