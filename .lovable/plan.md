

## Correcoes

### 1. Clarificar o CTA de inscricao em /convites

**Problema:** O texto "Ainda nao te inscreveste? Inscreve-te aqui" nao deixa claro que e sobre o webinar, nem que e obrigatorio estar registado para participar na dinamica de referrals.

**Solucao:** Reformular o texto e adicionar uma nota explicativa:
- Substituir o texto do botao por: "Ainda nao estas inscrito no webinar? Regista-te gratuitamente aqui"
- Adicionar uma nota pequena acima ou abaixo do formulario de email: "Para participar nesta dinamica de convites, precisas de estar registado no webinar."

**Ficheiro:** `src/pages/Convites.tsx` (linhas 200-205)

### 2. Erro de pagamento — EUPAGO_API_KEY invalida

**Problema:** A API key guardada nos secrets esta a ser rejeitada pela EuPago com o erro `APIKEY_INVALID`. Isto nao e um bug no codigo — a chave armazenada esta incorrecta, expirou, ou pertence a um ambiente diferente (teste vs. producao).

**O que fazer:**
1. Aceder ao backoffice da EuPago (https://clientes.eupago.pt)
2. Copiar a API Key correcta (formato: `xxxx-xxxx-xxxx-xxxx-xxxx`)
3. Confirmar que estamos a usar o ambiente correcto (producao vs. sandbox) — o endpoint no codigo aponta para `clientes.eupago.pt` que e producao
4. Dizer-me a nova chave para eu a atualizar nos secrets do projecto

**Nota:** O codigo da edge function `create-payment` esta correcto. O problema e exclusivamente a chave API.

