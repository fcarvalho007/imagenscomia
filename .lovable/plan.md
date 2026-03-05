

# Verificação e correcções para o webinar de amanhã

## 1. Email "Começa em 1 hora" — ✅ Tudo a postos

- **Template na BD** (`video_reminder_1h`): CTA aponta para `https://imagenscomia.com/live-video` ✓
- **Fallback hardcoded** na Edge Function: mesmo URL ✓
- **Cron**: configurado para disparar às 09:00 UTC (janela 08:30-09:30) ✓
- **E-goi**: domínio corrigido, envios a funcionar ✓
- **Filtro**: `webinar = 'video'` + deduplicação via `message_logs` ✓

Sem alterações necessárias.

## 2. Página `/live-video` — CTAs da sidebar a corrigir

**Problema**: Os dois botões ("Garantir Premium Pass" e "Garantir lugar na Masterclass") chamam `open("premium")` — que abre um modal de registo. A página não tem sequer um `RegistrationModalProvider`, logo o clique não faz nada. O utilizador quer que ambos naveguem para `/comprar`.

### Alteração: `src/components/webinar/VideoWebinarSidebar.tsx`

Substituir `useRegistrationModal` por `useNavigate` do React Router:

```typescript
// Remover: import { useRegistrationModal } from "@/hooks/useRegistrationModal";
// Adicionar: import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Ambos os CTAs:
onCtaClick={() => navigate("/comprar")}
```

Isto aplica-se às duas instâncias de `open("premium")` (linhas 129 e 155).

