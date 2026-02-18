
## Corrigir o redirect de / para /live

### Problema
O `Index.tsx` tem dois problemas em simultâneo:

1. **Violação de regras de hooks do React**: `usePageMeta` é chamado na linha 25, *depois* de um `return` condicional na linha 23. O React exige que os hooks sejam sempre chamados na mesma ordem, independentemente de condições. Isto pode causar o componente a não renderizar corretamente.

2. **Data já ultrapassada**: O evento (18 Fev às 09:30 UTC) já aconteceu, por isso o redirect devia estar ativo — mas o bug acima pode estar a impedir o seu funcionamento correto.

### Solução

Alterar o `src/pages/Index.tsx` para:

- Mover o `usePageMeta` para **antes** de qualquer `return` condicional (corrige a violação de hooks)
- Tornar o redirect **incondicional** para `/live`, uma vez que o evento já começou e a landing page de pré-registo não é mais relevante

```tsx
const Index = () => {
  // Hook sempre chamado, independentemente de condições
  usePageMeta({ title: "...", description: "..." });
  
  // Redirect incondicional — evento já em curso
  return <Navigate to="/live" replace />;
};
```

Esta é a alteração mínima e mais segura. O componente continua a existir no router (não é preciso tocar no `App.tsx`), mas redireciona imediatamente todos os visitantes para `/live`.
