

## Melhorias na Ficha de Cliente: Gmail, Layout e Logica do Funil

### 1. Botao "Enviar via Gmail" com assunto e corpo pre-preenchidos

No bloco do email gerado (`InscritoModal.tsx`, linhas 453-469), adicionar um botao com icone do Gmail que abre directamente o compose do Gmail com:
- Remetente: `info@fredericocarvalho.pt` (via parametro URL `from=` - nota: o Gmail ignora este parametro por seguranca, mas abre com a conta activa)
- Destinatario: email do inscrito
- Assunto pre-preenchido
- Corpo pre-preenchido

O link sera um `mailto:` convertido para URL do Gmail:
```
https://mail.google.com/mail/?view=cm&fs=1&to={email}&su={subject}&body={body}
```

Isto abre o Gmail web com tudo preenchido, so falta clicar "Enviar".

### 2. Melhorias de UX/Layout no bloco de email

Ficheiro: `src/components/crm/InscritoModal.tsx`

Alteracoes:
- Mover o botao "Enviar via Gmail" para destaque principal (botao verde/azul com icone)
- Manter "Copiar tudo" como accao secundaria
- Melhorar a hierarquia visual: assunto com fundo separado, corpo com melhor padding
- Links de accao (abrir link, gerar novo) mais claros

### 3. Corrigir logica do Funil para planos bundle

Ficheiro: `src/components/crm/FunnelView.tsx`

**Bug actual**: Quando o inscrito seleccionou "bundle" mas nao pagou e nao tem `upgrade_clicked_at`, os passos Premium e Masterclass mostram "Saltou / Nao converteu", mesmo que o inscrito tenha seleccionado bundle e concluido o flow (passo 5).

**Correccao**: Na logica dos passos Premium (linha 69-96) e Masterclass (linha 99-126):
- Adicionar verificacao de `plan_selected` (alem de `upgrade_clicked_at`)
- Se `plan_selected` inclui o tier (ou e "bundle"), mostrar como "interested" com detalhe "Seleccionou plano"
- Se pagou, mostrar como "completed"
- So mostrar "Nao converteu" se realmente nao seleccionou nenhum plano que inclua esse tier

Logica corrigida:
```
paid = paid_at existe E plano inclui tier
clicked = upgrade_clicked_at existe E plan_selected inclui tier  
selected = plan_selected inclui tier (mesmo sem click)

Se paid -> "completed"
Se clicked -> "interested" + "Clicou para pagar"
Se selected -> "interested" + "Seleccionou plano"
Senao -> "skipped" + "Nao converteu"
```

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/InscritoModal.tsx` | Botao Gmail com pre-fill, layout melhorado do email |
| `src/components/crm/FunnelView.tsx` | Corrigir logica para reconhecer `plan_selected` como interesse |

