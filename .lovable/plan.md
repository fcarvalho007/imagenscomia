

# Bug: "Welcome Back" modal aparece para utilizadores novos

## Causa raiz

O fluxo de um utilizador **novo** no webinar de video:

1. Preenche o modal de registo na pagina `/video`
2. `register-free` cria o registo na BD com `step_reached: 1` (default da tabela)
3. Retorna `alreadyRegistered: false`
4. O modal navega para `/upgrade-video?name=...&email=...`
5. `UpgradeVideo` monta e executa o auto-check (linha 120):
   ```
   if (data && (data.step_reached ?? 0) >= 1)
   ```
6. Como `step_reached` e **1** (o default), a condicao e **verdadeira**
7. O utilizador ve o ecra "Welcome Back" (step 0) — **mesmo sendo a primeira vez**

O problema e que `step_reached` tem default `1` na BD, e a condicao `>= 1` apanha todos os utilizadores, incluindo os que acabaram de se registar.

## Correcao

### Ficheiro: `src/pages/UpgradeVideo.tsx`

Alterar a condicao na linha 120 de `>= 1` para `>= 2`. Isto garante que o "Welcome Back" so aparece para quem ja avancou pelo menos um passo alem do registo inicial.

```typescript
// ANTES (linha 120)
if (data && (data.step_reached ?? 0) >= 1) {

// DEPOIS
if (data && (data.step_reached ?? 0) >= 2) {
```

Mesma correcao na funcao `handleRecovery` (linha 167):

```typescript
// ANTES
if ((data.step_reached ?? 0) >= 1) {

// DEPOIS
if ((data.step_reached ?? 0) >= 2) {
```

Nenhuma outra alteracao e necessaria. O step 1 (Qualificacao) e o primeiro ecra que o utilizador ve normalmente, por isso `>= 2` significa que ja respondeu a pelo menos uma pergunta.

