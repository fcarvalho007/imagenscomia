

# Ajustes ao funil /upgrade-video (Passos 1, 2 e 4)

## Passo 1 — StepQualification

### Titulo e subtitulo
- Titulo grande: `"{firstName}, espera..."` (em vez de "ESPERE...")
- Subtitulo simplificado: `"So duas perguntas rapidas."`

### "Outra funcao" com campo de texto
- Quando o utilizador selecciona "Outra funcao", aparece um campo de texto obrigatorio por baixo
- Nao pode avancar sem preencher esse campo
- O valor e guardado directamente na coluna `role` da BD (ex: "Outra funcao: Designer grafico")
- Sem necessidade de nova coluna — o texto fica concatenado ao valor da opcao

### Validacao
- `canProceed` passa a verificar: role seleccionado E (se role === "Outra funcao", campo de texto nao vazio) E teamSize seleccionado

**Ficheiro:** `src/components/upgrade/StepQualification.tsx`

---

## Passo 2 — StepMasterclass

### Hierarquia de titulos
- Titulo principal: **"Vais gostar desta opcao adicional"**
- Subtitulo (ligeiramente maior, ~20px, bold): **"Masterclass Video com IA (3 horas)"**
- Sub-subtitulo (cinzento, como esta): "O webinar cobre o essencial. A Masterclass aprofunda o sistema completo em 3 horas de conteudo util."

**Ficheiro:** `src/components/upgrade/StepMasterclass.tsx` (linhas 37-42)

---

## Passo 4 — StepDuvida com checkboxes

### Estrutura nova
Substituir o textarea unico por:
1. 3 opcoes checkbox pre-definidas (multi-seleccao):
   - "Como criar videos curtos sem filmar"
   - "Que ferramentas de IA usar para video"
   - "Como integrar video na estrategia de marketing"
2. Opcao "Outro" com checkbox — ao activar, mostra campo de texto aberto
3. Botao "Finalizar" e link "Saltar" mantidos

### Persistencia
- Os valores seleccionados sao guardados concatenados na coluna `duvida` (texto livre, ja existente)
- Formato: `"Como criar videos curtos sem filmar; Que ferramentas de IA usar para video; Outro: texto personalizado"`

**Ficheiro:** `src/components/upgrade/StepDuvida.tsx`

---

## Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `StepQualification.tsx` | Titulo "{nome}, espera...", subtitulo curto, campo texto para "Outra funcao" com validacao |
| `StepMasterclass.tsx` | Nova hierarquia de 3 niveis no titulo |
| `StepDuvida.tsx` | 3 checkboxes + "Outro" com textarea, persistencia concatenada no campo `duvida` |

Nenhuma migracao de BD necessaria — todos os campos ja existem.

