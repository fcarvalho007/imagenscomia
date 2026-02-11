

# Correcoes de Conteudo e Coesao Visual da Homepage

## 1. Correcoes factuais na seccao "Quem Apresenta"

### `src/components/landing/PresenterSection.tsx`

**a) Anos de experiencia: 29 para 20**
- Bio: "29 anos a implementar..." -> "20 anos a implementar..."
- Stats array: `{ number: "29", label: "anos de experiencia" }` -> `{ number: "20", ... }`

**b) Credenciais universitarias**
- De: `"FEUC · Univ. Europeia · Univ. Autonoma · IPAM"`
- Para: `"Universidade de Coimbra (FEUC) · Univ. Europeia (IPAM) · Univ. Autonoma · Univ. Aveiro"`

**c) Credencial Autor**
- De: `"Marketing Digital para Empresas" · "Guia Essencial SEO"`
- Para: `"Guia Essencial SEO" e Co-Autor "Marketing Digital para Empresas"`

---

## 2. Eliminar quebras de linha desnecessarias em desktop

Varias frases partem em duas linhas em desktop quando cabem numa so. Solucao: aumentar `max-w` dos containers e remover `<br />` forcados.

### `src/components/landing/PresenterSection.tsx`
- Remover o `<br />` na bio: "20 anos a implementar marketing digital e IA em empresas portuguesas" fica numa so linha

### `src/components/landing/HeroSection.tsx`
- Descrição "De briefing a imagem profissional...": aumentar `max-w-[640px]` para `max-w-[720px]` para evitar a quebra "— demonstrado ao vivo." para segunda linha

### `src/components/landing/CTAFinalSection.tsx`
- H2 "Imagens profissionais com IA." parte em desktop: aumentar `max-w-[720px]` para `max-w-[800px]` e `max-w-[600px]` do h2 para `max-w-[700px]`

---

## 3. Revisao de copywriting (tratamento por "tu")

Uniformizar todo o copy para tratamento por "tu" (informal, directo). Corrigir instancias inconsistentes:

### `src/components/landing/MirrorCopySection.tsx`
- "Precisa de imagens..." -> "Precisas de imagens..."
- "Sabe que a IA pode..." -> "Sabes que a IA pode... mas ninguem te mostrou como aplicar ao teu negocio"
- "Quer consistencia visual..." -> "Queres consistencia visual na tua marca sem orcamento para agencia criativa"

### `src/components/landing/ProgramSection.tsx`
- "Vou mostrar ao vivo o que separa..." -> manter (1a pessoa, ok)
- "No fim deste bloco, fica com:" -> "No fim deste bloco, ficas com:"
- "Sais a criar imagens..." -> manter (ja esta em "tu")

### `src/components/landing/ChallengesSection.tsx`
- O card "Mais volume sem aumentar equipa" -> manter (impersoal, ok)
- "Se te identificaste..." -> manter (ja esta em "tu")

### `src/components/landing/AudienceSection.tsx`
- Items "forWhom" usam 3a pessoa ("Responsavel de marketing que precisa...") -> manter porque sao descricoes de perfil, nao tratamento directo
- Kickers "CERTO PARA TI SE:" / "NAO E PARA TI SE:" -> manter (ja em "tu")
- Sub texto "este webinar e para quem nao tem formacao em design" -> manter
- "ha metodo. Ensino o metodo." -> "ha metodo. Ensino-te o metodo."

### `src/components/landing/FAQSection.tsx`
- Rever respostas para tratamento consistente em "tu":
  - "Se consegues usar..." -> manter (ok)
  - "Mostro opcoes gratuitas e pagas..." -> manter (1a pessoa, ok)
  - "ja consegues criar as tuas primeiras..." -> manter (ok)
  - "quem faltar ao webinar, perde o acesso" -> manter (3a pessoa genérica, ok)

### `src/components/landing/RegistrationModal.tsx`
- Checkbox: "Autorizo o envio..." -> manter (1a pessoa formal, obrigatorio RGPD)
- Texto `text-[11px]` nos termos e shield -> subir para `text-[14px]` (consistencia minima)
- Upsell "Antes de concluir, escolha o formato" -> "Antes de concluir, escolhe o formato"
- "Na participacao gratuita, estes extras nao estao incluidos:" -> manter
- "Preferir convidar 2 pessoas..." -> "Prefiro convidar 2 pessoas e obter o Premium"
- "Sera gerado um link pessoal para convidar 2 pessoas. Assim que 2 inscricoes forem confirmadas, o Premium fica ativo." -> "Vais receber um link pessoal. Assim que 2 amigos se inscreverem, o Premium fica ativo."
- "Continuar com participacao gratuita" -> manter (infinitivo neutro, ok)
- Confirmation: "Verificque o email" -> "Verifica o teu email"
- "Envimos as instrucoes para o email. Entretanto, e possivel fazer upgrade..." -> "Envimos as instrucoes para o teu email. Entretanto, podes fazer upgrade..."
- "Convida 2 amigos..." -> manter (ja em "tu")
- "Se ambos se registarem, ganhas o Premium..." -> manter (ok)

### `src/components/landing/StickyTopBar.tsx`
- Countdown label "seg" em `text-[9px]` -> subir para `text-[10px]` (excecao aceitavel no countdown compacto)

---

## 4. Ultimos ajustes de tamanho de fonte

Encontrei alguns elementos que ainda estao abaixo do minimo de 14px:

### `src/components/landing/ChallengesSection.tsx`
- Numeros dos cards `text-[11px]` -> `text-[14px]`

### `src/components/landing/TestimonialsSection.tsx`
- Estrelas footer `text-[13px]` -> `text-[14px]`

### `src/components/landing/RegistrationModal.tsx`
- Checkbox label `text-[11px]` -> `text-[14px]`
- "Sem spam..." `text-[11px]` -> `text-[14px]`
- Shield text `text-[11px]` -> `text-[14px]`
- Upsell "Pagamento seguro" `text-[11px]` -> `text-[14px]`
- Referral description `text-[13px]` -> `text-[14px]`
- Upgrade CTA text `text-[13px]` -> `text-[14px]`

---

## Ficheiros a editar (resumo)

| Ficheiro | Alteracoes |
|----------|-----------|
| `PresenterSection.tsx` | 29->20 anos, universidades, autor, remover `<br />` |
| `HeroSection.tsx` | max-w descricao 640->720px |
| `CTAFinalSection.tsx` | max-w container e h2 maiores para evitar quebra |
| `MirrorCopySection.tsx` | Tratamento por "tu" nos 3 pontos |
| `ProgramSection.tsx` | "fica com" -> "ficas com" |
| `AudienceSection.tsx` | "Ensino o metodo" -> "Ensino-te o metodo" |
| `ChallengesSection.tsx` | Numeros 11px -> 14px |
| `TestimonialsSection.tsx` | Estrelas 13px -> 14px |
| `RegistrationModal.tsx` | Tratamento "tu", fontes 11px->14px |

