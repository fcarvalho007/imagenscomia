

# 3 Alterações: Redirect com modal, entrada directa, e perguntas obrigatórias

---

## 1. Botão "Inscrever-me agora" em /live-video — redirecionar para /video com aviso

### Situação actual
Quando o email não é encontrado no `LiveVideoGate`, o botão "Inscrever-me agora" chama `onRequestRegister` que abre o `RegistrationModal` directamente na página `/live-video`.

### Alteração
Em vez de abrir o modal de registo inline, mostrar um **pequeno modal/dialog de aviso** que diz algo como "Vais ser encaminhado para a página de inscrição" com um botão "Continuar" que faz `navigate("/video")`.

**Ficheiro:** `src/components/webinar/LiveVideoGate.tsx`
- Adicionar estado `showRedirectModal` 
- Quando o utilizador clica "Inscrever-me agora", em vez de chamar `onRequestRegister`, activa o modal interno
- O modal mostra uma mensagem curta + botão que faz `window.location.href = "/video"`

**Ficheiro:** `src/pages/WebinarLiveVideo.tsx`
- Remover a dependência do `RegistrationModal` e `RegistrationModalProvider` (já não são necessários nesta página pois o registo acontece em `/video`)

---

## 2. Entrada directa para utilizadores já registados

### Situação actual
O `LiveVideoGate` já verifica o `localStorage` (`live_video_email`) no mount. Se o email está guardado e é válido na DB, o utilizador entra directamente. Isto **já funciona**.

O que falta é garantir que quando o utilizador entra com o email no formulário do gate e é verificado com sucesso, o email fica em `localStorage` para as próximas visitas — isto **também já funciona** (linha 58 do LiveVideoGate).

**Nenhuma alteração necessária** — o fluxo actual já faz exactamente isto. Se o utilizador já entrou uma vez, na próxima visita entra directo sem modal.

---

## 3. Perguntas obrigatórias no Step 1 do /upgrade-video

### Situação actual
O `StepQualification` no `/upgrade-video` tem:
- "Como soubeste desta formação?" — marcado como opcional, permite skip
- "Qual é o teu papel principal?" — sem validação
- "Quantas pessoas..." — sem validação
- Botão "Saltar esta pergunta" que permite avançar sem preencher nada

Além disso, se o utilizador já preencheu o passo 1 e volta à página, os dados não são recuperados da DB — começa tudo do zero.

### Alterações

**Ficheiro:** `src/components/upgrade/StepQualification.tsx`
- Remover o texto "(opcional — pode seleccionar mais de uma)" da primeira pergunta
- Tornar `role` e `teamSize` **obrigatórios**: o botão "Próximo passo" fica desactivado (disabled + estilo cinza) até que `role` e `teamSize` estejam preenchidos
- **Remover** o link "Saltar esta pergunta" — as perguntas de role e team_size são obrigatórias
- A pergunta "Como soubeste" (sources) continua opcional — não bloqueia o avanço
- Adicionar validação visual: se o utilizador clica "Próximo passo" sem preencher, destacar as perguntas em falta com border vermelha

**Ficheiro:** `src/pages/UpgradeVideo.tsx`
- Na função `handleRecovery`, após obter os dados do utilizador, carregar também `sources`, `role`, `team_size` e `step_reached` da DB
- Se `step_reached >= 2` e `role` e `team_size` já existem, pré-preencher os campos e permitir avançar directamente
- Actualizar o `select` na query de recovery para incluir: `sources, role, team_size, step_reached, plan_selected`
- Se os dados de qualificação já existem, restaurar o estado e iniciar no step correcto

---

## Detalhes técnicos

### LiveVideoGate.tsx — modal de redirect

```tsx
const [showRedirect, setShowRedirect] = useState(false);

// No botão "Inscrever-me agora":
onClick={() => setShowRedirect(true)}

// Modal overlay:
{showRedirect && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl p-6 max-w-[380px] text-center shadow-lg">
      <p className="font-heading font-bold text-[18px] mb-2">Inscrição no webinar</p>
      <p className="text-[14px] text-ink-500 mb-5">
        Vais ser encaminhado para a página de inscrição do webinar de vídeo.
      </p>
      <a href="/video" className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-xl">
        Continuar →
      </a>
    </div>
  </div>
)}
```

### StepQualification.tsx — validação obrigatória

```tsx
const canProceed = !!(role && teamSize);

// Botão "Próximo passo":
<button
  onClick={onNext}
  disabled={!canProceed}
  className={`mt-7 font-heading font-bold text-[16px] py-3 px-8 rounded-xl transition-colors ${
    canProceed ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
  }`}
>
  Próximo passo →
</button>

// Remover completamente o link "Saltar esta pergunta"
```

### UpgradeVideo.tsx — recuperação de dados do step 1

Na função `handleRecovery`, expandir o select:
```tsx
.select("id, name, first_name, last_name, edit_token, sources, role, team_size, step_reached, plan_selected")
```

Após obter dados, restaurar estado:
```tsx
if (data.role) setRole(data.role);
if (data.team_size) setTeamSize(data.team_size);
if (data.sources && data.sources !== "SKIPPED") {
  setSources(data.sources.split(", "));
}
// Se já passou do step 1 com dados válidos, iniciar no step correcto
if (data.step_reached && data.step_reached >= 2 && data.role && data.team_size) {
  setStep(data.step_reached > 4 ? 4 : data.step_reached);
  // Restaurar orderState baseado no plan_selected
  if (data.plan_selected?.includes("premium") || data.plan_selected?.includes("bundle")) {
    setOrderState(s => ({ ...s, videoPremium: true }));
  }
  if (data.plan_selected?.includes("masterclass") || data.plan_selected?.includes("bundle")) {
    setOrderState(s => ({ ...s, masterclass: true }));
  }
}
```

---

## O que NAO muda

- Lógica de pagamento
- Steps 2, 3 e 4 do funil
- Layout do sidebar de compra
- Nenhum outro componente ou página

