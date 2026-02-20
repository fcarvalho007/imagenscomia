
# FAQ + remover "PÚBLICO-ALVO"

## Resumo

3 alteracoes em `src/pages/Video.tsx`:
1. Reescrever FAQs com tom mais simpatico, remover "O que preparar?", e esclarecer Premium Pass (15 EUR) + Masterclass (47 EUR)
2. Remover label "PUBLICO-ALVO" da seccao "Para quem e"

---

## 1. FAQs — novo conteudo (tom mais proximo e claro)

Substituir o array `faqs` (linhas 181-187) por:

```
1. "Preciso de experiencia com IA?"
   → "De todo. Tudo e mostrado passo a passo, de forma simples. Se usas WhatsApp, consegues acompanhar."

2. "Funciona para B2B e B2C?"
   → "Sim! O metodo aplica-se a ambos — anuncios, demos de produto, prova social, conteudo para redes. Vais ver exemplos dos dois."

3. "E se nao conseguir assistir ao vivo?"
   → "Inscreve-te na mesma — recebes instrucoes e proximos passos por email. Se quiseres acesso a gravacao integral + guia de apoio, o Premium Pass (15 EUR + IVA) garante isso."

4. "Existe algo mais aprofundado sobre video?"
   → "Sim. Alem do webinar gratuito, ha uma Masterclass de 3 horas dedicada a video com IA — com ferramentas, templates e acompanhamento. Podes adiciona-la durante a inscricao."

5. "Quanto tempo demora a aplicar?"
   → "O sistema e desenhado para comecar pequeno. Depois do webinar, ja consegues produzir os primeiros clips e repetir semanalmente."
```

## 2. Remover "PUBLICO-ALVO"

Remover o bloco `<ScrollReveal>` com o paragrafo "PUBLICO-ALVO" (linhas 590-594).

---

## Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

1. **Linhas 181-187**: Substituir array `faqs` pelo novo conteudo (5 items, sem "O que preparar?", com Premium Pass e Masterclass)
2. **Linhas 589-594**: Remover o `<ScrollReveal>` que contem "PUBLICO-ALVO"
