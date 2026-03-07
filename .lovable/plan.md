
## Ajustar email de solicitação de NIF — assinado por Frederico Carvalho

### Estado actual
O template em `supabase/functions/send-invoice-request/index.ts` (linhas 90-117) contém:
- Assunto: "{{fname}}, precisamos dos **teus** dados de faturação" (usa "tu")
- Corpo: refere "formação do Frederico Carvalho" e "Se **tiveres** dúvidas" (usa "tu")
- Sem assinatura clara de Frederico

### Novo template proposto
**Assunto:** `{{fname}}, dados de faturação para a formação`

**Corpo:**

```
Olá {{fname}} 👋

Obrigado por teres participado na minha formação!

Num primeiro momento, o meu sistema não pediu automaticamente os dados de faturação a um pequeno grupo de participantes — e foste um deles. Peço desculpa pelo incómodo.

Para que eu possa emitir a fatura, preciso apenas que preenchas um formulário rápido — demora menos de 1 minuto:

[Preencher dados de faturação →]

Dados necessários: Nome ou Empresa, NIF, Morada, Código Postal, Localidade e Email de faturação.

Assim que preencheres, a fatura é emitida e enviada automaticamente.

Obrigado pela compreensão!

Frederico Carvalho

---
Se tiver dúvidas, responda directamente a este email.
```

### Mudanças
- **Assunto:** Neutro, sem "teus"
- **Tom:** Pessoal de Frederico para aluno (1ª pessoa singular "minha formação", "meu sistema")
- **Reconhecimento:** Explica o problema técnico inicial
- **Assinatura:** Claro "Frederico Carvalho" no final
- **Contacto:** "Se tiver dúvidas" (neutro)

### Ficheiro a alterar
- `supabase/functions/send-invoice-request/index.ts` (linhas 90-117) — substituir template HTML
