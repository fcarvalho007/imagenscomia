
## Revisão e Melhorias para Página /convites

### Problemas Identificados

1. **Dependência `checked` em useEffect**
   - O estado `checked` previne re-execução, mas se o `email` mudar, a página não re-verifica automaticamente
   - Quando o utilizador muda de email, a lógica não responde

2. **Falta de validação de email no input**
   - O campo email aceita qualquer valor antes de enviar
   - Sem feedback visual de erro antes do submit

3. **Carregamento inicial lento**
   - Leaderboard carrega sempre em paralelo (pode demorar)
   - Não há skeleton/placeholder durante o carregamento do leaderboard

4. **Refetch manual não funciona**
   - O `onSubmit` do formulário chama `handleCheck()`, mas sem validação de email vazio
   - Nenhum feedback de sucesso/erro visual após re-verificação

5. **Copy feedback insuficiente**
   - Toast aparece mas desaparece em 2.5s rapidamente
   - Sem visual feedback no botão enquanto o texto está "Copiado!"

6. **Mobile: layout do "Como funciona" pode quebrar**
   - Com 3 ícones lado a lado em mobile pequeno (< 360px) pode ficar apertado
   - Sem wrapping ou ajuste responsivo

7. **Mensagem de data/hora incompleta**
   - `toLocaleDateString` com opções `hour` e `minute` não funciona corretamente
   - Deveria mostrar data + hora de forma clara

8. **Leaderboard sempre vazio ou com poucas entradas**
   - Se houver < 5 entradas, o layout fica vazio visualmente
   - Sem estado "Sem dados" claro

9. **WhatsApp link sem validação**
   - Se `whatsappMsg` estiver vazio ou muito longo, pode quebrar
   - Sem fallback se a função de encode falhar

10. **Estado `checked` nunca reseta**
    - Se o utilizador fechar e reabrir a página com outro email, fica preso no estado anterior
    - Dependency array em useEffect precisa ser ajustado

### Melhorias Propostas

#### A) Lógica e Estados
- **Remover `checked` e adicionar `hasSubmitted`**: Rastreia se já houve um submit, mas permite re-tentativas
- **Adicionar validação real de email**: Validação antes de enviar (pattern + .test())
- **Refetch automática**: Se o email no URL mudar, revalidar automaticamente
- **Resetar estados ao desmontar**: Limpar dados ao navegar para fora

#### B) UX e Feedback
- **Melhorar toast**: Aumentar duração para 3.5s e adicionar cor diferente por tipo (sucesso vs erro)
- **Loading states**: Adicionar skeleton/placeholders enquanto carrega leaderboard
- **Estados vazios**: Cards mostrarem estado "Carregando..." quando aplicável
- **Feedback visual**: Button "Copiar" com cor verde/check e transição suave

#### C) Responsividade Mobile
- **"Como funciona" em 2 linhas em mobile**: Em screens < 640px, mudar de 3 colunas para grid 2x2 ou stack
- **Reduzir padding em mobile**: De p-5 para p-4 em mobile para economizar espaço
- **Buttons stacked em mobile**: "Copiar link" + WhatsApp em vertical em mobile

#### D) Data/Hora
- **Usar função helper**: Criar função `formatDateTimeLocale()` que funcione corretamente em PT-PT
- **Mostrar apenas data + hora**: "12 Fev · 10:30" mais legível

#### E) Leaderboard
- **Adicionar skeleton loading**: Durante fetch, mostrar 5 linhas falsas animadas
- **Limite visual**: Mostrar "Top 10" e mensagem "Ver mais 5 participantes" se houver
- **Highlight do utilizador**: Sempre visível se estiver no ranking, com ícone 👤

#### F) Otimizações
- **Memoizar funções**: `handleCopy`, `handleCopyMsg`, `handleCheck` com `useCallback`
- **Lazy load do leaderboard**: Só carregar após 500ms da montagem para não bloquear render inicial
- **URL update automática**: Salvar no `window.history` se houver dados (para reload manter contexto)

### Ficheiros a Modificar

| Ficheiro | Alterações |
|---|---|
| `src/pages/Convites.tsx` | Refatorar lógica de estados, adicionar validação, melhorar UX, responsividade mobile, data/hora formatting, skeleton loading |

### Implementação

1. **Remover `checked`, usar `hasSubmitted`**: Permite re-verificação automática
2. **Adicionar `useCallback`**: Para evitar re-renders desnecessários
3. **Melhorar validação**: Email obrigatório + pattern before submit
4. **Mobile-first layout**: Ajustar "Como funciona" e buttons em mobile
5. **Loading states**: Skeleton para leaderboard, estado "Carregando..." para cards
6. **Data/Hora melhorada**: Função helper para formatação PT-PT
7. **Toast melhorado**: Duração 3.5s, tipos diferentes
8. **Cleanup no unmount**: useEffect com cleanup

### Detalhe Técnico

- Usar `useCallback` para `handleCheck`, `handleCopy`, `handleCopyMsg`
- Adicionar `useEffect` cleanup para resetar estados
- Adicionar skeleton component ou usar `opacity-50` com animação de pulse para loading
- Criar função helper de data/hora reutilizável: `formatInviteDate(isoDate: string): string`
- Validação de email com regex simples: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Dependency array: `[searchParams]` apenas para re-check automático
- Mobile breakpoints: `max-sm:` para < 640px

