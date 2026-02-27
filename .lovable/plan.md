

# Reajustar confirmacao in-card no /upgrade-video

## Problema

O estado de confirmacao (step 7) actual so mostra o check verde, mensagem de email, e "Voltar ao inicio". Faltam os 3 elementos que existiam antes na pagina de confirmacao:

1. Botao "Seguir no Instagram"
2. Botao "Adicionar ao Google Calendar" 
3. Card de partilha social (LinkedIn, WhatsApp, Copiar link)

## Solucao

Adicionar o componente `ConfirmacaoExtras` (ja existente em `src/components/landing/ConfirmacaoExtras.tsx`) dentro do `renderConfirmation()` no `UpgradeVideo.tsx`.

## Alteracao unica: `src/pages/UpgradeVideo.tsx`

Na funcao `renderConfirmation()` (linhas 250-343):

1. Importar `ConfirmacaoExtras` no topo do ficheiro
2. Inserir `<ConfirmacaoExtras webinar="video" />` entre a info box verde e o resumo de compra
3. Adicionar gap adequado (24px) antes e depois do componente

O componente `ConfirmacaoExtras` ja tem toda a logica necessaria:
- Instagram link (https://www.instagram.com/frederico.m.carvalho/)
- Google Calendar link estatico para o webinar de video
- Partilha social com LinkedIn, WhatsApp e Copiar link
- Numeracao visual (1, 2, 3) com circulos

## O que NAO muda

- Nenhum outro ficheiro
- Logica de pagamento, Supabase, steps 1-5
- O componente ConfirmacaoExtras em si
- O resto do renderConfirmation (check verde, headline, info box, purchase summary, CTA)

