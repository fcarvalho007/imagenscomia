

# Modal: Campos primeiro, nome transita, botoes mais claros

---

## Alteracao 1 -- Reordenar o modal (RegistrationModal.tsx)

Reorganizar a ordem dos elementos no UpsellView:

**Ordem actual:**
1. Titulo "Antes de continuar..."
2. Subtitulo "Com a versao gratuita, vais perder acesso a:"
3. 3 bullets vermelhos
4. Caixa ambar (urgencia)
5. Campos nome + email
6. "Como preferes avancar?"
7. 3 botoes

**Nova ordem:**
1. Titulo "Antes de continuar..."
2. Subtitulo "Preenche os teus dados para reservar o lugar:"
3. Campos nome + email
4. Subtitulo "Com a versao gratuita, vais perder acesso a:"
5. 3 bullets vermelhos
6. "Como preferes avancar?"
7. 3 botoes
8. RGPD

**Remover:** a caixa ambar "Se mudar de ideias depois do webinar, o Premium custara €27. Poupa €12 ao decidir agora."

---

## Alteracao 2 -- Botao Premium valida nome/email e passa dados

Actualmente `handleGoToPremium` faz `close() + navigate("/upgrade")` sem validar campos.

Alterar para:
- Validar que nome e email estao preenchidos (mesma validacao dos outros botoes)
- Navegar para `/upgrade?name=NOME&email=EMAIL` com os dados em query params
- Isto permite que a pagina /upgrade saude o utilizador pelo nome

---

## Alteracao 3 -- Texto dos botoes

- Botao 1: `"Sim, quero o Premium por €15"` passa para `"Sim, quero o Premium por €15+IVA"`
- Botao 2: manter `"Prefiro convidar 2 amigos e ganhar gratis"`
- Botao 3: manter `"Nao, continuar com versao gratuita"`

---

## Alteracao 4 -- Nome transita para /upgrade (Upsell.tsx)

Na pagina `/upgrade`:
- Ler `name` e `email` dos query params (`useSearchParams`)
- Mostrar uma saudacao no HeroShort: "Ola, **[NOME]**! Queres ir mais fundo?" (se nome existir)
- Passar o email para `handleConfirm` no body do `create-payment` (actualmente envia string vazia)

---

## Alteracao 5 -- Nome transita para /confirmacao

Quando o utilizador clica "referral" ou "free" no modal:
- Apos registo bem-sucedido, redirecionar para `/confirmacao?plan=referral&name=NOME` ou `plan=free&name=NOME`
- Na pagina Confirmacao, ler o `name` e mostrar: "Ola, **[NOME]**! A tua inscricao esta confirmada."

Actualmente o modal mostra a confirmacao inline (ConfirmationView). Manter esse comportamento, mas actualizar o titulo para incluir o nome: "Inscricao Confirmada, **[NOME]**!"

---

## Ficheiros alterados

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/RegistrationModal.tsx` | Reordenar campos para cima, remover caixa ambar, validar nome/email no Premium, adicionar +IVA, passar nome na confirmacao |
| `src/pages/Upsell.tsx` | Ler name/email dos query params, saudacao personalizada, passar email ao pagamento |
| `src/pages/Confirmacao.tsx` | Ler name dos query params, saudacao personalizada |

