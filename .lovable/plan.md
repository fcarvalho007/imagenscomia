
Vou verificar e corrigir o estado da página `/live` para garantir que o player do YouTube está visível e funcional durante o horário do webinar.

### Análise do Problema
O código atual na página `/live` tem uma lacuna lógica:
- `isLive` é definido como verdadeiro apenas nos 30 minutos *anteriores* ao início (`isNearStart`).
- Assim que o relógio bate as 10:00 (hora de início), `isNearStart` torna-se falso.
- Se `WEBINAR_CONFIG.isLive` estiver como `false` no ficheiro de configuração, o player do YouTube **desaparece** e volta a mostrar a contagem decrescente (ou fica num estado inconsistente) logo no momento em que o webinar deveria começar.

### Alterações Planeadas

#### 1. Corrigir Lógica de Visibilidade (`src/pages/WebinarLive.tsx`)
Vou atualizar a definição de `isLive` para garantir que o vídeo permanece visível:
- Durante os 30 minutos de antecipação.
- Durante toda a duração do webinar (enquanto não tiver terminado).
- Sempre que for forçado via configuração.

A nova lógica será:
```tsx
const isDuringWebinar = now >= WEBINAR_CONFIG.startDate && !isEnded;
const isLive = WEBINAR_CONFIG.isLive || isNearStart || isDuringWebinar;
```

#### 2. Forçar Estado Live na Configuração (`src/components/webinar/webinarConfig.ts`)
Como hoje é o dia do evento (18 de Fevereiro), vou alterar `isLive: false` para `isLive: true`. Isto garante que, independentemente de ligeiras variações nos relógios dos utilizadores ou do servidor, o player do YouTube estará sempre ativo e pronto para a transmissão.

#### 3. Verificação de Conteúdo
Vou confirmar que o ID do YouTube (`hYsTZA9bcPA`) está corretamente injetado no componente `WebinarVideoArea`.

---

### Detalhes Técnicos

**Ficheiro: src/pages/WebinarLive.tsx**
- Ajustar as constantes de estado temporal para incluir o período de "em curso".

**Ficheiro: src/components/webinar/webinarConfig.ts**
- Atualizar `isLive` para `true`.

Estas mudanças asseguram que qualquer pessoa que entre na página agora verá o player do YouTube em vez da contagem decrescente.

