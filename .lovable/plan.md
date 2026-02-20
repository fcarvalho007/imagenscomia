

# Testemunhos + Agenda redesign — pagina /video

## Resumo

3 alteracoes: (1) nova seccao de testemunhos com 6 reviews reais do ultimo webinar, (2) agenda reduzida a 3 items com textos actualizados, (3) novo fundo visual para a agenda.

---

## 1. Nova seccao — Testemunhos de quem participou

### Posicionamento
Inserir entre a seccao SPEAKER (section 5) e o FAQ (section 6). Faz sentido porque depois de ver quem apresenta, ver testemunhos reforça a prova social antes das perguntas frequentes.

### Dados dos 6 testemunhos (das imagens fornecidas)
1. **Joana Veigas** — "Guia local · 46 criticas · 14 fotos" — "Gostei muito do Webinar IA Imagens. Interessante, bem explicada e cativante. Curiosa para saber casa vez mais. Vou continuar a acompanhar as muitas dicas que o Frederico vai partilhando. Obrigada Frederico!"
2. **Catia Martins** — "1 critica" — "Foi um webniar excelente. Para o tema que e parece sempre curto mas agrega sempre muito valor. E e muito util para o trabalho do dia a dia, para quem trabalha com criativos. O Frederico nunca desilude."
3. **Paulo Ferrao** — "6 criticas" — "Webinar esclarecedor. Interessante e recheado como sempre! Obrigado"
4. **Isabel Martins** — "2 criticas" — "As formacoes do Frederico sao sempre excepcionais. Partilha de conhecimento e ensinamento pratico."
5. **Dario Ramos** — "Guia local · 18 criticas · 2 fotos" — "Profissional Top, sempre disponivel para ajudar"
6. **Maria Rocha** — "2 criticas" — "As aulas do prof Frederico Carvalho foram extremamente produtivas e a sua excelente pedagogia torna conteudos complexos em algo simples, pratico e aplicavel. Recomendo vivamente."

### Design
- Fundo escuro `#0f172a` (consistente com seccao testemunhos da landing page)
- Titulo: "Testemunhos de quem participou no ultimo webinar"
- Eyebrow: "PROVA SOCIAL" em roxo
- Badge Google 5.0 estrelas
- Grid 3 colunas desktop, 1 coluna mobile
- Cards com avatar circular (iniciais com gradient), nome, role, quote, 5 estrelas, "Google Reviews"
- Estilo identico ao `TestimonialsSection.tsx` existente mas com os novos dados

---

## 2. Agenda — reduzir para 3 items

### Array `agenda` actualizado
Remover item 1 ("Boas-vindas + o que mudou no video") e item 3 ("Demonstracao: do briefing ao primeiro clip").
Renumerar para 001, 002, 003:

```
001 — Workshop Pratico: O processo minimo (briefing + checklist) para produzir video com consistencia [tag: CORE]
002 — Erros mais comuns que destroem consistencia (e como evitar)
003 — Q&A — Perguntas e respostas ao vivo [tag: AO VIVO]
```

Nota: manter o item do Q&A que ja existia nos FAQs como passo final.

### Novo fundo visual
Substituir o fundo `#0a0a0f` plano por um fundo mais cinematografico:
- Base: gradient de `#020617` para `#0f0a1e` (dark com tom roxo subtil)
- Gradient radial central mais pronunciado (opacity ~8% em vez de 4%)
- Adicionar um segundo gradient radial verde muito subtil no canto inferior direito
- Manter o noise/grain overlay
- Layout: com apenas 3 items, mudar de grid 2x2 para 3 colunas lado a lado em desktop (`grid-cols-1 lg:grid-cols-3`), cada card mais alto e com mais padding

---

## 3. Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

1. **Linhas 138-143**: Actualizar array `agenda` — remover items 1 e 3, renumerar, actualizar textos
2. **Linhas 616-691**: Redesenhar seccao Agenda com novo fundo e grid 3 colunas
3. **Linhas 760-761**: Inserir nova seccao Testemunhos entre Speaker e FAQ
4. Adicionar array `videoTestimonials` com os 6 testemunhos das imagens

