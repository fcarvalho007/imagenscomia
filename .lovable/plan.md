

# Correcoes pendentes — pagina /video

## Resumo

Corrigir horarios inconsistentes (21h -> 10h) em 4 locais, e uniformizar borders nas seccoes dark.

---

## 1. Horario 21h -> 10h (4 correcoes)

### Ficheiro: `src/pages/Video.tsx`

- **Linha 174**: `new Date("2026-03-03T21:00:00")` -> `new Date("2026-03-03T10:00:00")`
- **Linha 197**: `AO VIVO · 3 MAR · 21H00` -> `AO VIVO · 3 MAR · 10H00`
- **Linha 819**: `às 21h` -> `às 10h`
- **Linha 846**: `Terça-feira, 3 de Março, 21h` -> `Terça-feira, 3 de Março, 10h`

## 2. Consistencia de borders nas seccoes dark

Uniformizar para `rgba(255,255,255,0.08)` nas seccoes escuras:

- **Linha 465** (pain-card): `rgba(255,255,255,0.10)` -> `rgba(255,255,255,0.08)`
- **Linha 572** (audience-card-yes): `rgba(255,255,255,0.12)` -> `rgba(255,255,255,0.10)` (manter ligeiramente mais visivel por ser o card "positivo")
- **Linha 644** (agenda-card): `rgba(255,255,255,0.06)` -> `rgba(255,255,255,0.08)`

---

## Detalhes tecnicos

Todas as alteracoes sao no ficheiro `src/pages/Video.tsx`. Sao 7 edicoes pontuais de texto/valores, sem alteracao de estrutura.

