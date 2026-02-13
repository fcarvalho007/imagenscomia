

## Correcao: Texto desalinhado nos cards de credenciais em mobile

### Problema

Na `PresenterSection`, a classe `text-center md:text-left` (linha 45) aplica-se ao wrapper inteiro, incluindo os cards de credenciais. Resultado:
- O emoji fica a esquerda (por causa do `flex items-start`)
- O texto do card fica centrado (herdado do parent)
- Cria um desalinhamento visual feio em mobile

### Correcao

Adicionar `text-left` ao div dos cards de credenciais para garantir que o texto fica sempre alinhado a esquerda, independentemente do parent.

### Ficheiro afectado

`src/components/landing/PresenterSection.tsx`

### Alteracao tecnica

Na linha 59, o grid dos credentials:
```
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
```
Mudar para:
```
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
```

Isto forca o texto dos cards a ficar alinhado a esquerda em mobile, mantendo o alinhamento correcto com o emoji.

