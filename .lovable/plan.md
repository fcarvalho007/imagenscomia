

# Agenda item 1 + visual da secção "Para quem é"

## Resumo

2 alterações em `src/pages/Video.tsx`:
1. Substituir o primeiro item da agenda pelo conteúdo correcto sobre ferramentas de vídeo
2. Melhorar visualmente a secção "Para quem é — e para quem não é" com fundo diferenciado

---

## 1. Agenda — corrigir primeiro item

O item 01 passa a ser:

```
01 — Ferramentas de vídeo certas (sem confusão)
     desc: "Antes de escolher a ferramenta, convém perceber o que funciona hoje."
     bullets: ["Comparações rápidas entre ferramentas gratuitas e pagas", "Lista curada para guardar nos favoritos"]
     deliverable: "Mapa de decisão rápido para escolher a ferramenta certa."
     borderColor: border-l-blue-600
```

O item 02 mantém-se igual ("Erros mais comuns que destroem consistência").

---

## 2. Secção "Para quem é" — melhorar visual

Actualmente usa fundo `#0a0a0f` (DARK_950) igual a outras secções dark, o que faz tudo parecer igual.

Mudanças propostas:
- Fundo: passar para um tom slate mais claro tipo `#1e293b` (slate-800) para diferenciar visualmente das secções vizinhas
- Cards: melhorar contraste dos backgrounds — card "Certo para" com um toque verde subtil no border-top, card "Não é para" com tom mais neutro
- Adicionar um padding interno maior e border-radius mais suave para os cards
- Manter o hover com glow roxo que já existe

---

## Detalhes técnicos

### Ficheiro: `src/pages/Video.tsx`

1. **Linhas 139-146**: Substituir título, desc, bullets e deliverable do item 01 do `videoAgenda`
2. **Linha 578**: Mudar background da secção "Para quem é" de `DARK_950` para `#1e293b`
3. **Linhas 593 e 610**: Ajustar backgrounds dos cards para melhor contraste com o novo fundo — card "Certo para" com border-top verde, card "Não é para" com border-top cinza subtil

