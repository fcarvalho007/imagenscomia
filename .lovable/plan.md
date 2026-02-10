

# Alteracoes a Landing Page -- 7 Modificacoes Pontuais

Todas as alteracoes sao cirurgicas. Nenhuma seccao, componente ou estilo fora do listado sera tocado.

---

## Alteracao 1 -- Ordem das seccoes (Index.tsx)

**Ficheiro:** `src/pages/Index.tsx` (linhas 21-22)

Trocar a posicao de `<MirrorCopySection />` e `<HeroSection />`:

```
ANTES:                      DEPOIS:
<StickyTopBar />            <StickyTopBar />
<MirrorCopySection />       <HeroSection />        ← sobe
<HeroSection />             <MirrorCopySection />  ← desce
```

---

## Alteracao 2 -- Texto do botao da barra topo (StickyTopBar.tsx)

**Ficheiro:** `src/components/landing/StickyTopBar.tsx` (linha 19)

- ANTES: `Reservar lugar →`
- DEPOIS: `Reservar lugar gratis →`

---

## Alteracao 3 -- Hero: headline reestruturado (HeroSection.tsx)

**Ficheiro:** `src/components/landing/HeroSection.tsx`

Substituir o bloco de headline + subheadline (linhas 12-25) por:

1. **Label** (novo, acima do H1): `"WEBINAR GRATUITO · 18 FEVEREIRO · 10H00"` -- mesmo estilo das labels existentes (Montserrat 600, 11px, uppercase, tracking, blue-600)
2. **H1** (duas linhas, sem gradiente):
   - "Como Criar Imagens Profissionais"
   - "com IA para a Tua Empresa"
3. **Tagline** (nova, logo abaixo do H1): `"Sem Designer. Sem Agencia. Sem Curso de 6 Meses."` -- Montserrat 700, text-[20px] md:text-[26px], text-blue-600
4. **Subheadline** (actualizar texto): `"O metodo que transforma um briefing em imagem utilizavel em menos de 3 minutos. Demonstrado ao vivo, no teu ecra."`
5. **Meta row** (novo, abaixo da subheadline): emojis + texto inline: `"📅 Quarta 18 Fev · 🕙 10h00 · ⏱ 75 min · 🎓 Gratuito"`

Tudo o resto (placeholder video, botoes, social proof) permanece inalterado.

---

## Alteracao 4 -- Mirror Copy: 5 novos bullets (MirrorCopySection.tsx)

**Ficheiro:** `src/components/landing/MirrorCopySection.tsx` (linhas 4-8)

Substituir o array `points` de 3 itens para 5 itens:

1. "Ja tentaste Midjourney ou DALL-E e saiste frustrado -- e ainda nao percebeste que o problema era o prompt, nao a ferramenta"
2. "Queres imagens profissionais para redes sociais e anuncios sem pagar designer para cada peca nova"
3. "Sabes que a IA consegue muito mais do que o ChatGPT mas ninguem te mostrou como aplicar ao teu negocio em concreto"
4. "Precisas de consistencia visual na tua marca sem orcamento para agencia criativa a tempo inteiro"
5. "Queres ver como se faz -- ao vivo, no teu ecra -- nao ouvir mais teoria sobre ferramentas que nunca experimentaste"

A label, separador, meta row e estilo visual dos cards mantêm-se iguais.

---

## Alteracao 5 -- Pain Points simplificados (ChallengesSection.tsx)

**Ficheiro:** `src/components/landing/ChallengesSection.tsx`

5a. **Headline** (linha 17): `"Identifica-te com algum destes desafios?"` → `"Algum disto soa familiar?"`

5b. **Remover subtitulo** (linha 19-21): apagar o `<p>` com "Se sim a pelo menos um..."

5c. **Titulos actualizados** nos dados do array (confirmar/ajustar):
- 01: "O designer demora dias e custa caro" (igual)
- 02: "Tentaste IA mas os resultados foram inuteis" (actualizar de "Tentaste mas...")
- 03: "O teu stock fotografico parece de qualquer empresa" (actualizar de "Stock fotografico nao representa a marca")
- 04: "Nao tens consistencia visual entre publicacoes" (actualizar de "Nao tens consistencia visual")
- 05: "Nao sabes qual ferramenta usar para que" (actualizar de "Nao sabes qual ferramenta usar")
- 06: "Precisas de mais volume sem aumentar equipa" (actualizar de "Precisas de volume sem aumentar equipa")

Remover campo `desc` do array e do render (linha 30).

5d. **Texto de fecho** (linha 38): `"Em 75 minutos, mostro o metodo completo — do briefing a imagem final, ao vivo."` → `"Em 75 minutos mostro como resolver os tres primeiros. Ao vivo, no teu tipo de empresa."`

---

## Alteracao 6 -- FAQ: ultima pergunta (FAQSection.tsx)

**Ficheiro:** `src/components/landing/FAQSection.tsx` (linha 27-28)

Substituir o 5o item do array `faqs`:

- **ANTES:** q: "Ha algum programa mais desenvolvido..." / a: "Sim -- serei direto..."
- **DEPOIS:** q: `"Posso ver o webinar depois se nao puder estar ao vivo?"` / a: `"A gravacao esta disponivel no Premium Pass (€15). A inscricao gratuita da acesso ao vivo mas nao inclui gravacao -- se faltares ao webinar, perdes o acesso ao conteudo. O Premium garante acesso para sempre por €15, agora. Depois do webinar passa a custar €27."`

---

## Alteracao 7 -- Verificacao: card Sistema 3 (ProgramSection.tsx)

**Ficheiro:** `src/components/landing/ProgramSection.tsx` (linhas 26-34)

O card 03 "Escalar Producao Visual Sem Equipa" ja existe e renderiza. Mas a descricao e os bullets diferem do pedido. Actualizar:

- **desc:** `"Como passar de 5 imagens por semana para 50 -- com o mesmo tempo e sem mais custos."`
- **bullets:**
  - "Processo de producao em lote com IA"
  - "App Calculadora: custo IA vs designer externo"
  - "Mapa de decisao: quando usar IA, quando contratar"

(3 bullets em vez dos 2 actuais)

---

## Resumo de ficheiros alterados

| Ficheiro | Alteracao |
|----------|-----------|
| `src/pages/Index.tsx` | Trocar ordem Hero / MirrorCopy |
| `src/components/landing/StickyTopBar.tsx` | Texto do botao |
| `src/components/landing/HeroSection.tsx` | Label + H1 + tagline + subheadline + meta row |
| `src/components/landing/MirrorCopySection.tsx` | 5 novos bullets |
| `src/components/landing/ChallengesSection.tsx` | Headline, remover subtitulo, remover desc dos cards, texto fecho |
| `src/components/landing/FAQSection.tsx` | Ultima pergunta substituida |
| `src/components/landing/ProgramSection.tsx` | Desc e bullets do card 03 |

Nenhuma dependencia nova. Nenhum ficheiro criado ou apagado.

