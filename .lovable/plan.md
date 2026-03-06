

# Limpar emojis dos nodes de Automações

## Problema
Os nodes de email têm emojis decorativos (🎬, 🎓, ⭐, ⏳, 🔴) que atrapalham a leitura. A regra é simples:
- **SMS** → `📱` (manter)
- **Email** → `✉️` (padronizar)
- **Trigger** → `👤` (manter)
- **Elegíveis** → manter como está

## Alterações

**Ficheiro: `src/components/crm/AutomationFlowTab.tsx`**

Substituir `iconEmoji` nos seguintes nodes (tanto no fluxo principal como no post-event):

| Node | Emoji atual | Novo |
|------|------------|------|
| Follow-up upgrade (l.254) | ⏳ | ✉️ |
| Confirmação Premium (l.307, l.652) | 🎬 | ✉️ |
| Confirmação Masterclass (l.319, l.665) | 🎓 | ✉️ |
| Recursos Premium (l.379, l.678) | 🎬 | ✉️ |
| Recursos Masterclass (l.390, l.690) | 🎓 | ✉️ |
| Recursos Bundle (l.404, l.700+) | ⭐ | ✉️ |
| Email de fecho (l.507, l.637) | 🔴 | ✉️ |

Total: ~13 linhas alteradas, todas no mesmo ficheiro.

