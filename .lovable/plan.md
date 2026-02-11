
# Redesign do Upsell Masterclass (StepMasterclass.tsx)

## Ficheiro: `src/components/upgrade/StepMasterclass.tsx`

Reescrever o componente completo com as seguintes alteracoes:

### 1. Titulo H2
- De: "Para quem quer implementar, nao so aprender"
- Para: **"Transformar imagens em video com IA — ao vivo"** (opcao B, mais descritiva e concreta)

### 2. Subtitulo
- De: "O webinar ensina o metodo. A Masterclass aprofunda..."
- Para: **"O webinar ensina o metodo. A Masterclass mostra como o usar para gerar video — com ferramentas certas, prompts prontos e um fluxo replicavel."**

### 3. Tag no topo do card
- Adicionar uma tag/pill **"IMAGEM → VIDEO"** no topo do card, antes do preco (texto pequeno, fundo subtil, destaque visual imediato)

### 4. Cabecalho de preco
- Manter: "MASTERCLASS ONLINE" (kicker)
- Manter: "€47 + IVA" (preco grande)
- Substituir microcopy por: **"Pagamento unico · lugares limitados · 5 de Marco (quinta-feira)"**

### 5. Badge Early Bird
- Linha 1: **"Early bird: €47 + IVA"**
- Linha 2: **"Depois: €97 + IVA"**

### 6. Bullets (4 items, substituir os 3 atuais)
1. **"Imagem → video com IA: do visual estatico ao clip pronto"**
   - Micro: "Fluxo pratico para transformar uma imagem em video utilizavel."
2. **"Ferramentas certas (gratuitas e pagas) — sem confusao"**
   - Micro: "Selecao curada por objetivo, para guardar e usar."
3. **"Guia de prompts para video (pronto a reutilizar)"**
   - Micro: "Estruturas testadas para consistencia e melhor controlo do resultado."
4. **"Gravacao incluida"**
   - Micro: "Rever e replicar sempre que necessario."

### 7. Remover label antigo "Da imagem ao video — ao vivo com o Frederico:"
- Ja nao e necessario com a nova tag e bullets

### 8. Linha de escassez
- Adicionar antes do botao: **"Grupo limitado para garantir acompanhamento."** (texto pequeno, centrado)

### 9. Detalhes do evento
- Substituir array por: `["📅 5 de Marco (quinta-feira)", "💻 Online", "⏱ 3 horas", "👥 Max. 30"]`

### 10. CTA (botao)
- De: "Reservar Masterclass →"
- Para: **"Garantir lugar na Masterclass →"**
- Adicionar microcopy abaixo do botao: **"Pagamento unico · acesso a gravacao incluido"**

### 11. Tom
- Remover "tu/voce" directo (ja nao ha "Aprende", "teu sector", "precisares")
- Linguagem impessoal e de implementacao

### Hierarquia visual final do card (leitura em 5 segundos)
```text
┌─────────────────────────────────────┐
│ [IMAGEM → VÍDEO] tag               │
│                                     │
│ MASTERCLASS ONLINE                  │
│ €47 + IVA          [Early bird]     │
│ Pagamento único · 5 Mar             │
│─────────────────────────────────────│
│ ✓ Imagem → vídeo com IA            │
│ ✓ Ferramentas certas                │
│ ✓ Guia de prompts para vídeo        │
│ ✓ Gravação incluída                 │
│                                     │
│ 📅 5 Mar · 💻 Online · ⏱ 3h · 👥 30│
│                                     │
│ Grupo limitado para acompanhamento. │
│                                     │
│ [Garantir lugar na Masterclass →]   │
│ Pagamento único · gravação incluída │
└─────────────────────────────────────┘
```

Apenas 1 ficheiro a editar: `src/components/upgrade/StepMasterclass.tsx`
