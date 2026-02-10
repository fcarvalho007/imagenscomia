

# Remover caixa 🏆 + Melhorias do documento

---

## 1. Remover caixa 🏆 (PresenterSection.tsx)

Remover o bloco ScrollReveal com a caixa "29 anos . 700+ projetos . L'Oreal . BMW . 3M . Impresa" (linhas 51-58). A informacao de "700+ auditorias" ja esta na caixa "Fundador e CEO", tornando esta caixa redundante.

---

## 2. Melhorar respostas do FAQ (FAQSection.tsx)

O documento tem respostas mais persuasivas e completas. Actualizar:

| Pergunta | Resposta actual | Resposta do documento |
|----------|----------------|----------------------|
| "Preciso de conhecimentos tecnicos?" | Generica | "Nao. Se consegues usar o WhatsApp, consegues criar imagens com este metodo. Vou mostrar passo a passo, do zero." |
| "As ferramentas mostradas sao pagas?" | Generica | "Mostro opcoes gratuitas e pagas. Maior parte do que ensino funciona com ferramentas gratuitas (incluindo a app que criei especificamente para este metodo)." |
| "Quanto tempo para ver resultados?" | Vaga | "No dia seguinte ao webinar ja consegues criar as tuas primeiras imagens profissionais. Participantes anteriores relatam criacao de 5-10 imagens utilizaveis na primeira semana." |

---

## 3. Adicionar frase qualificadora nos Desafios (ChallengesSection.tsx)

O documento inclui uma frase apos os 6 desafios que funciona como qualificador:

> "Se te identificaste com pelo menos 2 destes problemas, este webinar vai poupar-te meses de tentativa e erro."

Adicionar esta frase centrada abaixo da grelha, com texto em ink-500 e tamanho 16px.

---

## Resumo de ficheiros

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/PresenterSection.tsx` | Remover bloco da caixa 🏆 (linhas 51-58) |
| `src/components/landing/FAQSection.tsx` | Actualizar 3 respostas com copy mais persuasivo do documento |
| `src/components/landing/ChallengesSection.tsx` | Adicionar frase qualificadora apos a grelha de desafios |

