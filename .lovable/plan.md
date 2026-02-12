

## Correcao: EuPago API Key Invalid

### Diagnostico

O erro `APIKEY_INVALID` ocorre apesar de:
- O codigo estar correcto (header `Authorization: ApiKey xxx`)
- O endpoint estar correcto (`clientes.eupago.pt` para producao)
- O secret `EUPAGO_API_KEY` existir no sistema

A causa mais provavel e que o valor do secret foi guardado com formatacao incorrecta (espacos extra, quebras de linha, ou caracteres invisíveis). Isto acontece frequentemente quando se copia/cola chaves.

### Solucao

1. **Re-guardar o secret `EUPAGO_API_KEY`** com o valor exacto `1e04-056e-7941-e503-7239`, garantindo que nao ha espacos antes ou depois.

2. **Re-deploy da edge function `create-payment`** para que apanhe o valor actualizado do secret.

3. **Testar o pagamento** chamando a funcao directamente para confirmar que a EuPago aceita a chave.

### Alteracoes tecnicas

Nenhuma alteracao de codigo e necessaria. Apenas:

| Accao | Detalhe |
|---|---|
| Actualizar secret | `EUPAGO_API_KEY` = `1e04-056e-7941-e503-7239` (sem espacos) |
| Re-deploy | Edge function `create-payment` |
| Teste | Chamar `create-payment` com um plano valido e confirmar resposta 200 |

