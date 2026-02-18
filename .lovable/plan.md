
## Alterações à página `/gravacao`

Quatro grupos de mudanças, todos em `src/pages/Gravacao.tsx`, mais uma linha em `src/pages/Index.tsx` para redirecionar `/` para `/gravacao`.

---

### 1. Rota `/` aponta para `/gravacao` (em vez de `/live`)

Em `src/pages/Index.tsx`, a linha de redirect já existe:
```ts
return <Navigate to="/live" replace />;
```
Muda para:
```ts
return <Navigate to="/gravacao" replace />;
```

---

### 2. Título da página (meta + H1)

**Meta title** (linha 104):
> "Gravação: Criar Imagens com IA para Empresas — Acesso Imediato"

Passa a:
> "Gravação: Aprende a Criar Imagens Profissionais com Inteligência Artificial"

**H1 no hero** (linha 195):
> "Gravação: Imagens Profissionais com Inteligência Artificial"

Passa a (duas linhas):
> "Gravação: Aprende a Criar Imagens Profissionais  
> com Inteligência Artificial"

---

### 3. Tratamento por "tu" em toda a página

Ocorrências a corrigir (linguagem impessoal → "tu"):

| Antes | Depois |
|---|---|
| "O que recebe (Pack 27 €)" | "O que recebes (Pack 27 €)" |
| "Receberá um email com o link..." | "Recebes um email com o link..." |
| "pode rever quantas vezes quiser" | "podes rever quantas vezes quiser" |
| "Inclui resumo PDF..." | mantém (é lista de factos, sem sujeito) |
| "A fatura é emitida automaticamente" | mantém |
| "Pode contactar-nos" | "Podes contactar-nos" |
| "Se houver identificação com 2 ou mais pontos..." | "Se te identificares com 2 ou mais pontos..." |
| "esta gravação encurta meses..." | mantém |
| forWhom items (são factos de perfil, sem pronome) | mantém |
| FAQ q "Como recebo o acesso?" | "Como recebo o acesso?" (já está bem) |

---

### 4. Pack Items — substituir lista atual

A lista `packItems` atual tem 6 itens genéricos. Substituir pelos itens exatos indicados:

```
1. Gravação completa (HD)
2. Resumo PDF da sessão
3. Guia de Apoio (32 páginas) sobre Imagens com IA e Nano Banana Pro
4. Documento com biblioteca de prompts base (editáveis)
```

O cabeçalho da secção também muda de "O que recebe (Pack 27 €)" para "O que recebes (Pack 27 €)".

---

### 5. Secção MÉTODO — agenda correta

A secção "O que se aprende na gravação" usa o array `methods` com 3 blocos. Substituir pelo conteúdo real da agenda:

**Bloco 01 — Estado da Arte**
- Título: "Estado da Arte"
- Desc: "Modelos e versões disponíveis. Ferramentas gratuitas e pagas — o que escolher e quando."
- Deliverable: "Mapa claro do ecossistema actual de IA para imagens."

**Bloco 02 — Instruções Profissionais**
- Título: "Instruções Profissionais"
- Desc: "Passo a passo do briefing à produção. Adaptação de formatos e edição do resultado."
- Deliverable: "Método replicável para qualquer brief."

**Bloco 03 — Do Objetivo ao Criativo**
- Título: "Do Objetivo ao Criativo"
- Desc: "Fluxo de trabalho completo. Peças prontas a publicar — com consistência visual."
- Deliverable: "Processo para produzir criativos com qualidade e velocidade."

---

### Ficheiros alterados
- `src/pages/Index.tsx` — redirect de `/live` para `/gravacao`
- `src/pages/Gravacao.tsx` — título, tratamento por tu, pack items, agenda
