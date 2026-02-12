

## Analise e correcoes — 4 pontos

### Ponto 1: Pagina fica offline ao publicar

Isto e um comportamento normal da plataforma Lovable durante o processo de deploy. Enquanto a nova versao esta a ser carregada, ha um breve periodo em que aparece a mensagem "Publish or update your Lovable project". Nao e um bug nem algo que se possa corrigir no codigo — e uma limitacao do processo de deploy actual. Normalmente dura apenas alguns segundos.

**Accao:** Nenhuma alteracao de codigo necessaria. Publicar em momentos de menor trafego.

---

### Ponto 2: Inscricoes nao aparecem no CRM

**Causa identificada:** A tabela `registrations` tem Row Level Security (RLS) activada mas nao tem nenhuma politica definida. Isto significa que:
- **Escrita funciona** (a edge function `register-free` usa a service role key, que ignora RLS)
- **Leitura do CRM falha** (o hook `useInscritos` usa o cliente normal com a anon key, que e bloqueado pelo RLS)

Confirmei que existem 5 registos na base de dados, mas o CRM recebe uma lista vazia `[]`.

**Solucao:** Adicionar uma politica RLS que permite leitura publica (SELECT) na tabela `registrations`. Os dados desta tabela (nomes, emails) ja sao acedidos pelo CRM que e protegido por autenticacao no frontend.

```sql
CREATE POLICY "allow_anon_select" ON public.registrations
  FOR SELECT USING (true);
```

---

### Ponto 3: Integracao E-goi

**Analise do codigo:** O fluxo esta correctamente implementado:
1. Utilizador preenche o modal de registo
2. A edge function `register-free` insere na base de dados
3. Imediatamente apos, chama `sync-egoi` (non-blocking)
4. `sync-egoi` envia o contacto para a Lista 5 do E-goi com a tag `webinar_imagens_com_ia_18_fev`

O codigo esta correcto e deve funcionar. Se houver duvida, posso testar a edge function directamente para confirmar que o E-goi recebe os dados.

**Accao:** Nenhuma alteracao necessaria. Posso testar para confirmar se quiser.

---

### Ponto 4: Pagamento continua com erro APIKEY_INVALID

**Causa:** A chave `EUPAGO_API_KEY` guardada nos secrets continua invalida. O erro vem directamente da EuPago: `"API Key is invalid"`. O codigo esta correcto — e exclusivamente um problema com a credencial.

**O que fazer:**
1. Entrar no backoffice da EuPago (https://clientes.eupago.pt)
2. Ir a Configuracoes > API Keys
3. Copiar a chave correcta (formato: `xxxx-xxxx-xxxx-xxxx-xxxx`)
4. Confirmar que e a chave de **producao** (nao sandbox)
5. Partilhar a chave para eu a actualizar

**Nota sobre vendas no CRM:** Quando o pagamento funcionar, as vendas feitas em /live ja serao visíveis no CRM porque o webhook `eupago-webhook` actualiza `paid_at` e `eupago_ref` na tabela `registrations`, e o CRM le dessa mesma tabela. Porem, o `PurchaseModal` em /live regista o nome e email antes de redirecionar para pagamento, mas **nao cria um registo na tabela `registrations`** — apenas chama `create-payment`. Isto significa que vendas feitas por pessoas que nao passaram pelo funil de registo nao aparecerao no CRM. Para resolver, o `PurchaseModal` deveria tambem inserir o registo na base de dados (via `register-free`) antes de criar o pagamento.

---

### Resumo de accoes

| # | Accao | Ficheiro |
|---|-------|----------|
| 1 | Nenhuma (comportamento da plataforma) | — |
| 2 | Adicionar politica RLS SELECT na tabela `registrations` | Migracao SQL |
| 3 | Nenhuma (ja esta implementado) | — |
| 4a | Utilizador fornecer nova EUPAGO_API_KEY | Secret |
| 4b | PurchaseModal em /live: chamar `register-free` antes de `create-payment` | `src/components/webinar/PurchaseModal.tsx` |

