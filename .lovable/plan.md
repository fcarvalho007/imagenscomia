
## Alterações à Página /recursos + Tags E-Goi para Bundle

### Resumo das mudanças

| # | Pedido | Ficheiro |
|---|---|---|
| 1 | Mensagem "vídeo a ser processado" + previsão quinta-feira 12h | `RecursosConteudo.tsx` |
| 2 | Botão "Criação de Projecto — SOP de Prompts" (Google Drive) | `RecursosConteudo.tsx` |
| 3 | Botão "Exercício Prático Google WHISK" (Google Drive) | `RecursosConteudo.tsx` |
| 4 | Botão "Resumo do webinar" (Google Drive) — substituir link local | `RecursosConteudo.tsx` |
| 5 | Botão "Áudio em Bruto do Webinar" (Google Drive) — substituir link local | `RecursosConteudo.tsx` |
| 6 | Tags E-Goi: bundle → tag 33 (masterclass) + 32 (premium) no webhook de pagamento | `supabase/functions/eupago-webhook/index.ts` |

---

### Detalhe Técnico

#### 1. Player — estado "A processar" com previsão

O player Vimeo está ligado e a tentar carregar (o embed está preenchido). O pedido é mostrar junto ao player uma mensagem de que o vídeo ainda está a ser processado, com previsão de quinta-feira às 12h.

A solução mais limpa: adicionar um banner/aviso **por cima do player**, sempre visível, que informa o estado. Quando o vídeo estiver pronto, basta remover o banner.

```tsx
{/* Processing notice — remover quando o vídeo estiver pronto */}
<div className="flex items-center gap-2.5 mb-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
  <Clock size={14} className="text-amber-600 shrink-0" />
  <span>
    <strong>Vídeo a ser processado.</strong> Previsão de disponibilidade: 
    quinta-feira, 20 de Fevereiro, às 12h00.
  </span>
</div>
```

Em alternativa, se o `vimeoEmbed` apontar para um vídeo que ainda não é público/acessível, o iframe pode dar erro de player. O banner clarifica a situação ao utilizador.

---

#### 2–5. Botões de recursos — novos links para Google Drive

Os links actuais (`/resumo-sessao.pdf`, `/audio-sessao.mp3`) são ficheiros locais que não existem — substituir pelos links reais do Google Drive. Todos os links abrem numa nova janela (Google Drive viewer).

**Novos links no `RECURSOS_CONFIG`:**

```ts
const RECURSOS_CONFIG = {
  // ... existente ...
  resumoPdfUrl: "https://drive.google.com/file/d/1sZj7k-Jtvzh5gX6jkWGHCiY4C-IEE88Q/view?usp=sharing",
  audioUrl: "https://drive.google.com/file/d/1EhFXTgoiw82iNWBpuEI56amU1JwjKT_h/view?usp=sharing",
  sopPromptsUrl: "https://drive.google.com/file/d/1Y7OAI7grYS90GIGQ8sy0rj9_Jff8YpCr/view?usp=sharing",
  whiskUrl: "https://drive.google.com/file/d/1OEOOp_2Jr6mQGxkGDDM56vZPXiTCbbhF/view?usp=sharing",
};
```

Os botões de "Resumo" e "Áudio" passam a usar `target="_blank"` em vez de `download` (Google Drive não suporta atributo `download` directo de links de partilha).

**Novos botões SOP e WHISK** aparecem:
- Na **tab Gravação** (abaixo dos capítulos, junto ao Resumo e Áudio) 
- Na **sidebar** (na secção "Recursos")

Layout dos novos botões:

```tsx
{/* SOP de Prompts */}
<a
  href={RECURSOS_CONFIG.sopPromptsUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-100 transition-colors"
>
  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
    <FileText size={14} className="text-violet-600" />
  </div>
  <div>
    <span className="text-sm font-medium text-gray-900 block">Criação de Projecto — SOP de Prompts</span>
    <span className="text-[11px] text-gray-500">PDF · Abrir</span>
  </div>
</a>

{/* WHISK */}
<a
  href={RECURSOS_CONFIG.whiskUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 border border-green-100 transition-colors"
>
  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
    <Layers size={14} className="text-green-600" />
  </div>
  <div>
    <span className="text-sm font-medium text-gray-900 block">Exercício Google WHISK</span>
    <span className="text-[11px] text-gray-500">1 Prompt, Vários Resultados · Abrir</span>
  </div>
</a>
```

