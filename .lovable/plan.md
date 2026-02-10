

# Hero Section — Cards maiores e texto revisto

---

## Problemas identificados (screenshot)

1. Os 4 info cards sao demasiado pequenos e apertados — icones e texto com 13px mal se leem
2. O paragrafo descritivo ("O metodo que transforma...") parte em 3 linhas de forma pouco natural no mobile
3. Os cards parecem genericos e pouco apelativos visualmente

---

## Alteracoes

### 1. Info Cards — Maiores e mais apelativos

Aumentar os cards para serem mais visiveis e scan-friendly:

- Layout: manter `grid-cols-2 md:grid-cols-4` mas aumentar o `max-w` de `560px` para `640px`
- Padding interno: de `px-3 py-3` para `px-4 py-4`
- Icones: de `w-4 h-4` para `w-5 h-5`
- Texto: de `text-[13px]` para `text-[14px] sm:text-[15px]`
- Gap entre cards: de `gap-3` para `gap-3 md:gap-4`
- Adicionar `justify-center` para centrar conteudo dentro de cada card
- Margem inferior: manter `mb-10`

### 2. Paragrafo descritivo — Reescrever para nao partir

Texto actual (parte em 3 linhas):
"O metodo que transforma um briefing em imagem utilizavel em menos de 3 minutos. Demonstrado ao vivo, no ecra."

Novo texto (mais curto, uma frase limpa):
"De briefing a imagem profissional em menos de 3 minutos — demonstrado ao vivo."

Isto evita a quebra de linha incomoda e mantem a mesma mensagem. Aumentar `max-w` de `560px` para `600px` para dar mais respiro.

---

## Ficheiro a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/HeroSection.tsx` | Cards maiores (padding, icone, texto); paragrafo descritivo reescrito e com max-w ajustado |

Sem dependencias novas.

