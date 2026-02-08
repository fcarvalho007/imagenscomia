

# Redesign Visual: Melhor Leitura e Contraste

## Problema Atual
A pagina e quase toda escura com variações mínimas entre secções. Texto claro sobre fundos escuros repetidos cansa a vista e dificulta a leitura. Nao ha "respiro" visual.

## Estrategia: Secções Alternadas Dark/Light com Gradientes

A abordagem mais eficaz para leitura e ritmo visual e alternar entre fundos escuros (navy/preto) e fundos claros (branco/cinza claro), mantendo o estilo Tron nos acentos neon.

### Paleta Atualizada
- **Fundos escuros**: Navy profundo (#0a0e1a) com grelha Tron rosa/magenta sutil
- **Fundos claros**: Branco puro (#ffffff) e cinza muito claro (#f8f9fc) com texto escuro
- **Acentos**: Manter rosa/magenta neon para gradientes, CTAs e destaques
- **Texto escuro**: Navy (#0f172a) nas secções claras para contraste maximo
- **Texto claro**: Branco/cinza claro nas secções escuras

### Distribuição por Secção

| Secção | Fundo | Texto |
|--------|-------|-------|
| Hero | Dark navy + gradiente + grid Tron | Branco |
| Credibilidade | **Branco** | Navy escuro |
| Problema | Dark navy | Branco |
| Modulos | **Branco/cinza claro** | Navy escuro |
| Bonus (Kit) | Dark navy + glass gold | Branco |
| Audiencia | **Branco** | Navy escuro |
| Testemunhos | Dark navy gradient | Branco |
| Pricing | **Branco/cinza claro** | Navy escuro |
| Urgencia | Dark navy + neon glow | Branco |
| FAQ | **Branco** | Navy escuro |
| CTA Final | Dark navy gradient + neon | Branco |
| Footer | Dark navy | Cinza claro |

### Mudanças Tecnicas

**1. CSS (index.css)**
- Adicionar classe `.section-light` com fundo branco e texto navy
- Adicionar gradientes suaves para secções claras (branco para cinza muito claro)
- Grid Tron mais sutil nas secções claras (usando cinza em vez de rosa)
- Atualizar `gradient-hero` para navy mais profundo com toque azul

**2. Tailwind Config**
- Adicionar cores `navy` para texto escuro
- Adicionar classes utilitarias para secções claras

**3. Componentes (todas as secções)**
- Secções claras: fundo branco, texto navy, cards com sombra suave em vez de neon-border
- Secções escuras: manter estilo Tron atual mas com navy mais rico
- Cards nas secções claras: borda cinza suave, sombra, hover com toque rosa
- Cards nas secções escuras: manter neon-border rosa

**4. Tipografia melhorada**
- Tamanhos de texto ligeiramente maiores no body (base 17-18px)
- Mais espacamento entre linhas (leading-relaxed em todo o lado)
- Subtitulos com peso mais leve para hierarquia clara

### Resultado Esperado
Uma pagina com ritmo visual claro — secções escuras "Tron" dramáticas alternadas com secções brancas limpas e profissionais. O contraste entre dark e light cria pontos de descanso visual e melhora significativamente a leitura.
