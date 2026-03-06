

# Redesign do email de notificação de venda (invoice_notification)

## Problema actual

O email é texto plano HTML sem estrutura visual — difícil de ler rapidamente. O título não identifica o produto de imediato, e os dados de faturação não se distinguem do resto.

## Solução

Redesenhar o HTML do email no `eupago-webhook/index.ts` com:

### 1. Subject line mais claro
```
COM FATURA:  💰 Masterclass Vídeo com IA — Susana Vieira — 82,41€
SEM FATURA:  ⚠️ Masterclass Vídeo com IA — Susana Vieira — 82,41€ — SEM FATURA
```
Padrão: `{emoji} {Produto} — {Nome} — {Valor}€`

### 2. Actualizar `planLabelMap` com novos nomes
- `video-premium` → "Sessão Prática — Vídeo com IA"
- `video-masterclass` → "Masterclass — Vídeo com IA"  
- `video-bundle` → "Pack IA Completo"
- Actualizar `unitPriceMap` para reflectir preços actuais (bundle = 131,61)

### 3. Novo layout HTML do email

Template com fundo branco, max-width 600px, estrutura em blocos visuais:

**Bloco 1 — Header colorido** (fundo roxo escuro)
- Título grande: "VENDA CONFIRMADA" ou "⚠️ VENDA — SEM FATURA"
- Produto em destaque (branco, bold, 20px)
- Valor total em destaque (branco, 28px bold)

**Bloco 2 — Dados do cliente** (fundo cinza claro)
- Nome + email (link mailto)
- WhatsApp (link wa.me)
- Webinar, data de inscrição, fonte, função, equipa
- Disposição em grid 2 colunas para compactar

**Bloco 3 — Detalhes do pagamento** (fundo branco, borda)
- Produto, preço unitário, total cobrado
- Método, referência, TX ID
- Data/hora do pagamento

**Bloco 4 — Faturação** (fundo branco, borda verde se presente / borda vermelha se ausente)
- Se existe: Nome/Empresa, NIF, Morada, CP, Cidade, Email
- Se não existe: warning box vermelho "Dados de faturação não recolhidos"

**Bloco 5 — Grupo** (se aplicável)
- Lista de participantes

### 4. Ficheiro alterado

- `supabase/functions/eupago-webhook/index.ts` — linhas ~588-669: actualizar planLabelMap, unitPriceMap, subject e htmlBody

