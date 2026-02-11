
# Alteracoes de texto no fluxo /upgrade

## Resumo

Actualizar textos em 4 passos do funil de upgrade e reescrever o conteudo da Masterclass para reflectir a transicao imagem-para-video.

## Alteracoes

### 1. Passo 1 — StepQualification.tsx

| Linha | Antes | Depois |
|-------|-------|--------|
| 42-43 | "Quase pronto — so 2 perguntas rapidas" | "(nome), so 2 perguntas muito rapidas" |

O nome vem do `userData.nome` no Upsell.tsx. Sera necessario passar o `userName` como prop ao StepQualification e extrair o primeiro nome.

### 2. Passo 2 — StepPersonalization.tsx

| Linha | Antes | Depois |
|-------|-------|--------|
| 18 | "Frederico vai ler antes do webinar." | "O Frederico vai ler antes do webinar." |

### 3. Passo 3 — StepPremium.tsx

| Linha | Antes | Depois |
|-------|-------|--------|
| 26-27 | "A tua inscricao gratuita esta confirmada." | "(nome), a tua inscricao gratuita esta confirmada." |
| 28 | "Antes de terminar — queres adicionar o Premium Pass?" | "Mas queres adicionar o Premium Pass para mais tranquilidade?" |

Sera necessario passar `userName` como prop ao StepPremium e extrair o primeiro nome.

### 4. Passo 4 — StepMasterclass.tsx

**Subtitulo** (linhas 27-30):

Antes:
```
O webinar ensina o metodo. A Masterclass
executa-o na tua empresa, com Frederico, ao vivo.
```

Depois:
```
O webinar ensina o metodo.
A Masterclass aprofunda para um grupo restrito ao vivo, com o Frederico.
```

**Descricao dos bullets** (linhas 34-36): Trocar "3 horas de implementacao ao vivo:" por um texto que reflicta a transicao de imagem para video. Novos bullets:

- "Da imagem ao video — domina a proxima fronteira" / "Aprende a criar video com IA usando o mesmo metodo das imagens."
- "Casos reais de empresas portuguesas" / "Trabalho feito durante a sessao, no teu sector."
- "Gravacao vitalicia + certificado Professor FEUC" / "Rever sempre que precisares."

Label antes dos bullets: "3 horas de implementacao ao vivo:" passa a "Da imagem ao video — ao vivo com o Frederico:"

### 5. Props adicionais — Upsell.tsx

Passar `userName={userData.nome}` ao StepQualification e StepPremium para que possam personalizar os titulos com o primeiro nome.

## Detalhes tecnicos

- **Ficheiros editados**: `StepQualification.tsx`, `StepPersonalization.tsx`, `StepPremium.tsx`, `StepMasterclass.tsx`, `Upsell.tsx`
- Extraccao do primeiro nome: `userName.trim().split(" ")[0]` (padrao ja usado noutros componentes do projecto)
- Sem alteracoes de layout, cores ou estrutura — apenas texto e 2 props novas
