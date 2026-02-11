

## Integração E-goi no momento da primeira inscrição

### Contexto atual
- Quando o utilizador clica "Reservar o meu lugar" no `CaptureView`, a função `register-free` é chamada
- Os dados são guardados na BD (`registrations`)
- O utilizador é redirecionado para `/upgrade`
- E-goi ainda não está integrado

### Solução proposta

#### 1. Guardar secret EGOI_API_KEY
- Valor: `ecd755f3532e7fa23cfd618c308ce6988d1c30a0`

#### 2. Criar nova edge function `sync-egoi`
Função dedicada que:
- Recebe dados do contacto (first_name, last_name, email, cellphone)
- Envia POST para `https://api.egoiapp.com/lists/5/contacts` com:
  - `base`: first_name, last_name, email, cellphone (whatsapp)
  - `extra_field_40`: referral_code (para personalização posterior)
  - `tags`: ["webinar_imagens_com_ia_18_fev"]
- Usa header `Apikey` com o secret
- Trata erros gracefully (não bloqueia o registo se E-goi falhar)

#### 3. Atualizar `register-free/index.ts`
Após inserir com sucesso na BD:
- Chamar `sync-egoi` com os dados do novo contacto
- Passar também o `referral_code` para o campo extra #40
- Log de sucesso/erro, mas continua o fluxo normal

#### 4. Atualizar `supabase/config.toml`
- Adicionar `[functions.sync-egoi]` com `verify_jwt = false`

### Fluxo final

```
Utilizador preenche form + clica "Reservar o meu lugar"
         ↓
register-free insere na BD
         ↓
register-free chama sync-egoi
         ↓
sync-egoi envia contacto para E-goi (List 5) com tag
         ↓
E-goi recebe contacto + tag "webinar_imagens_com_ia_18_fev"
         ↓
Automações E-goi disparam (email + SMS)
         ↓
Utilizador vai para /upgrade (fluxo normal continua)
```

### Variáveis no E-goi (para você configurar os templates)

No painel E-goi, nestes templates terá disponíveis:
- `!first_name` — Frederico
- `!last_name` — Carvalho
- `!email` — frederico@email.com
- `!cellphone` — 912345678
- `!extra_field_40` — A8K2X9 (referral_code)

**Nota importante**: Os dados fixos do evento (data 18 Fevereiro, hora 10h00, links) devem ser inseridos diretamente nos templates/automações do E-goi — não vêm da BD.

### Sugestões de melhoria (para mais tarde)

1. **Segmentação por pagamento**: No futuro, quando quiser diferenciar quem pagou vs não pagou:
   - Usar um webhook do CRM ou função adicional para atualizar o contacto no E-goi com nova tag (`pagou_premium_18_fev` ou similar)
   - Ou criar automações internas no E-goi com base em delay (ex: "Se não pagou em 24h, enviar email de relembrança")

2. **Histórico de eventos**: Guardar qual webinar cada contacto se inscreveu (útil se tiver múltiplos webinars)
   - Adicionar campo extra no E-goi tipo `webinar_name` para referência futura

3. **Double-opt-in**: Se quiser confirmação de email antes de enviar automações
   - Configurar no E-goi como "status: pending" em vez de "active" na primeira inscrição

### Ficheiros a modificar

| Ficheiro | Ação |
|----------|------|
| Secret | Guardar `EGOI_API_KEY` |
| `supabase/functions/sync-egoi/index.ts` | Criar — envia contacto para E-goi com tag |
| `supabase/functions/register-free/index.ts` | Editar — chamar sync-egoi após registo bem-sucedido |
| `supabase/config.toml` | Editar — adicionar config sync-egoi |

### Detalhes técnicos

**Payload para E-goi API** (POST `/lists/5/contacts`):
```json
{
  "base": {
    "status": "active",
    "first_name": "Frederico",
    "last_name": "Carvalho",
    "email": "frederico@email.com",
    "cellphone": "351912345678"
  },
  "extra": [
    { "field_id": 40, "value": "A8K2X9" }
  ],
  "tags": ["webinar_imagens_com_ia_18_fev"]
}
```

**Headers**: `{ "Apikey": "ecd755f3532e7fa23cfd618c308ce6988d1c30a0", "Content-Type": "application/json" }`

