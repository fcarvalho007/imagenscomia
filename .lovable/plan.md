

# Correcao de Layout, Flow do Modal e Pagina /upgrade

---

## Parte 1 -- Layout desktop mais largo

Actualmente quase todas as seccoes usam `max-w-[680px]` a `max-w-[800px]`, o que e estreito em monitores desktop. Alargar para dar mais respiro:

| Seccao | Actual | Novo |
|--------|--------|------|
| HeroSection | `max-w-[800px]` | `max-w-[960px]` |
| MirrorCopySection | `max-w-[680px]` | `max-w-[760px]` |
| ChallengesSection | verificar | `max-w-[960px]` |
| ProgramSection | verificar | `max-w-[960px]` |
| AudienceSection | verificar | `max-w-[800px]` |
| PricingCardsSection | `max-w-[920px]` | manter |
| CTAFinalSection | `max-w-[600px]` | `max-w-[720px]` |
| FAQSection | verificar | `max-w-[760px]` |

Os valores finais serao ajustados conforme o conteudo de cada seccao.

---

## Parte 2 -- Corrigir o Modal "Antes de continuar" (RegistrationModal.tsx)

### 2A. Reduzir bullets de 4 para 3

Remover o 4o bullet ("Early access as apps"). Actualizar o formato para incluir titulo + sub-texto:

- **Bullet 1:** Titulo: "Gravacao da sessao" / Sub: "sem Premium, perdes acesso logo apos o webinar"
- **Bullet 2:** Titulo: "Sessao Q&A exclusiva em grupo -- 60 minutos" / Sub: "o unico momento para tirar duvidas com Frederico apos o evento"
- **Bullet 3:** Titulo: "Guia completo de prompts -- 30+ paginas" / Sub: "testado em contexto empresarial portugues, nao disponivel gratuitamente"

### 2B. Substituir caixa verde + botoes por 3 opcoes

Remover a caixa verde actual sobre convites. Substituir por:

1. **Texto:** "Como preferes avancar?" (Inter 400, 14px, ink-500, centrado)

2. **Botao primario:** "Sim, quero o Premium por €15"
   - onClick: `close()` + `navigate('/upgrade')`
   - Estilo: gradiente neon actual (roxo-azul)

3. **Botao verde (novo):** "Prefiro convidar 2 amigos e ganhar gratis"
   - Fundo: green-50, border green-600, texto green-700
   - onClick: registar o utilizador gratis (chamar `register-free` edge function) + mostrar ConfirmationView COM referralData

4. **Link discreto:** "Nao, continuar com versao gratuita"
   - onClick: registar gratis + mostrar ConfirmationView SEM referralData (confirmacao simples)

### 2C. Corrigir o bug do flow

Actualmente `handleSwitchToPremium` faz `open("premium")` que mostra o PremiumForm dentro do modal. Em vez disso, deve:
- Fechar o modal (`close()`)
- Redirecionar para `/upgrade` (`navigate('/upgrade')`)

O componente `RegistrationModal` precisa de importar `useNavigate` de react-router-dom.

### 2D. Novos estados no modal

Adicionar um novo estado `showReferralConfirmation` para distinguir entre:
- Confirmacao com widget de convites (via botao verde)
- Confirmacao simples sem convites (via link "continuar gratis")

O `handleContinueFree` actual passa a: registar gratis + mostrar confirmacao simples.
O novo `handleReferralPath` faz: registar gratis + mostrar confirmacao com widget de convites.

### 2E. Adaptar UpsellView

A UpsellView recebe novas props:
- `onGoToPremium`: fecha modal + navega para /upgrade
- `onReferralPath`: regista gratis e mostra confirmacao com convites
- `onContinueFree`: regista gratis e mostra confirmacao simples

Precisa tambem de receber `name`, `email`, `setName`, `setEmail` para o formulario de registo (nome + email) ser preenchido antes de clicar nos botoes de referral ou gratis. Alternativa: pedir nome/email dentro do UpsellView com campos inline antes dos 3 botoes.

**Decisao:** Adicionar campos nome + email directamente no UpsellView (abaixo da caixa ambar, acima dos botoes) para que ao clicar em qualquer opcao o registo possa ser processado imediatamente.

---

## Parte 3 -- Pagina /upgrade: bloco referral no SkipCard

### 3A. Bloco referral dentro do SkipCard

Adicionar acima do botao "Confirmar so Premium" um bloco discreto:
- Fundo: green-50, border green-100, rounded-lg, p-3
- Icone: Gift + texto "Ou convida 2 amigos e ganha o Premium gratis"
- Link: "Ver como funciona →" que abre mini-modal

### 3B. Mini-modal informativo "Como funciona"

Novo estado `isReferralInfoOpen` no componente Upsell.

Conteudo do modal:
- Icone Gift centralizado
- H3: "Ganha o Premium Pass gratis"
- Paragrafo explicativo
- 4 passos numerados
- Nota sobre prazo
- Botao primario: "Inscrever-me gratis e partilhar link" → navega para landing page e abre modal de registo gratis com path referral
- Botao secundario: "Prefiro pagar €15 directamente" → fecha mini-modal

### 3C. Confirmacao page com plan=referral

Actualizar `src/pages/Confirmacao.tsx` para suportar `plan=referral` e `plan=free`:

- **plan=free:** Confirmacao simples (inscricao gratis confirmada, sem widget de convites)
- **plan=referral:** Confirmacao com widget de convites (link copiavel, WhatsApp, Email, progresso)

Adicionar ao objecto `CONFIRMATIONS` as entradas `free` e `referral`.

---

## Parte 4 -- Melhorias UX/UI menores

- Remover `PremiumForm` do modal (ja nao e necessario -- o botao "€15" redireciona para /upgrade em vez de mostrar formulario inline)
- Limpar a logica de `variant === "premium"` no modal principal
- Garantir que os step indicators (dots) no fundo do UpsellView sao removidos ou actualizados

---

## Resumo de ficheiros alterados

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/RegistrationModal.tsx` | Reescrever UpsellView (3 bullets, 3 opcoes, campos nome/email), corrigir flow €15 → /upgrade, adicionar navigate |
| `src/hooks/useRegistrationModal.tsx` | Sem alteracoes |
| `src/pages/Upsell.tsx` | Adicionar bloco referral no SkipCard + mini-modal informativo |
| `src/pages/Confirmacao.tsx` | Adicionar entries para plan=free e plan=referral com widget de convites |
| `src/components/landing/HeroSection.tsx` | Alargar max-w |
| `src/components/landing/MirrorCopySection.tsx` | Alargar max-w |
| `src/components/landing/CTAFinalSection.tsx` | Alargar max-w |
| Outras seccoes | Alargar max-w conforme tabela acima |

---

## Sequencia de implementacao

1. Alargar max-widths em todas as seccoes da landing page
2. Corrigir RegistrationModal -- flow, bullets, 3 opcoes, campos inline
3. Actualizar /upgrade com bloco referral + mini-modal
4. Actualizar /confirmacao com plan=free e plan=referral

