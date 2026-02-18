
## Página de Recursos — Plano de Implementação

### Contexto e Decisões de Arquitectura

**Modelo de autenticação escolhido: email-only (sem password, sem magic link)**

O utilizador entra com o email. O sistema verifica se esse email existe em `registrations` com `paid_at` preenchido. Se sim, guarda o `edit_token` em `sessionStorage` e desbloqueia o conteúdo. Sem Supabase Auth, sem passwords, sem links mágicos por email — apenas verificação directa contra a BD.

**Porquê esta abordagem:**
- Zero fricção: basta escrever o email que usaram para pagar
- Sem pedidos de suporte de "não consigo entrar" / "não recebi o link"
- Segurança razoável: o `edit_token` (UUID longo gerado em `register-free`) é o proof-of-access — nunca exposto publicamente
- Conteúdo de vídeo (Vimeo embed) só aparece depois da validação
- Sem dependência de sessões persistentes complexas

**Controlo de acesso:**
- `registrations.paid_at IS NOT NULL` → tem acesso ao conteúdo base (gravação, guia, prompts)
- Upsell Masterclass: mostrado a quem `paid_at IS NOT NULL` mas `plan_selected NOT IN ('masterclass', 'bundle')`
- Se `plan_selected IN ('masterclass', 'bundle')`: mostrar "Masterclass incluída ✓"

---

### Estrutura de Ficheiros

| Ficheiro | Acção | Conteúdo |
|---|---|---|
| `src/pages/Recursos.tsx` | Criar | Página principal com 3 camadas |
| `src/components/recursos/RecursosLogin.tsx` | Criar | Formulário de acesso por email |
| `src/components/recursos/RecursosConteudo.tsx` | Criar | Camadas A + B + C após login |
| `src/components/recursos/RecursosUpsell.tsx` | Criar | Bloco de upsell Masterclass (Camada C) |
| `src/App.tsx` | Editar | Adicionar rota `/recursos` |

---

### Detalhe por Ficheiro

#### 1. `src/pages/Recursos.tsx`

Página wrapper com lógica de estado:

```
Estado: "loading" | "login" | "authed"
```

No `useEffect` inicial: verifica `sessionStorage.getItem("recursos_token")` e `sessionStorage.getItem("recursos_email")`. Se existem, faz validação silenciosa contra a BD (apenas confirma que `paid_at IS NOT NULL` para esse email + token). Se válido → `"authed"`. Se não → limpa sessionStorage e vai para `"login"`.

```
sessionStorage keys:
  - "recursos_token": edit_token da registration
  - "recursos_email": email normalizado
  - "recursos_plan": plan_selected (para lógica de upsell)
  - "recursos_name": first_name (para personalização)
```

Render:
- `"loading"` → spinner simples
- `"login"` → `<RecursosLogin onAuthed={(data) => ...} />`
- `"authed"` → `<RecursosConteudo userData={...} />`

#### 2. `src/components/recursos/RecursosLogin.tsx`

UI minimalista, fundo branco/off-white limpo:

```
Logo / título: "Recursos do Webinar — Imagens com IA"
Campo email (input)
Botão "Aceder aos recursos →"
Texto de ajuda: "Usa o email com que te inscreveste e pagaste."
```

**Lógica de validação:**
```ts
const { data } = await supabase
  .from("registrations")
  .select("edit_token, first_name, plan_selected, paid_at")
  .eq("email", email.toLowerCase().trim())
  .maybeSingle();

if (!data?.paid_at) {
  // Não pago: mostrar mensagem específica
  // "Este email não tem acesso pago. Se acabaste de pagar, aguarda 2-3 minutos."
  // Botão: "Comprar acesso (27€)" → link para /gravacao
}

if (data?.paid_at) {
  // Guardar em sessionStorage e notificar parent
  sessionStorage.setItem("recursos_token", data.edit_token);
  sessionStorage.setItem("recursos_email", email);
  sessionStorage.setItem("recursos_plan", data.plan_selected || "");
  sessionStorage.setItem("recursos_name", data.first_name || "");
  onAuthed({ email, token: data.edit_token, plan: data.plan_selected, name: data.first_name });
}
```

**Nota de segurança:** A query lê a tabela `registrations` que já tem RLS `allow_anon_select` (SELECT público). O `edit_token` não é um segredo de alta segurança — é um token de conveniência, não de autorização financeira. O conteúdo protegido é um embed Vimeo + PDFs, não dados sensíveis. Esta abordagem é adequada para o nível de risco.

**Estados de erro a mostrar:**
- "Email não encontrado." → com link para `/?` (landing)
- "Este email ainda não tem acesso pago. Se pagaste há pouco, aguarda 2–3 min e tenta de novo." → com link para `/gravacao`
- "Erro de ligação. Tenta novamente." → retry

#### 3. `src/components/recursos/RecursosConteudo.tsx`

**Camada A — Topo (sempre visível, logo após login)**

Header com nome: "Olá, {firstName}! Aqui estão os teus recursos."

3 cartões resumo em grid:
- 🎬 Gravação HD — disponível
- 📄 Resumo PDF — disponível para download
- 📚 Guia + Prompts — disponível a partir de 25 de Fevereiro (visível mas locked até lá, com badge "Em breve")

**Camada B — Recursos principais**

Sub-secção "Começar aqui":
```
1) Ver a gravação
2) Abrir o guia
3) Copiar prompts e testar
```

