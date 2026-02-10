
# Plano: Foto do Frederico + Pagina de Upsell Completa

## Duas tarefas distintas

---

## 1. Substituir o logo "FC" pela fotografia real

**Onde:** `src/components/landing/PresenterSection.tsx` (linha 16-18)

**O que fazer:**
- Copiar a imagem enviada para `src/assets/frederico-carvalho.jpg`
- Substituir o circulo com "FC" por uma tag `<img>` com a foto
- Dimensoes: `w-40 h-40` mobile / `w-[200px] h-[200px]` desktop (manter as actuais)
- Aplicar `object-cover` + `rounded-full` para recortar em circulo
- Manter o border azul existente (`border-[3px] border-blue-100`)
- Adicionar `loading="lazy"` e `alt="Frederico Carvalho"` para boas praticas

---

## 2. Reconstruir a pagina de Upsell (`/upgrade`) completa

A pagina actual e uma versao basica com formulario de email + 3 cartoes simples. O prompt descreve uma pagina muito mais detalhada e estruturada.

**Ficheiro:** `src/pages/Upsell.tsx` -- reescrita completa

### Estrutura da nova pagina:

**[1] Barra de confirmacao (sticky top)**
- Fundo verde claro, icone check, "Premium Pass reservado"
- Barra de progresso 60% verde (Passo 2 de 3)

**[2] Hero curto**
- Label "ENQUANTO CONFIRMAS O ACESSO"
- H1: "Queres ir mais fundo?"
- Paragrafo explicativo + nota sobre IVA

**[3] Bloco "Ja tens"**
- Card com icone estrela, mostrando o Premium Pass ja incluido (€15)
- Gravacao, Q&A, Guia, Early access

**[4] Tres cartoes de decisao**
- **Cartao Saltar** (Opcao A) -- "+€0, Total €15", botao subtil, tom mais apagado
- **Cartao Masterclass** (Opcao B, destaque) -- "+€37, Total €52", badge "MAIS POPULAR", border azul, detalhes do evento, lista de 6 items, botao azul primario
- **Cartao Workshop** (Opcao C) -- "+€497, Total €512", badge "PRESENCIAL", border-top amber, lista de 6 items, link bundle ("Quer os dois? €524, poupa €25")

**[4b] Mini-modal Bundle**
- Overlay com resumo de precos (Premium + Masterclass + Workshop = €549 - €25 = €524)
- Botao "Confirmar bundle -- €524"

**[5] Resumo flutuante (desktop only)**
- Sticky bottom, mostra pedido actual + total dinamico + botao confirmar
- Cor do botao muda conforme seleccao (verde se so Premium, azul se upgrade)

**[6] CTA fixo mobile**
- Aparece apos seleccionar um cartao
- Full-width, fixed bottom, "Confirmar -- €XX"

**[7] Micro rodape**
- Garantias (pagamento seguro, RGPD, reembolso 14 dias)
- Email de contacto

### Comportamento interactivo:
- `useState` para `selectedOption`: null | 'skip' | 'masterclass' | 'workshop' | 'bundle'
- Seleccao visual nos cartoes (border azul no seleccionado)
- Total dinamico que actualiza conforme seleccao
- Ao confirmar: chama edge function `create-payment` com o plano escolhido
- Animacoes staggered na entrada (fade + translateY por cartao)

### Responsividade:
- Mobile: cartoes em stack vertical (Masterclass primeiro, depois Workshop, depois Saltar)
- Desktop: grid 3 colunas (Saltar, Masterclass centro com scale, Workshop)
- Resumo flutuante so em desktop (lg+)
- CTA fixo so em mobile

### Integracao com pagamento:
- Mantém a chamada a `supabase.functions.invoke("create-payment")` ja existente
- Mapeia seleccao para plan key: skip→premium, masterclass→masterclass, workshop→workshop, bundle→bundle

---

## Ficheiros afectados

| Ficheiro | Accao |
|----------|-------|
| `src/assets/frederico-carvalho.jpg` | Criar (copiar imagem enviada) |
| `src/components/landing/PresenterSection.tsx` | Alterar -- substituir "FC" por `<img>` |
| `src/pages/Upsell.tsx` | Reescrever -- pagina completa conforme prompt |

Nenhuma dependencia nova necessaria. A landing page (homepage) nao e alterada excepto a foto na seccao do apresentador.
