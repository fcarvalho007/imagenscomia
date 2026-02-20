

# Agenda — remover Q&A e alinhar com formato /inicial

## Resumo

2 alteracoes em `src/pages/Video.tsx`:
1. Remover o 3.o item da agenda (Q&A) — ficam apenas 2 blocos
2. Alinhar completamente com o formato do `ProgramSection` da landing: todos os cards com tag "AO VIVO" (sem "CORE"), subtitulo e CTA iguais

---

## 1. Array `videoAgenda` — passa a ter 2 items

```
01 — Workshop Prático: O processo mínimo (briefing + checklist) para produzir vídeo com consistência
     desc: "Estrutura simples para sair com clips prontos a publicar."
     bullets: ["Do briefing ao primeiro clip: passo a passo", "Checklist de produção para manter consistência"]
     deliverable: "Processo mínimo para produzir vídeo com qualidade."
     borderColor: border-l-blue-600

02 — Erros mais comuns que destroem consistência (e como evitar)
     desc: "Os erros que quase toda a gente comete — e como os corrigir rápido."
     bullets: ["Erros de briefing, prompt e revisão", "Ajustes simples que fazem diferença no resultado"]
     deliverable: "Checklist anti-erros para vídeo com IA."
     borderColor: border-l-[#0891B2]
```

Item Q&A removido por completo.

## 2. Alinhar layout com ProgramSection

Usar exactamente o mesmo formato do `ProgramSection`:
- Todos os cards mostram badge "AO VIVO" (sem logica condicional de tag)
- Eyebrow: "AGENDA · 45 MIN"
- Titulo: "O que acontece durante a sessão"
- Subtitulo: "2 blocos práticos. Demos ao vivo. Resultados no dia seguinte."
- Adicionar CTA no fundo igual ao ProgramSection (botao "Sim, quero inscrever-me grátis!")

---

## Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

1. **Linhas 138-165**: Remover 3.o item do array `videoAgenda`, remover campo `tag` de todos os items (ja nao e necessario)
2. **Linha 657**: Actualizar subtitulo para "2 blocos práticos..."
3. **Linhas 670-674**: Remover logica condicional do tag — todos mostram "AO VIVO" fixo (como no ProgramSection)
4. **Apos linha 693**: Adicionar CTA com botao identico ao ProgramSection

