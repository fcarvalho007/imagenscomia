

# Reordenar fallback de email: Brevo → Resend → E-goi

## Estado actual
`send-email/index.ts` já usa Brevo como primário. O fallback actual é:
1. **Brevo** (primário) ✅
2. **E-goi** (fallback 1) ← trocar
3. **Resend** (fallback 2) ← trocar

## Alteração
Trocar a ordem dos fallbacks em `supabase/functions/send-email/index.ts`: após Brevo falhar, tentar **Resend** antes de **E-goi**.

### Linhas ~175-195 — inverter blocos
```
Brevo falhou → Resend (fallback 1) → E-goi (fallback 2)
```

## Nota importante
Há 3 edge functions que chamam o Resend directamente (sem passar pelo `send-email`):
- `eupago-webhook` (emails de pagamento)
- `send-payment-link`
- `followup-abandoned`

Estas não beneficiam do fallback. Migrar para usar `send-email` seria ideal mas é uma alteração maior — fora do scope deste pedido.

### Ficheiro único
- `supabase/functions/send-email/index.ts`

