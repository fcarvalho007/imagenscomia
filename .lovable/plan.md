

## Sistema de Re-engagement para Pagamentos Pendentes

### Como funciona a deteccao actual

O sistema ja distingue 3 estados com base nos dados reais:

```text
Estado         | Condicao na DB
---------------|------------------------------------------
Gratuito       | plan_selected = null ou "free"
Pendente       | plan_selected != "free" E paid_at = null
Pago           | paid_at != null
```

Dentro de "Pendente", ha dois sub-estados importantes:
- **Clicou em pagar** (tem `upgrade_clicked_at` e `eupago_ref`) — ex: Sonia
- **Seleccionou plano mas nao clicou** (sem `upgrade_clicked_at`) — ex: Renato

### O que vamos implementar

#### 1. Botao "Gerar Lembrete" na ficha do inscrito (InscritoModal)

Quando o inscrito tem `payment_status === "pending"`, aparece um botao proeminente na barra de resumo que:
- Chama a edge function `create-payment` para gerar um **novo link de pagamento** na EuPago
- Abre uma caixa com o email personalizado pre-formatado, pronto a copiar e enviar
- O email inclui: nome do inscrito, plano seleccionado, valor, e o link de pagamento

#### 2. Edge function `generate-reminder` (nova)

Nova funcao backend que:
- Recebe email, plano e nome
- Chama a API EuPago para gerar um novo pay-by-link
- Retorna o link de pagamento + texto do email formatado
- Actualiza o `eupago_ref` na DB com o novo transactionID

#### 3. Alerta visual no Dashboard para pendentes com +6h

No DashboardView, adicionar um card/alerta que mostra:
- Quantos inscritos estao pendentes ha mais de 6 horas
- Lista rapida com nome e plano
- Click leva a ficha do inscrito

#### 4. Indicador de tempo na Pipeline e Tabela

Nos cards pendentes, mostrar ha quanto tempo esta pendente:
- "Ha 2h" (cinza)
- "Ha 8h" (ambar, significa que ja pode ser contactado)
- "Ha 24h+" (vermelho)

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/generate-reminder/index.ts` | Nova funcao: gera link EuPago + template email |
| `src/components/crm/InscritoModal.tsx` | Botao "Gerar Lembrete" + caixa com email pre-formatado |
| `src/components/crm/DashboardView.tsx` | Card de alerta para pendentes com mais de 6h |
| `src/components/crm/PipelineView.tsx` | Indicador de tempo desde o clique nos cards pendentes |
| `src/components/crm/TableView.tsx` | Coluna/indicador de tempo pendente |
| `supabase/config.toml` | Registo da nova funcao com verify_jwt = false |

### Template do email gerado

```text
Assunto: Lembrete — o teu [Premium Pass / Bundle] esta a espera

Ola [Primeiro Nome],

Vi que iniciaste o processo de inscricao no [nome do plano] mas o pagamento ainda nao foi concluido.

Deixo-te aqui o link para concluires:
[LINK DE PAGAMENTO]

Valor: [XX,XX] euros
Metodos disponiveis: Cartao de Credito, MB WAY, Multibanco

Se tiveres alguma duvida, responde a este email.

Frederico Carvalho
```

### Fluxo tecnico

```text
Admin clica "Gerar Lembrete" no modal
    |
    v
Frontend chama generate-reminder (email, plano, nome)
    |
    v
Edge function chama EuPago API (paybylink/create)
    |
    v
Recebe novo link de pagamento
    |
    v
Actualiza eupago_ref na DB (novo transactionID)
    |
    v
Retorna link + email formatado ao frontend
    |
    v
Frontend mostra caixa com email pronto a copiar
Admin copia e envia manualmente pelo seu email
```

### Notas

- Nao enviamos o email automaticamente (o admin copia e envia) — dá mais controlo
- Cada vez que se gera um lembrete, cria-se um novo link na EuPago (o anterior pode ter expirado)
- O `eupago_ref` e actualizado para o novo transactionID, garantindo que o webhook processa correctamente
- A EuPago nao cobra pela criacao de links, so cobra comissao quando ha pagamento

