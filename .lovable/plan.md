

# Agenda no formato /inicial + eyebrow testemunhos

## Resumo

2 alteracoes em `src/pages/Video.tsx`:
1. Substituir a seccao Agenda dark/cinematografica pelo formato identico ao `ProgramSection` da landing (fundo claro, cards com border-left colorido, bullets, deliverable verde, tag "AO VIVO") — adaptado para video, com 3 items e sem os numeros 001/002/003 como texto principal (manter apenas como decorativo grande)
2. Mudar eyebrow dos testemunhos de "PROVA SOCIAL" para "AVALIAÇÕES PÚBLICAS"

---

## 1. Agenda — formato ProgramSection

### Dados (3 items, adaptados para video)

```
01 — Workshop Prático: O processo mínimo (briefing + checklist) para produzir vídeo com consistência
     desc: "Estrutura simples para sair com clips prontos a publicar."
     bullets: ["Do briefing ao primeiro clip: passo a passo", "Checklist de produção para manter consistência"]
     deliverable: "Processo mínimo para produzir vídeo com qualidade."
     tag: CORE
     borderColor: border-l-blue-600

02 — Erros mais comuns que destroem consistência (e como evitar)
     desc: "Os erros que quase toda a gente comete — e como os corrigir rápido."
     bullets: ["Erros de briefing, prompt e revisão", "Ajustes simples que fazem diferença no resultado"]
     deliverable: "Checklist anti-erros para vídeo com IA."
     borderColor: border-l-[#0891B2]

03 — Q&A — Perguntas e respostas ao vivo
     desc: "Esclarecer dúvidas em tempo real, com exemplos práticos."
     bullets: ["Perguntas livres sobre ferramentas e processo", "Demonstrações a pedido dos participantes"]
     deliverable: "Respostas directas e aplicáveis ao teu contexto."
     tag: AO VIVO
     borderColor: border-l-green-600
```

### Layout
- Fundo claro (`#f8f9fa`) — igual ao ProgramSection
- Eyebrow: "AGENDA · 45 MIN" em azul
- Titulo: "O que acontece durante a sessão"
- Cards empilhados verticalmente com `space-y-6`
- Cada card: `bg-white`, `border`, `border-l-4` colorido, `rounded-r-lg`, `p-7`, `shadow-card`
- Numero grande decorativo (01, 02, 03) em roxo 15% opacity
- Titulo bold, descricao, bullets com seta azul, deliverable verde
- Tag "AO VIVO" / "CORE" como badge no canto superior direito

### Remover
- Todo o fundo dark/cinematografico (gradients, noise, radials)
- CSS custom dos `.agenda-card` e `.agenda-bar`
- Substituir array `agenda` por novo array `videoAgenda` com estrutura completa (num, title, desc, bullets, deliverable, tag, borderColor)

---

## 2. Testemunhos — eyebrow

### Alteracao
- Linha 778: mudar texto de `PROVA SOCIAL` para `AVALIAÇÕES PÚBLICAS`

---

## Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

1. **Linhas 138-142**: Substituir array `agenda` por `videoAgenda` com campos completos (num, title, desc, bullets, deliverable, tag, borderColor)
2. **Linhas 623-701**: Redesenhar seccao inteira — fundo claro, cards verticais no estilo ProgramSection, remover CSS custom
3. **Linha 778**: `PROVA SOCIAL` -> `AVALIAÇÕES PÚBLICAS`

