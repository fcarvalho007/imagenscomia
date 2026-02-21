

# Alteracoes na pagina /video

## Resumo

20 alteracoes de copy, datas e pequenos ajustes visuais na pagina /video. Nenhuma alteracao estrutural — apenas texto, datas e remocao de elementos.

---

## Ficheiros a modificar

**`src/pages/Video.tsx`** (todas as alteracoes) e **`src/components/webinar/videoWebinarConfig.ts`** (datas)

---

## Lista completa de alteracoes

### Datas e config (videoWebinarConfig.ts)

- Webinar: 3 Mar -> **5 Mar** (`startDate: new Date("2026-03-05T10:00:00+00:00")`)
- Masterclass: 5 Mar -> **12 Mar** (`masterclassDate: new Date("2026-03-12T10:00:00+00:00")`)
- `metaLine`: "Quarta-feira, 5 de Marco . 10h00 (Portugal)"

### Sticky top bar (linhas 218-246)

1. Countdown mover para o lado esquerdo (antes do texto "AO VIVO")
2. Remover a data "3 MAR" do texto — trocar "AO VIVO . 3 MAR . 10H00" por "AO VIVO . 10H00"
3. Actualizar countdown target para `new Date("2026-03-05T10:00:00")`

### Hero — badge pill (linha 288)

4. Reforcar badge: trocar `WEBINAR GRATUITO . AO VIVO` por `WEBINAR GRATUITO . AO VIVO . 5 MARCO, 10H`

### Hero — titulo (linhas 297-322)

5. Remover "para marketing" (linhas 315-322 — o `motion.span` com "para marketing")

### Hero — subtitulo (linhas 326-333)

6. Trocar "Sais com um sistema, ferramentas" por "Adquires um sistema, ferramentas"

### Hero — sub-subtitulo (linhas 336-343)

7. Remover a linha "Sessao pratica para gestores e profissionais de marketing" (eliminar o `motion.p` inteiro)

### Hero — info boxes (linhas 352-369)

8. Actualizar DATA de "3 de Marco" para "5 de Marco"

### Logo Marquee (usado via componente LogoMarquee)

9. Nao alterar o componente partilhado — trocar inline no Video.tsx. Problema: usa `<LogoMarquee />` importado. Solucao: alterar o texto "Plataformas a considerar" para "Plataformas de referencia para o tema" directamente no `LogoMarquee.tsx` OU passar como prop. Como o componente e partilhado com Index, a melhor opcao e aceitar uma prop `label` no LogoMarquee com default "Plataformas a considerar", e na pagina Video passar `label="Plataformas de referencia para o tema"`.

### Seccao "Para quem e" (linhas 585-637)

10. Trocar titulo "Para quem nao e" (linha 612) por **"Nao e para..."**
11. Remover conteudo das labels dentro dos cards: apagar "Certo para" (linha 596-598) e "Nao e para" (linha 614-616) — remover os `<p>` com esses textos
12. No array `forWhom` (linha 127): trocar "Quem faz paid media e precisa de criativos com variacoes rapidas." por "Quem faz paid media e precisa de gerar videos diferentes e de forma rapida."
13. No array `notFor` (linha 134): trocar "Quem procura «milagre» sem processo." por "Quem procura «milagre» sem processos."

### Agenda (linhas 640-700)

14. No array `videoAgenda`, bullet "Lista curada para guardar nos favoritos" -> "Lista pronta para guardar nos favoritos"
15. Na descricao geral da agenda (linha 651): "Demos ao vivo" -> "*Demos* ao vivo" — colocar "Demos" em italico usando `<em>` inline

### Bio/Speaker (linhas 702-769)

16. No array `speakerCredentials` (linha 178), ultimo item: trocar sub de "DIGITALFC consultoria com auditoria digital a mais de 700+ empresas. L'Oreal. BMW. 3M" por "DIGITALFC: consultoria, formacao e auditoria digital para mais de 700 empresas com resultados comprovados"

### FAQs (linhas 181-187)

17. FAQ 1 ("Preciso de experiencia com IA?"): trocar "De todo." por "Nao, de todo."
18. FAQ 2 ("Funciona para B2B e B2C?"): trocar resposta por "Sim! O metodo aplica-se a ambos -- anuncios, demos de produto, prova social, conteudo para redes sociais. Vais ver exemplos dos dois casos."
19. FAQ 4 ("Existe algo mais aprofundado sobre video?"): trocar pergunta por "Existe alguma formacao mais aprofundada sobre video?" e resposta por "Sim. Alem do webinar gratuito, havera uma Masterclass de 3 horas dedicada a video com IA -- com ferramentas, templates e acompanhamento proximo. Podes garantir o teu acesso ja, durante o processo de inscricao neste webinar, ou inscrever-te depois."

### Final CTA (linhas 849-894)

20. Trocar "Sem compromisso. Evento ao vivo em 3 de Marco de 2026, as 10h." por "Sem compromisso. Evento ao vivo, a 5 de marco de 2026, as 10h."
21. Remover "Lugares limitados para o directo." (linha 891-893)

### Seccao "mercado exige" (linhas 428-583)

22. Trocar titulo "Video e o formato que o mercado exige" por "O mercado exige Video." — com "Video" a manter o efeito glitch. Ajustar `data-text` do span glitch para "Video."

### RegistrationModalProvider (linha 905)

23. Actualizar `subtitle` de "Terca-feira, 3 de Marco, 10h" para "Quarta-feira, 5 de Marco, 10h"

### Premium Pass — Q&A

24. Nota: o pedido menciona "acrescentar ao Premium 15EUR o Q&A dia 10 de Marco, as 14:30h > 15h". Isto afecta o modal de registo/upgrade (PurchaseModal ou RegistrationModal), nao a landing page directamente. Sera implementado como texto adicional na descricao do Premium Pass nos componentes de upgrade.

### usePageMeta (linha 199)

25. Actualizar titulo meta de "3 Marco 2026" para "5 Marco 2026"

---

## Ficheiros a modificar

| Ficheiro | Alteracoes |
|----------|-----------|
| `src/components/webinar/videoWebinarConfig.ts` | Datas: webinar 5 Mar, masterclass 12 Mar |
| `src/pages/Video.tsx` | Todos os pontos 1-23 e 25 acima |
| `src/components/landing/LogoMarquee.tsx` | Aceitar prop `label` opcional |

## Notas

- Todas as alteracoes sao de copy/texto — sem mudancas estruturais
- O efeito glitch no titulo sera ajustado para "Video." em vez de "mercado exige"
- A sugestao sobre "ferramentas gratuitas/pagas" e "exemplos de output" na agenda sera considerada como bloco adicional apos a agenda actual

