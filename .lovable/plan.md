

# Revisão da página /video — remover "gravação" e corrigir duração

## Problema
A página /video usa repetidamente a palavra "gravação", o que a faz parecer um produto secundário em vez de um produto único e autónomo. A duração está errada (45 min em vez de 70 min).

## Alterações no ficheiro `src/pages/Video.tsx`

### Duração: 45 → 70 min
- **Linha 171**: `packItems` — `"~45 min de sessão prática, sem cortes."` → `"~70 min de sessão prática, sem cortes."`
- **Linha 352**: Info box hero — `"~45 min"` → `"~70 min"`
- **Linha 566**: Agenda subtitle — `"CONTEÚDO DA SESSÃO · ~45 MIN"` → `"CONTEÚDO DA SESSÃO · ~70 MIN"`

### Substituir "gravação" por linguagem de produto
- **Linha 187**: Meta title — `"Gravação — Cria Vídeo..."` → `"Cria Vídeo Profissional com IA | Sessão Completa"`
- **Linha 188**: Meta description — `"Acede à gravação completa..."` → `"Sessão completa de vídeo com IA + pack de apoio."`
- **Linha 228**: Sticky bar — `"GRAVAÇÃO DISPONÍVEL"` → `"ACESSO DISPONÍVEL"`
- **Linha 293**: Hero badge — `"GRAVAÇÃO DISPONÍVEL"` → `"ACESSO DISPONÍVEL"`
- **Linha 338**: Subtitle — `"acede agora à gravação completa + pack de apoio"` → `"acede agora à sessão completa + pack de apoio"`
- **Linha 351**: Info box — `"Gravação HD"` → `"Sessão HD"`
- **Linha 171**: Pack item title — `"Gravação completa em HD"` → `"Sessão completa em HD"`
- **Linha 569**: Agenda heading — `"O que está incluído na gravação"` → `"O que está incluído na sessão"`
- **Linha 813**: Final CTA title — `"Acede à gravação completa"` → `"Acede à sessão completa"`
- **Linha 816**: Final CTA subtitle — `"Gravação HD + guia..."` → `"Sessão HD + guia..."`
- **Linha 850**: RegistrationModalProvider subtitle — `"Gravação — Vídeo com IA"` → `"Sessão — Vídeo com IA"`

### FAQs
- **Linha 165**: `"Posso ver a gravação quando quiser?"` → `"Posso ver a sessão quando quiser?"` e resposta: `"gravação completa"` → `"sessão completa"`
- **Linha 166**: `"Além da gravação"` → `"Além da sessão"`

### Ficheiro único
- `src/pages/Video.tsx` — todas as alterações acima

