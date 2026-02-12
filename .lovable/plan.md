

## Atualizar campo WhatsApp/Telemóvel no Modal

### O que muda

**Ficheiro:** `src/components/landing/RegistrationModal.tsx`

**Alteração:** Na linha 249, mudar o placeholder do campo de telefone:
- De: `placeholder="WhatsApp (opcional)"`
- Para: `placeholder="Whatsapp/Telemóvel"`

### Estrutura

O campo fica apenas com o rótulo mais descritivo, sem a indicação de "opcional" que agora está implícita:

```tsx
<input
  type="tel"
  placeholder="Whatsapp/Telemóvel"
  value={whatsapp}
  onChange={(e) => setWhatsapp(e.target.value)}
  className="..."
/>
```

