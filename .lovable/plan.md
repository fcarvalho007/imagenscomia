

# SMS pré-preenchido e editável nos nodes de Automações

## Problema
Actualmente o texto SMS só aparece ao clicar "Enviar SMS agora →". O utilizador quer ver o texto sempre visível, poder editá-lo, e gravá-lo — sem ser obrigado a enviar imediatamente.

## Alterações em `src/components/crm/AutomationFlowTab.tsx`

### 1. Estado para textos SMS personalizados
No componente `Timeline`, adicionar um `useState<Record<string, string>>` (`customSmsTexts`) que guarda textos editados por `templateKey`. Inicializar vazio — quando vazio, usa o default de `smsSendConfig.smsText`.

### 2. Mostrar sempre o texto SMS no card
No `renderNodeCard`, para nodes com `channel === "sms"`, mostrar sempre:
- Uma `<textarea>` (ou `<p>` em modo leitura) com o texto actual (custom ou default)
- Um botão "Editar" (ícone lápis) que alterna para modo edição inline
- Em modo edição: textarea editável + botões "Gravar" e "Cancelar"
- "Gravar" guarda no state `customSmsTexts[key]` (persistência local — `localStorage` com chave `crm_sms_drafts`)
- Botão "Enviar SMS agora →" usa o texto gravado (ou default)

### 3. Persistência em localStorage
- Ao gravar, guardar em `localStorage("crm_sms_drafts")` como JSON `{ [templateKey]: text }`
- Ao montar o componente, carregar de localStorage para `customSmsTexts`
- Isto garante que textos editados sobrevivem a refresh

### 4. Layout do card SMS (novo)
```
┌─────────────────────────────────────────────────┐
│ 📱 SMS lembrete Q&A — 10 Mar        2 enviados │
│    30 min antes · Premium Pass       0 falhas   │
│    ┌─────────────────────────────────────┐      │
│    │ Lembrete: a sessao Q&A comeca...   │ ✏️   │
│    └─────────────────────────────────────┘      │
│    [10 MAR · 14H00]        [Enviar SMS agora →] │
└─────────────────────────────────────────────────┘
```

Em modo edição:
```
│    ┌─────────────────────────────────────┐      │
│    │ [textarea editável]                │      │
│    └─────────────────────────────────────┘      │
│    120/160              [Cancelar] [💾 Gravar]  │
│                         [Enviar SMS agora →]    │
```

### Ficheiro único
- `src/components/crm/AutomationFlowTab.tsx`

