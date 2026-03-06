

# Corrigir contadores nos nodes de automação

## Problema 1 — Email "76 enviados"
A base de dados tem **363 registos** em `email_send_logs` para `video_postwebinar_day1`. O valor "76" no screenshot provavelmente é de uma sessão antes do envio manual dos 266 emails. O código já carrega os dados correctos — basta recarregar a página. Não é necessário alterar código.

## Problema 2 — SMS nodes não mostram "X enviados"
Os nodes de SMS só mostram o contador quando `counts.sent > 0`. Os nodes de email mostram sempre ("0 enviados" quando não há envios). Precisamos igualar o comportamento.

## Alteração — `src/components/crm/AutomationFlowTab.tsx`

Na secção do SMS right-side (linhas ~1230-1240), o bloco actual:
```tsx
{counts && counts.sent > 0 && (
  <span className="text-[13px] font-semibold" style={{ color: "#7c3aed" }}>
    {counts.sent} enviados
  </span>
)}
```

Passa a mostrar sempre o contador (igual aos emails), com "0 enviados" a cinza quando não há envios:
```tsx
{counts && (
  counts.sent > 0 ? (
    <span className="text-[13px] font-semibold" style={{ color: "#7c3aed" }}>
      {counts.sent} enviados
    </span>
  ) : (
    <span style={{ fontSize: 12, color: "#9ca3af" }}>0 enviados</span>
  )
)}
```

E igualmente para as falhas — mostrar "0 falhas" a cinza quando não há falhas (consistente com os emails).

Ficheiro único: `src/components/crm/AutomationFlowTab.tsx`.

