

# Corrigir SMS e melhorar experiência de envio

## 3 problemas a resolver

### 1. SMSEasy 401 — credenciais inválidas
O secret `SMSONLINE_API_KEY` existe mas a API rejeita com erro 103 (username/password unknown). O valor do secret precisa de ser actualizado com as credenciais correctas. Vou pedir para re-introduzir o secret.

### 2. Feedback de envio mais visível
Actualmente o sucesso mostra apenas um pequeno toast. Vou adicionar um **modal/overlay de confirmação** animado com:
- Ícone de sucesso (check verde grande)
- Nome do destinatário e número
- Provider usado
- Botão "Enviar outro" ou "Fechar"

### 3. Novas funcionalidades no SmsTab

**a) Filtro por webinar (base de dados)**
Adicionar selector com 3 opções: "Imagens IA", "Vídeo IA", "Todos". Filtra os inscritos disponíveis no dropdown de pesquisa pelo campo `webinar`.

**b) Pesquisa e selecção múltipla de destinatários**
- Permitir seleccionar vários inscritos (chips/tags)
- Envio em lote: itera sobre cada destinatário e envia individualmente
- Mostrar progresso (X/Y enviados) e resultado final no modal

## Ficheiros a editar

### `src/components/crm/comunicacao/SmsTab.tsx`
- Adicionar state `webinarFilter: "imagens" | "video" | "todos"` (default "todos")
- Filtrar `inscritos` pelo `webinarFilter` antes da pesquisa
- Trocar `to`/`selectedName` (single) por array `recipients: {id, nome, phone}[]`
- UI: chips para recipients seleccionados com X para remover
- Adicionar selector de webinar (3 botões estilo toggle)
- Após envio: mostrar modal de resultado (sucesso/falha por destinatário)
- Toast substituído por modal overlay com animação

### `supabase/functions/send-sms/index.ts`
- Sem alterações de código — o problema é o valor do secret

### Secret `SMSONLINE_API_KEY`
- Pedir ao utilizador para re-introduzir o valor correcto

