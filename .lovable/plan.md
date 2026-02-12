

## Remover informacao de email no Passo 5

### Alteracao

**Ficheiro:** `src/components/upgrade/StepConfirmation.tsx`

No bloco verde do `VariantFree` (linhas 37-48), remover os dois itens:
- "Link Zoom enviado para o teu email"
- "Grupo WhatsApp do evento (link enviado por email)"

Manter apenas o primeiro item: "Webinar ao vivo — 18 Fev · 10h00"

### Sobre o E-goi

Os logs confirmam que a sincronizacao funcionou corretamente:
- Contacto ja existia no E-goi (resposta 409, contact_id: 80ca4b03dd)
- Tag `webinar_imagens_com_ia_18_fev` foi adicionada com sucesso (resposta 202)

O contacto esta na Lista 5 do E-goi. Se nao o ve, verifique:
- Se esta a ver a Lista 5 (e nao outra lista)
- Se nao tem filtros de segmento ativos que excluam o contacto
- Pesquise diretamente por `fredericodigital@gmail.com` na lista

Nao ha alteracao de codigo necessaria para o E-goi — esta a funcionar corretamente.

### Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/components/upgrade/StepConfirmation.tsx` | Remover 2 linhas sobre email/WhatsApp do bloco verde |

