

## Upgrade do WhatsApp Button para Widget com Popup

### O que muda

O botao actual abre directamente o WhatsApp num clique. A nova versao transforma-o num widget completo com popup estilo "chat teaser", oferecendo opcoes de contacto mais especificas e uma experiencia mais profissional.

### Comportamento do novo widget

```text
Estado fechado:                    Estado aberto (popup):
                                   +----------------------------------+
                                   |  (x)  Suporte no WhatsApp        |
                                   |                                  |
                                   |  Normalmente responde em         |
                                   |  poucos minutos.                 |
                                   |  Horario: 09:00-18:00            |
                                   |  (dias uteis)                    |
                                   |                                  |
                                   |  [Iniciar conversa]       (azul) |
                                   |                                  |
                                   |  Duvida sobre inscricao     (>)  |
                                   |  Problema tecnico no acesso  (>) |
                                   +----------------------------------+
  [WA icon]  (bottom-right)                              [WA icon] (x)
```

- Clicar no botao verde abre/fecha o popup
- ESC fecha o popup
- Clicar fora do popup fecha-o
- Cada CTA abre o WhatsApp com uma mensagem diferente:
  - "Iniciar conversa": mensagem generica actual
  - "Duvida sobre inscricao": "Ola! Tenho uma duvida sobre a inscricao. Podem ajudar-me?"
  - "Problema tecnico no acesso": "Ola! Estou com um problema tecnico no acesso. Podem ajudar-me?"

### Ficheiros a alterar

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/WhatsAppSupportButton.tsx` | Reescrever completamente: adicionar estado open/closed, popup card com animacao fade+slide, 3 CTAs com mensagens diferentes, click-outside e ESC para fechar |

Nenhum outro ficheiro e tocado. O import em `Index.tsx` permanece igual.

### Detalhe tecnico

- Estado `isOpen` (boolean) controla visibilidade do popup
- `useRef` + `useEffect` com event listener para fechar ao clicar fora
- `useEffect` com keydown listener para ESC
- Popup usa componentes existentes: `Card` (shadcn) para o container
- Animacao: Tailwind classes condicionais com `animate-fade-in` / opacity+translate transition
- Mobile: popup com `max-w-[calc(100vw-3rem)]` e `w-80` para nao cobrir toda a largura
- O botao verde muda o icone para X quando aberto (transicao suave)
- `aria-expanded`, `aria-label` e `role` adequados para acessibilidade
- Analytics: `console.log` diferenciado por tipo de clique ("whatsapp_general", "whatsapp_inscricao", "whatsapp_tecnico")

