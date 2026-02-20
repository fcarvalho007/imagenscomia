

## Adicionar secção de testemunhos Google na pagina /gravacao

### O que muda

Criar uma nova secção de testemunhos reais do Google entre a secção do **Presenter** e o **FAQ** (entre as linhas 439 e 441), com:

- Titulo "Avaliações públicas no Google" com o logo do Google e rating 5,0
- 8 testemunhos reais extraídos das capturas de ecrã:
  1. **Dario Ramos** — "Profissional Top, sempre disponível para ajudar."
  2. **Marcelo Caruana** — "Conteúdos sempre muito detalhados e claros :)"
  3. **Isabel Martins** — "As formações do Frederico são sempre excepcionais. Partilha de conhecimento e ensinamento prático."
  4. **Silvana Curado** — "Muito bom. A sessão introdutória sobre geração de imagem a que assisti teve uma velocidade ótima, para o meu nível de conhecimento médio-baixo e cumpriu escrupulosamente a proposta de valor. Boa energia!"
  5. **Paulo Ferrao** — "Webinar esclarecedor. Interessante e recheado como sempre! Obrigado"
  6. **Joana Veigas** — "Gostei muito do Webinar IA Imagens. Interessante, bem explicada e cativante. Curiosa para saber casa vez mais. Vou continuar a acompanhar as muitas dicas que o Frederico vai partilhando. Obrigada Frederico!"
  7. **Catia Martins** — "Foi um webinar excelente. Para o tema que é parece sempre curto mas agrega sempre muito valor. E é muito útil para o trabalho do dia a dia, para quem trabalha com criativos. O Frederico nunca desilude."

- Cards brancos com bordas suaves, 5 estrelas douradas, nome em bold
- Grid responsivo: 1 coluna mobile, 2 colunas tablet, 3 colunas desktop
- Fundo `bg-background` para manter consistência com o resto da pagina

### Ficheiro a alterar

| Ficheiro | Alteração |
|---|---|
| `src/pages/Gravacao.tsx` | Adicionar array `googleReviews` nos dados (apos linha 96) e inserir secção JSX entre Presenter e FAQ (entre linhas 439 e 441) |

### Estrutura da secção

```text
+--------------------------------------------------+
|  [Google logo]  5,0 ★★★★★  · Avaliações públicas |
+--------------------------------------------------+
|  Card 1  |  Card 2  |  Card 3                    |
|  Card 4  |  Card 5  |  Card 6                    |
|  Card 7  |                                        |
+--------------------------------------------------+
```

Cada card mostra:
- Inicial colorida (circulo com primeira letra do nome)
- Nome em bold
- 5 estrelas douradas
- Texto do testemunho

Nenhum ficheiro novo e criado — tudo dentro de `Gravacao.tsx` usando os mesmos componentes (`ScrollReveal`) e estilos ja presentes na pagina.
