

## Correcoes ao Hero Section

### Ficheiro unico afectado

`src/components/landing/HeroSection.tsx`

---

### 1. Barra branca no topo

A barra branca visivel entre a StickyTopBar e o hero e causada pelo `pt-[52px]` no `<main>` em Index.tsx — o fundo branco da pagina fica exposto nesse espaco.

**Solucao:** Adicionar `margin-top: -52px` e `padding-top: 52px` na section do hero para que o fundo escuro do hero cubra esse espaco. Isto elimina a barra branca sem alterar o layout.

Alternativa (mais simples): mudar no Index.tsx o `pt-[52px]` para zero e adicionar o padding ao hero. Mas como a instrucao e so tocar no hero, a abordagem do margin negativo e preferivel.

### 2. Titulo em 2 linhas (nao 3)

Alterar o H1 de:
```
Aprende a Criar Imagens<br />Profissionais com<br />Inteligência Artificial
```
para:
```
Aprende a Criar Imagens<br />Profissionais com Inteligência Artificial
```

Apenas um `<br />` apos "Imagens". A segunda linha fica "Profissionais com Inteligencia Artificial". Ajustar `max-width` para `820px` para garantir que cabe numa unica linha no desktop.

### 3. Reduzir opacidade do fundo Beams

O efeito Beams esta demasiado intenso. Reduzir a opacidade do wrapper div de 100% para ~40-50%:

```text
<div className="absolute inset-0 z-0" style={{ mixBlendMode: "screen", opacity: 0.5 }}>
```

Isto mantem o efeito visual mas mais subtil e elegante.

### 4. Remover microcopy RGPD

Apagar as linhas 186-188:
```text
<p style={{ fontSize: 14, color: "rgba(255,255,255,0.30)", marginTop: 10 }}>
  Sem spam. Acesso imediato por email. Dados protegidos (RGPD).
</p>
```

### Resumo de alteracoes

| O que | Detalhe |
|---|---|
| Barra branca | `mt-[-52px] pt-[52px]` na section do hero |
| H1 2 linhas | Remover segundo `<br />`, max-width 820px |
| Opacidade Beams | `opacity: 0.5` no wrapper |
| Microcopy RGPD | Removido |

Nenhum outro ficheiro e alterado.

