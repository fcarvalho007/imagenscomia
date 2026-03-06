

# Redesign dos emails pós-webinar Day 1 e Day 3

## Problemas actuais

1. **Design básico** — fundo branco simples, sem header Navy-Indigo usado nos emails de recursos
2. **Preço Early Bird €15 referenciado** no `send-video-postwebinar` (já enviado) — os Day 1 e Day 3 já têm €27, mas mantêm estilo diferente
3. **Conteúdo "o que levas contigo"** desactualizado — falta o ficheiro GEM pronto a usar, o áudio da sessão, e a descrição correta dos itens conforme os emails de recursos
4. **Copy genérica** — pouco persuasiva comparada com o nível dos emails de recursos

## O que vou alterar

### Ficheiro 1: `supabase/functions/send-video-postwebinar-day1/index.ts`

**Novo design do fallback HTML:**
- Header Navy-Indigo gradient (`#1e1b4b → #312e81 → #4338ca`) com título
- Corpo com a mesma estrutura `wrapper()` / `resourceItem()` dos emails de recursos
- Copy reescrita: tom pessoal, referência à sessão que decorreu, valor concreto do que inclui
- Box Premium Pass com os 5 itens correctos (Sessão prática 70min, Workbook PDF, Guia GEMs, Ficheiro GEM, Áudio)
- Box Masterclass com detalhes (12 Mar, 10h-13h, 3 horas, gravação incluída)
- Footer com WhatsApp + assinatura Frederico
- Botões em `#4338ca` (indigo) para Premium, `#16a34a` (verde) para Masterclass
- Sem referência a early bird ou €15

**Subject actualizado:** `"A sessão de ontem — e como rever tudo, {{fname}}"`

### Ficheiro 2: `supabase/functions/send-video-postwebinar-day3/index.ts`

**Mesmo redesign visual** mas com copy de fecho:
- Tom de "última oportunidade" mas sem pressão excessiva
- Resumo compacto do Premium Pass (mesmos 5 itens)
- Secção Masterclass mantida
- Subject: `"Último email sobre o Premium Pass, {{fname}}"`

### Conteúdo actualizado do Premium Pass (ambos emails)

| Item | Descrição |
|------|-----------|
| 🎬 Sessão prática completa | 70 minutos, sem cortes |
| 📘 Workbook PDF | Estrutura, exercícios e checklist |
| 💎 Guia de GEMs | Passo-a-passo para criar GEMs de vídeo |
| ⚡ Ficheiro GEM pronto a usar | Importa directamente para o Gemini |
| 🎧 Áudio da sessão | Ouve em qualquer lugar |

### Masterclass (ambos emails)

- 📅 Quinta-feira, 12 de Março · 10h00–13h00
- 3 horas ao vivo · gravação incluída
- €47+IVA

## Sem alterações na lógica de envio

A lógica de filtragem, deduplicação e logging mantém-se intacta em ambos os ficheiros. Apenas o `buildFallbackHtml()` e o subject default são alterados.