**Gravação:**
- Embed Vimeo (iframe responsivo) ou botão "Abrir em nova janela" — URL configurável via constante no ficheiro
- Capítulos simples (lista numerada com timestamps):
  - 00:00 — Introdução e estado da arte
  - 08:30 — Método: do briefing à imagem
  - 24:00 — Demos ao vivo com ferramentas
  - 48:00 — Q&A e casos práticos
- Nota: timestamps são placeholder — serão actualizados quando a gravação estiver disponível

**Guia de apoio:**
- Botão download PDF (link para ficheiro público no Supabase Storage ou URL externa)
- Checklist rápida (accordion):
  - Setup inicial: criar conta nas ferramentas certas
  - Erros comuns e como evitá-los
  - Boas práticas de prompt para PT-PT

**Biblioteca de prompts:**
- Badge "A partir de 25 Fev" se ainda não disponível
- Quando disponível: link de download ou embed de documento

**FAQ:**
- Accordion com 6–8 perguntas
- Perguntas propostas:
  - "Não encontro o meu acesso" → "Usa o mesmo email com que pagaste."
  - "O vídeo não abre" → instrução de abrir em nova janela + link Vimeo directo
  - "Como copiar e usar os prompts" → instrução rápida
  - "O resultado não saiu igual ao do webinar" → dica de ajuste de prompt
  - "Qual o modelo de IA recomendado" → resposta directa
  - "Como evitar erros com texto nas imagens" → técnica específica
  - "Tenho direito à Masterclass?" → explicação de planos
  - "Onde está a fatura?" → instrução de contacto

**Camada C — Upsell Masterclass (condicional)**

```tsx
// Só aparece se plan_selected NÃO inclui masterclass/bundle
const hasMasterclass = ["masterclass", "bundle"].includes(plan);
```

Se `hasMasterclass === true`:
```tsx
<div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
  <Check className="text-green-600" />
  <p>Masterclass incluída no teu plano ✓</p>
  <p className="text-sm text-muted">Detalhes de acesso serão enviados por email.</p>
</div>
```

Se `hasMasterclass === false`:
```tsx
// Cartão de upsell discreto mas eficaz
<div className="border-2 border-ink-900/10 rounded-2xl p-6 bg-background">
  <span className="badge">PRÓXIMO PASSO</span>
  <h3>Quer ir mais longe? Masterclass — Imagem para Vídeo</h3>
  // 3 bullets concretos
  // Badge: "Acesso imediato · 5 de Março"
  <button onClick={() => window.open(MASTERCLASS_URL, "_blank")}>
    Ver Masterclass →
  </button>
  <p className="text-xs text-muted">Grupo limitado.</p>
</div>
```

**Botão de saída:**
- "Sair" (bottom, discreto) — limpa `sessionStorage` e volta ao estado `"login"`

#### 4. `src/App.tsx`

Adicionar:
```tsx
import Recursos from "./pages/Recursos";
// ...
<Route path="/recursos" element={<Recursos />} />
```

---

### Configuração de Conteúdo (constantes no topo do ficheiro)

Para facilitar actualização futura sem tocar no JSX:

```ts
const RECURSOS_CONFIG = {
  vimeoUrl: "https://vimeo.com/...", // URL do embed — preencher quando disponível
  vimeoEmbed: "", // iframe HTML completo — quando disponível
  guiaPdfUrl: "/guia-essencial-seo.png", // placeholder — substituir por PDF real
  promptsUrl: "", // vazio até 25 Fev
  promptsAvailableDate: new Date("2026-02-25"),
  masterclassUrl: "https://imagenscomia.com/masterclass", // placeholder
  chapters: [
    { time: "00:00", label: "Introdução e estado da arte" },
    { time: "08:30", label: "Método: do briefing à imagem" },
    { time: "24:00", label: "Demos ao vivo" },
    { time: "48:00", label: "Q&A e casos práticos" },
  ],
  faqs: [...],
};
```

---

### UX e Design

- **Fundo:** `bg-off-white` (consistente com o resto do site)
- **Login:** card centrado, shadow suave, sem distrações
- **Conteúdo:** layout de coluna única com `max-w-[720px]` centrado — fácil de ler
- **Vídeo:** ratio 16:9, `rounded-xl overflow-hidden`
- **Camada C:** sempre no final, separada com linha divisória + título "Quer ir mais longe?"
- **Mobile-first:** tudo empilhado em coluna, sem sidebars
- **Sem navbar pública** — é uma área privada, só tem o "Sair" discreto no topo direito
- **Sem scroll infinito** — conteúdo directo e accionável

---

### Sequência de implementação

1. Criar `RecursosLogin.tsx` (componente independente, testável)
2. Criar `RecursosUpsell.tsx` (bloco condicional)
3. Criar `RecursosConteudo.tsx` (3 camadas)
4. Criar `Recursos.tsx` (wrapper com lógica de estado)
5. Adicionar rota em `App.tsx`

---

### Notas Importantes

- O **URL Vimeo** e o **PDF do guia** são placeholders — serão actualizados por `RECURSOS_CONFIG` sem tocar no JSX
- A **data de disponibilidade** dos prompts (25 Fev) é calculada em runtime via `new Date() >= promptsAvailableDate`
- O `sessionStorage` é limpo ao fechar o browser (sem persistência entre sessões) — comportamento intencional para uma área de recursos semi-privada
- **Sem migration de BD** necessária — usa as colunas existentes (`paid_at`, `edit_token`, `plan_selected`, `first_name`)
- **Sem nova Edge Function** — a validação é feita directamente via Supabase client (SELECT público já existente)
