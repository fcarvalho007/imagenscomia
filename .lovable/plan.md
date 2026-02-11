
# Botao Calendario com opcoes Google Calendar / Apple Calendar

## Contexto
Atualmente, o botao "Guardar no calendario" gera diretamente um ficheiro .ics. A alteracao transforma-o num popover com duas opcoes claras.

## Ficheiros a editar (2)

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/ConfirmacaoExtras.tsx` | Substituir botao simples por Popover com 2 opcoes |
| `src/components/upgrade/StepConfirmation.tsx` | Mesma alteracao no VariantFree |

## Comportamento

Ao clicar em "Guardar no calendario", abre um pequeno popover (usando o componente Popover ja existente no projeto) com duas opcoes:

1. **Google Calendar** — abre link direto para criar evento no Google Calendar (URL publica, sem autenticacao)
2. **Apple Calendar** — descarrega ficheiro .ics (comportamento atual)

O popover fecha ao selecionar uma opcao ou ao clicar fora.

## Detalhes tecnicos

### URL Google Calendar
```
https://calendar.google.com/calendar/render?action=TEMPLATE
&text=Webinar+IA+%E2%80%94+Frederico+Carvalho
&dates=20260218T100000Z/20260218T111500Z
&details=Como+Criar+Imagens+Profissionais+com+IA+para+a+Tua+Empresa
```
Abre em nova aba (`target="_blank"`).

### Apple Calendar
Mantemos a funcao `generateICS()` existente que descarrega o ficheiro .ics.

### UI do Popover
- Largura fixa `w-[220px]`, sem padding extra
- Duas opcoes em lista vertical, cada uma com icone + texto
- Google: icone do Google (SVG inline pequeno ou emoji) + "Google Calendar"
- Apple: icone Apple (emoji ou Lucide `Calendar` icon) + "Apple Calendar"
- Cada opcao com `hover:bg-surface`, `rounded-lg`, `px-4 py-3`, `cursor-pointer`
- Sem titulo no popover — direto nas opcoes (claro e objetivo)

### Imports necessarios
- `Popover, PopoverTrigger, PopoverContent` de `@/components/ui/popover`
- `Calendar` de `lucide-react` (para icone Apple Calendar)
