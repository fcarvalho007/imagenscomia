

# Nova secção "Comunicação" no CRM

## Objectivo
Adicionar uma nova view `comunicacao` ao CRM sidebar, com dois modos: **Redigir Email** e **Enviar SMS**. Esta secção é independente do modal do inscrito — serve para envios manuais/avulsos.

## Estrutura

### 1. Sidebar — adicionar item "Comunicação"
- Ficheiro: `src/components/crm/CRMSidebar.tsx`
- Adicionar `"comunicacao"` ao type `CRMView`
- Novo nav item com ícone `MessageSquare` e label "Comunicação"

### 2. Novo componente `ComunicacaoView.tsx`
- Ficheiro: `src/components/crm/ComunicacaoView.tsx`
- Layout com duas tabs no topo: **Email** | **SMS**
- Background escuro consistente com o resto do CRM

#### Tab Email
- Campo "Para" (input de email ou selecção de inscritos)
- Campo "Assunto"
- Campo "Corpo" (textarea HTML)
- Botão "Enviar Email" — invoca `send-email` edge function
- Possibilidade de seleccionar destinatários da lista de inscritos (dropdown/autocomplete)

#### Tab SMS
Inspirada nos prints do SMSOnline:
- **Selector de provider** (dois cards):
  - **IMAGENSIA** — SMSEasy — remetente alfanumérico (não permite numérico)
  - **915 015 508** — E-goi — remetente numérico (não permite alfanumérico)
- **Campo "Para"**: input de número de telefone manual OU selecção de inscrito(s) com telefone
- **Campo "Mensagem"**: textarea com contador de caracteres (0/160, 1 SMS)
- **Referência do envio** (opcional, para logging)
- Botão "Enviar SMS" — invoca `send-sms` edge function existente
- Nota visual a indicar as restrições de cada provider (alfanumérico vs numérico)

### 3. Routing no CRM.tsx
- Ficheiro: `src/pages/CRM.tsx`
- Importar `ComunicacaoView`
- Renderizar quando `activeView === "comunicacao"`
- Passar `inscritos` (filtrados por webinar) para permitir selecção de destinatários

### 4. Reutilização
- A lógica de envio SMS reutiliza a edge function `send-sms` existente (sem alterações)
- A lógica de envio email reutiliza `send-email` existente
- O componente `SmsComposer` do modal serve de base mas a versão na Comunicação terá tema claro e suporte para selecção de contactos

## Detalhes técnicos
- O `CRMView` type passa de `"dashboard" | "pipeline" | "tabela" | "templates" | "lixo"` para incluir `"comunicacao"`
- Nenhuma alteração de base de dados necessária — usa as edge functions e tabelas de logs existentes
- Autenticação mantém o padrão `x-crm-admin-email` via sessionStorage