Ícones a importar: `FileText` e `Layers` (já no pacote `lucide-react`).

---

#### 6. Tags E-Goi para compradores de bundle

**Contexto:** o webhook de pagamento (`eupago-webhook/index.ts`) já processa pagamentos e confirma registos. Após a confirmação, precisa de:
- Para `plan_selected === "bundle"`: marcar tag **33** (masterclass) + tag **32** (premium)
- Para `plan_selected === "masterclass"`: marcar tag **33**
- Para `plan_selected === "premium"`: marcar tag **32**

**Localização no código:** após o bloco que regista `payment_confirmed` no `payment_events` (linha ~186), dentro do bloco `if (matchedRegId)`.

**Implementação — função `attachEgoiTags`:**

```ts
const attachEgoiTag = async (contactId: string, tagId: number, apiKey: string) => {
  const res = await fetch(
    `https://api.egoiapp.com/lists/5/contacts/actions/attach-tag`,
    {
      method: "POST",
      headers: { "Apikey": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ tag_id: tagId, contacts: [contactId] }),
    }
  );
  const text = await res.text();
  console.log(`E-goi attach tag ${tagId}: status=${res.status}, body=${text}`);
};

// Obter contactId pelo email no E-goi
const getEgoiContactId = async (email: string, apiKey: string): Promise<string | null> => {
  const res = await fetch(
    `https://api.egoiapp.com/lists/5/contacts?email=${encodeURIComponent(email)}`,
    { headers: { "Apikey": apiKey } }
  );
  const data = await res.json();
  return data?.items?.[0]?.contact || null;
};
```

**Lógica de tags por plano:**

```ts
// TAG IDs
const TAG_PREMIUM = 32;   // premium_pass_webinar_imagens_com_ia_18_fev
const TAG_MASTERCLASS = 33; // masterclass_webinar_imagens_com_ia_18_fev

const EGOI_API_KEY = Deno.env.get("EGOI_API_KEY");
if (EGOI_API_KEY && reg?.plan_selected && reg?.email) {
  const contactId = await getEgoiContactId(reg.email, EGOI_API_KEY);
  if (contactId) {
    if (["premium", "bundle"].includes(reg.plan_selected)) {
      await attachEgoiTag(contactId, TAG_PREMIUM, EGOI_API_KEY);
    }
    if (["masterclass", "bundle"].includes(reg.plan_selected)) {
      await attachEgoiTag(contactId, TAG_MASTERCLASS, EGOI_API_KEY);
    }
  }
}
```

**Onde inserir no webhook:** logo após o bloco de `payment_confirmed` event insert, antes do bloco de email de factura. Fica como operação non-blocking (dentro de `try/catch`).

---

### Organização final do conteúdo na tab Gravação

```text
📹 Índice da sessão
  [capítulos clicáveis — sem alteração]

── divider ──

📄 Resumo do webinar              → Drive link
🎧 Áudio em Bruto do Webinar      → Drive link
📋 SOP — Criação de Projecto      → Drive link
🔢 Exercício Google WHISK         → Drive link
```

### Organização final da sidebar (secção Recursos)

```text
📄 Resumo da sessão       [Drive]
🎧 Áudio da sessão        [Drive]
📋 SOP de Prompts         [Drive]
🔢 Exercício WHISK        [Drive]
```

---

### Ficheiros alterados

| Ficheiro | Mudança |
|---|---|
| `src/components/recursos/RecursosConteudo.tsx` | Banner "processando", novos links Drive, 2 novos botões (SOP + WHISK), ícones FileText + Layers |
| `supabase/functions/eupago-webhook/index.ts` | Após match de pagamento, chamar E-goi API para marcar tags 32/33 conforme o plano |

### O que NÃO muda
- Layout 2 colunas, estilo visual clean
- Lógica de autenticação
- Tabs (Gravação, Guia, FAQ)
- Suporte / Masterclass upsell na sidebar
- Restante lógica do webhook
