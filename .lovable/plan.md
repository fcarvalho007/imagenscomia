

# Agenda 3 items + visual "Para quem é"

## Resumo

2 alteracoes em `src/pages/Video.tsx`:
1. Agenda passa a ter 3 items: manter item 01 actual (Ferramentas) e adicionar items 02 (Workshop Pratico) e 03 (Erros comuns) com numeracao ajustada
2. Seccao "Para quem e" — remover numeracao dos items, alinhar "Certo para" e "Nao e para" com as caixas, remover travessao do titulo

---

## 1. Agenda — 3 items

O array `videoAgenda` passa a ter:

```
01 — Ferramentas de vídeo certas (sem confusão)
     (ja existe, manter igual)

02 — Workshop Prático: O processo mínimo (briefing + checklist) para produzir vídeo com consistência
     desc: "Estrutura simples para sair com clips prontos a publicar."
     bullets: ["Do briefing ao primeiro clip: passo a passo", "Checklist de produção para manter consistência"]
     deliverable: "Processo mínimo para produzir vídeo com qualidade."
     borderColor: border-l-[#0891B2]

03 — Erros mais comuns que destroem consistência (e como evitar)
     desc: "Os erros que quase toda a gente comete — e como os corrigir rápido."
     bullets: ["Ajustes simples que fazem diferença no resultado"]
     deliverable: "Checklist anti-erros para vídeo com IA."
     borderColor: border-l-green-600
```

---

## 2. Seccao "Para quem e" — ajustes visuais

Baseado na imagem de referencia:

- **Titulo**: Remover travessao. Passa a ser: `Para quem é` (branco) + `e para quem não é` (gradient roxo), sem o " — "
- **Card "Certo para"**: Remover a numeracao (01, 02, 03, 04) dos items da lista — ficar apenas com o icon check + texto
- **Card "Nao e para"**: Ja esta sem numeracao, manter igual
- **Headers dos cards**: "Certo para" e "Nao e para" ficam alinhados dentro das caixas (ja estao, mas confirmar que nao ha padding excessivo)

---

## Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

1. **Linhas 147-154**: Renumerar item actual 02 para 03, e inserir novo item 02 (Workshop Pratico) entre os dois
2. **Linha 585**: Remover ` —` do titulo "Para quem e"  — passa de `Para quem é — ` para `Para quem é `
3. **Linhas 600-603**: Remover o `<span>` com a numeracao (01, 02...) de cada item da lista "Certo para"

