

## Otimizacao da Landing Page de Conversao

### Resumo das alteracoes

Reescrita de copy em 7 ficheiros da landing page para simplificar linguagem, remover jargao, eliminar tratamento direto ("tu"/"voce"), reduzir repeticao e reforcar dores acima da dobra. Layout e estrutura visual mantidos.

---

### 1. HeroSection.tsx

**Remover:**
- Linha "De briefing a imagem profissional em menos de 3 minutos -- demonstrado ao vivo."

**Adicionar mini-bloco "Isto soa familiar?" (3 bullets) entre o subtitulo e os info-cards:**
- "O stock de imagens parece igual ao de toda a gente"
- "Falta consistencia visual entre publicacoes"
- "A IA ate 'faz', mas sai generico e sem identidade"

**Adicionar 1 linha de alivio/beneficio apos os bullets:**
- "Ao vivo: de briefing a imagem pronto a publicar em minutos. Com metodo e exemplos reais."

**Mover prova social (badge Google 5,0)** para cima, logo antes do CTA (remover da posicao actual abaixo do botao).

**Manter:** titulo principal, CTA, microcopy RGPD.

---

### 2. MirrorCopySection.tsx — "Este webinar e para quem"

**Reescrever bullets em linguagem impessoal:**
1. "Para quem precisa de imagens para redes sociais e anuncios sem depender de terceiros."
2. "Para quem sabe que a IA pode fazer mais, mas ninguem mostrou como aplicar ao negocio."
3. "Para quem quer consistencia visual na marca sem orcamento de agencia."

---

### 3. ChallengesSection.tsx — "Isto soa-te familiar?"

**Alterar titulo:** "Algum disto soa familiar?" passa a "Isto soa-te familiar?"

**Acrescentar 2 novos cards:**
- "05" - "Precisar de algo rapidamente e o designer vai levar horas ou dias"
- "06" - "Nao querer gastar dinheiro e perder tempo em sessoes fotograficas"

---

### 4. PresenterSection.tsx — "Quem apresenta"

**Remover** a caixa azul de estatisticas (stat bar com "700+ empresas", "20 anos", "1 194 avaliacoes").

**Reescrever** o credential "Fundador e CEO" para:
- Titulo: "Fundador e CEO"
- Sub: "DIGITALFC consultoria com auditoria digital a mais de 700+ empresas. L'Oreal. BMW. 3M"

---

### 5. ProgramSection.tsx — Programa (3 blocos)

**Renomear blocos:**
- 01: "Ferramentas certas (sem confusao)"
- 02: "Instrucoes profissionais (do briefing ao resultado)"
- 03: "Imagens para redes sociais e anuncios (prontas a usar)"

**Encurtar descricoes e bullets** (maximo 2 bullets de 10-12 palavras cada). Remover jargao ("estado da arte", "benchmarks", "framework", "publicavel").

**Deliverables:** 1 linha curta por bloco.

**Reescrever titulo da seccao** de "O que vais aprender em 75 minutos" para "O que se aprende em 75 minutos" (impessoal).

**Reescrever subtitulo** de "3 sistemas praticos. Demos ao vivo. Sais a criar imagens no dia seguinte." para "3 blocos praticos. Demos ao vivo. Resultados no dia seguinte."

---

### 6. CTAFinalSection.tsx — CTA final

**Adicionar nota humana** antes do botao CTA:
"Sessao especial preparada com poucos dias de antecedencia para manter o grupo pratico. Se fizer sentido, vale a pena convidar um colega ou amigo."

---

### 7. FAQSection.tsx — FAQ

**Adicionar 2 novas FAQs:**
- "Precisa de imagens para hoje. Isto ajuda?" com resposta curta (2-4 linhas).
- "Isto substitui designer ou sessao fotografica?" com resposta curta (2-4 linhas).

**Garantir** que todas as respostas existentes tem 2-4 linhas sem paragrafos longos (revisao de texto).

---

### Ficheiros alterados

| Ficheiro | Tipo de alteracao |
|---|---|
| `src/components/landing/HeroSection.tsx` | Reescrita copy, mover prova social |
| `src/components/landing/MirrorCopySection.tsx` | Reescrita bullets (impessoal) |
| `src/components/landing/ChallengesSection.tsx` | Titulo + 2 novos cards |
| `src/components/landing/PresenterSection.tsx` | Remover stat bar, reescrever credential |
| `src/components/landing/ProgramSection.tsx` | Renomear, encurtar, remover jargao |
| `src/components/landing/CTAFinalSection.tsx` | Adicionar nota humana |
| `src/components/landing/FAQSection.tsx` | 2 novas FAQs, revisao respostas |

### Sem alteracoes

- Layout, cores, componentes UI, base de dados, routing -- tudo mantido.
