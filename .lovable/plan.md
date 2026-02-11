

# Adicionar 3 blocos no final da pagina /confirmacao

## Resumo

Adicionar 3 blocos (Referral, Calendario, Instagram) abaixo do conteudo existente na pagina `/confirmacao`, sem alterar nada do que ja existe.

## Alteracoes

### Ficheiro: `src/pages/Confirmacao.tsx`

Dentro do `motion.div` principal, **depois** do bloco `<p>` com "Questoes? frederico@digitalfc.pt" (linha 107), adicionar:

**Bloco 1 — Referral Bonus**
- Fundo amber-50, border rgba(217,119,6,0.25), rounded-xl, p-5, mt-5
- Titulo: "Convida 2 amigos — ganha acesso ao Q&A Bonus de 25 Fev"
- Texto explicativo
- Botao "Copiar o meu link de convite" com feedback "Link copiado" durante 2s
- Usar estado `copied` (ja existe no ReferralWidget mas este bloco e independente — adicionar estado local)
- O link de referral usa `searchParams.get("ref")` ou fallback para origin

**Bloco 2 — Botao Calendario**
- mt-3, full-width, border ink-700, fundo branco
- Gera ficheiro .ics com data 18 Fev 2026 10h00-11h15

**Bloco 3 — Botao Instagram**
- mt-2.5, full-width, fundo #E1306C
- Abre link Instagram em novo separador

### Detalhes tecnicos

- Mover o `useState` para `copied` para o componente `Confirmacao` (ou adicionar um novo estado local) para o botao de copiar do bloco 1
- Os 3 blocos aparecem para **todos** os planos, nao so para o plano referral
- Nenhum conteudo existente e alterado — sao insercoes puras no final do card

