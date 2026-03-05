

# Auto-refresh para forçar actualização do player

## Problema
Utilizadores que abriram `/live-video` antes do deploy ainda vêem o countdown. Precisam de refresh automático.

## Solução

**Ficheiro**: `src/components/webinar/VideoWebinarVideoArea.tsx`

Adicionar um `useEffect` que, quando `isLive` é `false` (código antigo em cache) OU quando não há iframe YouTube visível, faz `window.location.reload()` após 30 segundos. Como o código novo já tem `isLive: true`, após o reload carregam a versão actualizada com o player.

Abordagem mais simples e imediata: adicionar ao componente `LiveVideoGate` ou à página `WebinarLiveVideo` um intervalo de auto-reload de 60s que pára assim que o iframe YouTube estiver presente no DOM.

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    const hasIframe = document.querySelector('iframe[src*="youtube"]');
    if (!hasIframe) {
      window.location.reload();
    }
  }, 30_000);
  return () => clearInterval(interval);
}, []);
```

Isto garante que qualquer utilizador que tenha a versão antiga em cache recebe reload automático em até 30 segundos sem afectar quem já vê o player.

