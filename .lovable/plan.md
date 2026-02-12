

## Converter campo de duvida em escolha multipla com opcao "Outro"

### O que muda

O Step 2 do /upgrade ("A tua maior duvida sobre imagens com IA") deixa de ser apenas uma textarea livre e passa a ter 5 opcoes pre-definidas seleccionaveis (multi-seleccao), mais uma opcao "Outro" com campo de texto livre. O visual seguira exactamente o mesmo padrao do Step 1 (StepQualification) para manter consistencia.

### Opcoes pre-definidas

1. "Nao sei descrever o estilo visual que quero"
2. "Os resultados ficam sempre genericos, sem identidade"
3. "Nao percebo que ferramenta usar (Midjourney, DALL-E, etc.)"
4. "Quero criar imagens para a minha marca mas nao sei por onde comecar"
5. "Tenho dificuldade em editar ou refinar as imagens geradas"

### Alteracoes tecnicas

**Ficheiro: `src/pages/Upsell.tsx`**
- Adicionar novo state `duvidas: string[]` (array, para multi-seleccao) e `outraDuvida: string` (texto livre)
- O state `duvida: string` existente sera mantido para compatibilidade com o envio a base de dados -- sera preenchido automaticamente a partir da juncao das seleccoes
- Passar os novos props ao `StepPersonalization`

**Ficheiro: `src/components/upgrade/StepPersonalization.tsx`**
- Substituir a textarea por uma lista de botoes seleccionaveis (mesmo estilo visual do StepQualification: borda azul quando activo, checkbox com icone Check)
- Permitir multi-seleccao (clicar activa/desactiva)
- Adicionar opcao "Outro" que, quando seleccionada, mostra um campo de texto livre
- O campo de texto livre tera placeholder "Escreve a tua duvida..." e limite de 200 caracteres
- O componente recebera novos props: `duvidas: string[]`, `setDuvidas`, `outraDuvida: string`, `setOutraDuvida`
- Internamente, ao chamar `onNext`, combinara as seleccoes num unico string (separadas por ", ") e passara via `setDuvida` para manter compatibilidade com o envio a BD

**Base de dados**: Sem alteracoes. O campo `duvida` na tabela `registrations` ja e texto livre e recebera as opcoes seleccionadas concatenadas (ex: "Nao sei descrever o estilo visual que quero, Outro: quero usar IA para logos").

**CRM**: Os dados ja serao visiveis no CRM tal como estao. Futuramente, pode-se adicionar filtragem/estatisticas por opcao.
