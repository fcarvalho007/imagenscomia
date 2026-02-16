

## Fix: Regenerar link blocking + UX clarity improvements

### Problema identificado

O botao "Regenerar link" usa um AlertDialog cujo `AlertDialogAction` executa a funcao async `handleRegen` mas o dialog nao fecha correctamente apos o clique. O overlay do AlertDialog permanece visivel, bloqueando toda a interaccao. Alem disso, falta feedback visual pos-accao.

**Resposta a pergunta:** Sim, ao reenviar email apos regenerar, o novo link e usado. A validacao e feita server-side (a edge function le o link actual da base de dados, nao do frontend).

### Ficheiros a alterar

| Ficheiro | Accao |
|----------|-------|
| `src/components/crm/modal/ActionsSection.tsx` | Corrigir AlertDialog (fechar manualmente), adicionar estado de sucesso pos-regeneracao, melhorar UX |

### Alteracoes

**1. Corrigir o bloqueio do AlertDialog**

O problema: `AlertDialogAction onClick={handleRegen}` e async. O dialog fecha ao clicar Action, mas o handler pode falhar silenciosamente. Solucao: controlar o `open` state manualmente e fechar so apos conclusao.

```text
// Adicionar estado:
const [regenDialogOpen, setRegenDialogOpen] = useState(false);
const [regenSuccess, setRegenSuccess] = useState(false);

// No handleRegen:
const handleRegen = async () => {
  setRegenDialogOpen(false);  // Fechar dialog imediatamente
  setRegenLoading(true);
  try {
    const result = await regenerateLink(inscrito.id);
    setRegenSuccess(true);
    setTimeout(() => setRegenSuccess(false), 4000);
    toast({ title: "Link regenerado", ... });
    onRefresh?.();
  } catch (e) {
    toast({ title: "Erro ao regenerar", ..., variant: "destructive" });
  } finally {
    setRegenLoading(false);
  }
};

// No AlertDialog:
<AlertDialog open={regenDialogOpen} onOpenChange={setRegenDialogOpen}>
  <AlertDialogTrigger asChild>
    <button ...>Regenerar link</button>
  </AlertDialogTrigger>
  ...
  <AlertDialogAction onClick={handleRegen}>Confirmar</AlertDialogAction>
</AlertDialog>
```

**2. Estado de sucesso pos-regeneracao**

Apos regenerar com sucesso, mostrar durante 4 segundos:
- Botao "Regenerar" muda para "Link regenerado" (verde, com CheckCircle)
- Microcopy abaixo dos botoes: "Link actualizado. O reenvio usara o novo link."

**3. Melhorias UX adicionais**

- Botao "Reenviar email": adicionar tooltip/microcopy explicando que usa sempre o link mais recente
- Spinner visivel no botao durante a regeneracao (ja existe, manter)
- Manter aria-labels consistentes

### O que NAO muda

- Logica de regeneracao (generate-reminder edge function)
- Logica de reenvio (followup-abandoned edge function)
- ResendModal (ja funciona correctamente)
- Props interface
- Restante InscritoModal

