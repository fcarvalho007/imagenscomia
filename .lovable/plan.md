

## 1. Telefone obrigatorio no modal de registo

### Ficheiro: `src/components/landing/RegistrationModal.tsx`

Na funcao `handleCapture` (linha 36), adicionar validacao do campo WhatsApp apos a validacao do email:

```text
if (!whatsapp.trim()) {
  setError("Indique o seu WhatsApp ou telemovel para melhorar a experiencia.");
  return;
}
```

Tambem atualizar o placeholder do campo para indicar que e obrigatorio — remover a opcionalidade implicita. Pode-se adicionar um asterisco ou simplesmente manter o mesmo texto actual ("Whatsapp/Telemovel") dado que todos os campos visiveis serao obrigatorios.

### 2. Espacamento

Analisei o screenshot e o espacamento actual do Hero em desktop parece equilibrado — o `mb-6 lg:mb-10` entre os badges e o CTA ja foi aplicado na alteracao anterior. Nao identifico problemas adicionais de espacamento a corrigir.

---

### Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/RegistrationModal.tsx` | Adicionar validacao obrigatoria do campo `whatsapp` em `handleCapture` (inserir entre validacao de email e validacao de termos) |

