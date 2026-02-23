

# Personalização de emails por histórico de inscrito

## Resumo

Adicionar lógica de verificação de histórico cross-webinar nas edge functions `send-video-confirmation` e `send-video-postwebinar`, personalizando o conteúdo do email com base no que o inscrito comprou no webinar Imagens. Registar a variante usada numa nova coluna `metadata` na tabela `email_send_logs` e mostrar essa informação no CRM.

---

## 1. Migração SQL — nova coluna `metadata`

Adicionar coluna `metadata jsonb` à tabela `email_send_logs`:

```sql
ALTER TABLE email_send_logs ADD COLUMN IF NOT EXISTS metadata jsonb;
```

---

## 2. send-video-confirmation — personalização por variante

**Ficheiro:** `supabase/functions/send-video-confirmation/index.ts`

Adicionar função helper `getSubscriberHistory` que consulta a tabela `registrations` para encontrar o registo do inscrito no webinar `imagens`:

```ts
async function getSubscriberHistory(email: string, sb: any) {
  try {
    const { data } = await sb
      .from("registrations")
      .select("plan_selected, paid_at")
      .eq("email", email.toLowerCase().trim())
      .eq("webinar", "imagens")
      .order("created_at", { ascending: false })
      .limit(1);
    return data?.[0] || null;
  } catch { return null; }
}
```

Após construir o HTML base (linha ~99), verificar o histórico e determinar a variante:

| Condição | Variante | Acção |
|---|---|---|
| history = null | A | Sem PS. Email standard. |
| history.plan_selected = null/free, sem paid_at | B | Append bloco PS "Já nos conhecemos..." |
| history.plan_selected = premium, com paid_at | C | Append bloco PS "Já és cliente..." orientado para Premium Pass Video |
| history.plan_selected = masterclass ou bundle, com paid_at | D | Append bloco PS "Já és cliente da Masterclass..." sem pitch MC |

A inserção do PS é feita via string replace: inserir o bloco HTML antes do footer (`<div style="border-top:1px solid #eee;padding-top:16px;margin-top:32px;">`).

O bloco PS tem este formato HTML:

```html
<div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
  <p style="color:#333;font-size:14px;font-weight:700;margin:0 0 8px;">PÓS-ESCRITO</p>
  <p style="color:#555;font-size:14px;line-height:1.6;margin:0;">[texto da variante]</p>
</div>
```

O insert em `email_send_logs` passa a incluir o campo `metadata`:

```ts
metadata: JSON.stringify({
  variant: variantLetter,
  had_imagens_history: history !== null,
  imagens_plan: history?.plan_selected || null,
})
```

---

## 3. send-video-postwebinar — suprimir Masterclass upsell

**Ficheiro:** `supabase/functions/send-video-postwebinar/index.ts`

Adicionar a mesma função `getSubscriberHistory`.

Alterar o loop de envio (actualmente sequencial, `for...of`). Para cada inscrito:

1. Chamar `getSubscriberHistory(reg.email, supabase)`
2. Determinar variante:
   - **D** (masterclass/bundle pagos): Remover o bloco "Queres ir mais fundo? Masterclass..." do HTML e substituir por texto de contacto directo
   - **C** (premium pago): Adicionar frase "Já conheces o valor do Premium Pass..." antes do bloco Premium Pass
   - **B** (gratuito anterior): Email standard (sem alterações)
   - **A** (sem histórico): Email standard

Implementação técnica da remoção do bloco Masterclass (Variante D):
- O bloco Masterclass começa com `<div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">` seguido de "Queres ir mais fundo?"
- Usar regex para localizar e substituir esse bloco específico por texto alternativo:

```ts
const mcBlockRegex = /<div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">\s*<p[^>]*>Queres ir mais fundo\?<\/p>[\s\S]*?<\/div>\s*<\/div>/;
html = html.replace(mcBlockRegex, `
  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0;">
      Já tens a Masterclass do nosso trabalho anterior — se quiseres explorar o tema Vídeo em profundidade, entra em contacto directamente: <a href="mailto:frederico@digitalfc.pt" style="color:#16a34a;font-weight:600;">frederico@digitalfc.pt</a>
    </p>
  </div>
`);
```

Implementação da frase extra para Variante C:
- Inserir texto antes do bloco Premium Pass ("Queres acesso à gravação completa?") via string replace.

Batch processing: alterar o `for...of` sequencial para processar em lotes de 5 com `Promise.all`:

```ts
for (let i = 0; i < toSend.length; i += 5) {
  const batch = toSend.slice(i, i + 5);
  await Promise.all(batch.map(async (reg) => {
    // history check + personalise + send + log
  }));
}
```

O insert em `email_send_logs` inclui `metadata` com variante usada (igual ao confirmation).

Fallback: se `getSubscriberHistory` falhar (catch silencioso), usar variante A (email standard).

---

## 4. CRM — coluna "Variante" no histórico de envios

**Ficheiro:** `src/components/crm/EmailEditorPanel.tsx`

Na interface `SendLog`, adicionar campo opcional:

```ts
metadata: string | null;  // JSON string
```

No componente `HistoryTab`, na tabela de logs, adicionar coluna "Variante" entre "Estado" e "ID Resend":

| Variante | Badge | Tooltip |
|---|---|---|
| A | Badge cinza "A" | "Novo inscrito — email standard" |
| B | Badge azul "B" | "Inscrito anterior (gratuito) — PS de reconhecimento" |
| C | Badge roxo "C" | "Cliente Premium anterior — PS orientado para Q&A Vídeo" |
| D | Badge laranja "D" | "Cliente Masterclass anterior — MC suprimida" |
| null/parse error | "—" | — |

Parse do metadata:

```ts
const meta = (() => {
  try { return log.metadata ? JSON.parse(log.metadata) : null; }
  catch { return null; }
})();
const variant = meta?.variant || null;
```

Badge com tooltip usando `title` attribute nativo.

---

## Ficheiros a criar/modificar

| Ficheiro | Alteração |
|---|---|
| Migração SQL | `ALTER TABLE email_send_logs ADD COLUMN IF NOT EXISTS metadata jsonb` |
| `supabase/functions/send-video-confirmation/index.ts` | Adicionar `getSubscriberHistory`, lógica de variantes A-D, PS blocks, metadata no log |
| `supabase/functions/send-video-postwebinar/index.ts` | Adicionar `getSubscriberHistory`, suprimir MC para D, frase extra para C, batch de 5, metadata no log |
| `src/components/crm/EmailEditorPanel.tsx` | Coluna "Variante" na tabela de histórico |

Nenhuma alteração a reminder emails (48h, 24h, 1h), outras views do CRM, ou autenticação.
