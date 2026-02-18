
## O que vai mudar

Duas alterações simples e cirúrgicas:

### 1. `/live` — Retirar o player e mostrar aviso de fim de transmissão

Em `src/components/webinar/webinarConfig.ts`:
- Mudar `isLive: true` → `isLive: false`

Isto faz com que a lógica existente em `WebinarLive.tsx` entre no estado `isEnded`, que já tem um bloco de UI preparado.

Em `src/components/webinar/WebinarVideoArea.tsx`, melhorar o bloco `isEnded` para ficar mais informativo e incluir um botão de CTA para `/gravacao`:

```
┌─────────────────────────────────────────────┐
│  ✅  Transmissão concluída                   │
│                                             │
│  Obrigado por participar!                   │
│  A gravação HD + documentos de apoio        │
│  estão disponíveis por 27 €.               │
│                                             │
│  [Aceder à gravação →]  (link /gravacao)   │
└─────────────────────────────────────────────┘
```

O badge "EM DIRETO" no header também desaparece automaticamente quando `isLive` é falso.

### 2. `/gravacao` — A página já existe e está pronta

A página `/gravacao` já está implementada (`src/pages/Gravacao.tsx`) e já está no router (`src/App.tsx`). Não é necessário criar nada — apenas garantir que o aviso na `/live` aponta para ela.

### Ficheiros alterados
- `src/components/webinar/webinarConfig.ts` — `isLive: false`
- `src/components/webinar/WebinarVideoArea.tsx` — melhorar o bloco `isEnded` com CTA para `/gravacao`

### Técnico
A condição `isEnded` em `WebinarLive.tsx` é:
```ts
const isEnded = now > endTime && !WEBINAR_CONFIG.isLive;
```
Com `isLive: false` e sendo agora passado o horário de fim (10h + 60min = 11h00), `isEnded` será `true` e o componente renderiza o estado de "transmissão terminada".
