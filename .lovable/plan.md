
## Integração do `add-to-calendar-button` no Fluxo de Webinar

### Contexto Atual
O código utiliza um sistema manual de calendário com:
1. **Em `/upgrade` (StepConfirmation.tsx)**: Um `Popover` com links para Google Calendar e um botão para descarregar .ics para Apple Calendar
2. **Em `/live` (WebinarLive.tsx)**: Um `Popover` similar com as mesmas opções

O package `add-to-calendar-button` não está actualmente instalado, mas pode ser instalado via npm/yarn.

### Solução Proposta

#### 1. **Instalar o package**
```
add-to-calendar-button
```
Verificar a documentação oficial do package para a versão mais estável.

#### 2. **Criar um novo componente wrapper**
Criar `src/components/webinar/AddToCalendarButton.tsx` que:
- Importa `add-to-calendar-button` (Web Component)
- Recebe props do `WEBINAR_CONFIG` 
- Renderiza o componente com as props exactas que o utilizador especificou:
  - `name`: "Webinar ao vivo — Cria Imagens Profissionais com IA"
  - `description`: descrição detalhada do evento
  - `startDate`, `startTime`, `endDate`, `endTime`: "2026-02-18", "10:00", "2026-02-18", "11:15"
  - `timeZone`: "Europe/Lisbon"
  - `location`: "Online"
  - `organizer`: "Frederico Carvalho|fredericodigital@gmail.com"
  - `options`: Apple, Google, Outlook.com, Microsoft365
  - `label`: "Adicionar ao calendário"
  - `language`: "pt"

#### 3. **Atualizar webinarConfig.ts**
Adicionar campos para os detalhes do calendário:
```typescript
calendarEvent: {
  name: "Webinar ao vivo — Cria Imagens Profissionais com IA",
  description: "Aprender um método prático para transformar um briefing simples em imagens prontas a publicar, com consistência visual e controlo do resultado. - Quarta-feira, 18 Fev 2026",
  startTime: "10:00",
  endTime: "11:15",
  timeZone: "Europe/Lisbon",
  location: "Online",
  organizer: "Frederico Carvalho|fredericodigital@gmail.com",
}
```

#### 4. **Substituir Popover em StepConfirmation.tsx**
- Remover o `<Popover>` com as opções manuais (linhas 73-97)
- Substituir por um único botão que renderiza o novo `AddToCalendarButton`
- Manter o mesmo styling (w-full, py-3, rounded-xl, etc.)

#### 5. **Substituir Popover em WebinarVideoArea.tsx**
- Localizar o Popover com calendário (se existe)
- Substituir pela mesma abordagem com `AddToCalendarButton`

#### 6. **Simplificar o código**
- Remover a função `generateICS` em StepConfirmation.tsx (já não será necessária)
- Remover imports de `Calendar` icon se não usado em outro lugar
- Limpar imports de `Popover` se não usado em outro lugar

### Benefícios
- ✅ UX melhorada: utilizadores têm mais opções de calendário (Outlook, Microsoft 365)
- ✅ Código mais limpo: não precisa de gerir múltiplos fluxos manuais
- ✅ Consistência: mesmo botão com o mesmo comportamento em ambos os locais
- ✅ Manutenção: centralizados os dados do evento no `webinarConfig.ts`

### Ficheiros a Modificar
1. `package.json` — Instalar `add-to-calendar-button`
2. `src/components/webinar/webinarConfig.ts` — Adicionar dados do calendário
3. `src/components/webinar/AddToCalendarButton.tsx` — Criar novo componente (NEW)
4. `src/components/upgrade/StepConfirmation.tsx` — Substituir Popover
5. `src/components/webinar/WebinarVideoArea.tsx` — Verificar e substituir se necessário

### Notas Técnicas
- O `add-to-calendar-button` é um Web Component, compatível com React
- Suporta download directo para vários calendários (sem popover manual)
- A data debe estar em formato "YYYY-MM-DD"
- A hora em formato "HH:mm" (24h)
- O componente é auto-contido e responsivo

