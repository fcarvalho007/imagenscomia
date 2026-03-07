

# Auditoria de Bugs — /crm

Após análise detalhada do código, identifiquei os seguintes problemas organizados por severidade.

---

## BUG 1 — CRÍTICO: `deleteInscrito` falha silenciosamente (403 Forbidden)

**Ficheiro:** `src/hooks/useInscritos.ts` (linha 149)

O `deleteInscrito` lê `sessionStorage.getItem("crm_admin_email")` para enviar no header `x-crm-admin-email`. Porém, **não existe nenhum `sessionStorage.setItem("crm_admin_email", …)` em todo o projecto**. Isto significa que o valor é sempre `""`, a edge function compara com `fredericodigital@gmail.com`, retorna 403, e a eliminação falha silenciosamente sem mostrar erro ao utilizador.

**Correcção:** Obter o email via `supabase.auth.getSession()` (como já é feito noutros sítios) em vez de `sessionStorage`. Adicionar toast de erro visível.

---

## BUG 2 — CRÍTICO: `deleteInscrito` usa `fetch` em vez de `supabase.functions.invoke`

**Ficheiro:** `src/hooks/useInscritos.ts` (linhas 150-160)

Usa `fetch` directo sem header `apikey` nem `Authorization`. Isto pode causar 401 no gateway (problema já documentado na memória `bulk-sms-invoke-pattern`). Todos os outros invokes no CRM usam `supabase.functions.invoke`.

**Correcção:** Migrar para `supabase.functions.invoke("delete-registration", { body, headers })`.

---

## BUG 3 — MODERADO: `toggleDoNotContact` e `toggleInvoiceSent` usam closure stale

**Ficheiro:** `src/hooks/useInscritos.ts` (linhas 207-222, 337-349)

Ambos têm `[inscritos]` como dependência do `useCallback`, o que recria a função a cada refresh (cada 30s). Mas o problema real é que se o utilizador clicar rapidamente duas vezes, a segunda chamada usa o estado desactualizado. `grantPremium` e `updatePlan` têm o mesmo padrão.

**Correcção:** Usar `setInscritos(prev => ...)` com lookup dentro do callback funcional para evitar closures stale, removendo a dependência de `inscritos`.

---

## BUG 4 — MODERADO: `addNota` e `removeNota` são apenas client-side

**Ficheiro:** `src/hooks/useInscritos.ts` (linhas 107-128)

As notas são adicionadas/removidas apenas no estado local — não há persistência na base de dados. Ao fazer refresh (automático a cada 30s ou manual), todas as notas desaparecem.

**Impacto:** O utilizador perde todas as notas após refresh. Este pode ser intencional (as notas são efémeras) mas é provável que seja um bug.

---

## BUG 5 — MENOR: Email preview não actualiza em tempo real no modo visual

**Ficheiro:** `src/components/crm/comunicacao/EmailTab.tsx` (linha 239)

`const currentHtml = getHtml()` é chamado no render, mas o `contentEditable` div não dispara re-renders quando o utilizador digita. O preview só actualiza quando outro estado muda (ex: alterar subject). No modo `rawMode` funciona porque `rawHtml` é state controlado.

**Correcção:** Adicionar `onInput` handler ao `contentEditable` div para actualizar um state com o HTML corrente.

---

## BUG 6 — MENOR: Histórico tab limitado a 1000 emails + 500 SMS

**Ficheiro:** `src/components/crm/comunicacao/HistoricoTab.tsx` (linhas 27, 35)

O `.limit(1000)` para `email_send_logs` pode cortar dados (a tabela tem mais de 1000 registos baseado nas contagens de automações). Não há paginação nem indicação de dados truncados.

**Correcção:** Aumentar limite ou implementar paginação/scroll infinito.

---

## BUG 7 — MENOR: `SchedulePicker` estado `enabled` desincronizado

**Ficheiro:** `src/components/crm/comunicacao/SchedulePicker.tsx` (linha 15)

O estado `enabled` começa `false` e é interno ao componente, mas `scheduledAt` vem do pai. Se o pai fizer reset (`setScheduledAt(null)` no `resetForm`), o picker continua a mostrar "Agendar" como activo porque `enabled` não acompanha.

**Correcção:** Derivar `enabled` de `!!scheduledAt` em vez de usar estado local, ou sincronizar via `useEffect`.

---

## BUG 8 — MENOR: Supabase query limit de 5000 pode truncar dados

**Ficheiro:** `src/hooks/useInscritos.ts` (linha 91), `src/components/crm/FollowUpView.tsx` (linha 100)

Ambos usam `.limit(5000)`. Se o projecto crescer além deste limite, dados serão silenciosamente omitidos.

---

## Resumo por prioridade

| # | Severidade | Bug | Impacto |
|---|-----------|-----|---------|
| 1 | **Crítico** | `deleteInscrito` sempre falha (403) | Eliminar registos não funciona |
| 2 | **Crítico** | `fetch` sem auth headers | 401 possível no delete |
| 3 | Moderado | Closures stale em toggles | Race conditions em cliques rápidos |
| 4 | Moderado | Notas não persistem na DB | Dados perdidos a cada 30s |
| 5 | Menor | Preview email não reactivo | UX degradada no editor visual |
| 6 | Menor | Histórico truncado sem aviso | Dados incompletos |
| 7 | Menor | SchedulePicker desincronizado | UI inconsistente após reset |
| 8 | Menor | Limites de query hardcoded | Escalabilidade futura |

---

## Plano de correcção

### Ficheiros a alterar

1. **`src/hooks/useInscritos.ts`** — Bugs 1, 2, 3
   - Migrar `deleteInscrito` para `supabase.functions.invoke` + obter email via `getSession()`
   - Adicionar toast de erro/sucesso
   - Refactoring dos callbacks com closures stale

2. **`src/components/crm/comunicacao/EmailTab.tsx`** — Bug 5
   - Adicionar `onInput` ao contentEditable para trigger re-render do preview

3. **`src/components/crm/comunicacao/SchedulePicker.tsx`** — Bug 7
   - Derivar `enabled` de `scheduledAt` prop

4. **`src/components/crm/comunicacao/HistoricoTab.tsx`** — Bug 6
   - Aumentar limit e/ou adicionar indicador de truncagem

