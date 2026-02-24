
# Refinamentos mobile para /upgrade-video

Apos revisao completa do funil em 375px (iPhone), o estado actual esta bastante solido. Identifiquei ajustes menores que melhoram a experiencia mobile:

## Problemas encontrados

### 1. Botao WhatsApp sobrepoe conteudo no passo 4
No passo 4 (duvida), o botao WhatsApp (fixed bottom-right) sobrepoe parcialmente o botao "Finalizar" e a opcao "Saltar". Em ecras de 375px, o conteudo termina perto do fundo e o FAB verde fica por cima.

**Solucao:** Adicionar `pb-24` (padding-bottom extra) ao conteudo do StepDuvida para garantir espaco abaixo dos botoes de accao, evitando a sobreposicao.

### 2. Campo "Outra funcao" cortado em mobile
No passo 1, quando se selecciona "Outra funcao", o campo de texto usa `ml-8` e `maxWidth: calc(100% - 2rem)` o que o empurra para a direita. Em 375px, o campo fica ligeiramente estreito e desalinhado.

**Solucao:** Remover `ml-8` e o estilo `maxWidth` inline em mobile, usando apenas `w-full` com um `pl-8` para manter o alinhamento visual com as opcoes acima sem cortar o campo.

### 3. Campo "Outro" no StepDuvida com o mesmo problema
Identico ao anterior: o campo de texto para "Outro" usa `ml-8` e fica cortado.

**Solucao:** Mesma abordagem — trocar `ml-8` + `maxWidth` inline por `w-full pl-8` para que o campo ocupe a largura disponivel.

### 4. Etiqueta da progress bar no passo 2 podia ser mais curta em mobile
A etiqueta mostra "Passo 2/5 — Masterclass" em mobile (<480px) e "Passo 2/5 — Masterclass Video (opcional)" em desktop. Esta bem mas pode ser encurtada para apenas "Masterclass" omitindo o "(opcional)" tambem em desktop, ja que o botao "Continuar com inscricao gratuita" ja transmite a opcionalidade.

**Solucao:** Simplificar as labels da progress bar — mobile: apenas o nome curto; desktop: com "(opcional)".

### 5. Mobile sticky footer para reduzir abandono nos passos 2 e 3
Nos passos de upsell (2 e 3), o botao "Continuar com inscricao gratuita" so aparece no fundo da pagina, obrigando a fazer scroll em mobile. Um utilizador que nao quer comprar pode abandonar sem ver a opcao de skip.

**Solucao:** Adicionar um sticky footer mobile (apenas em `lg:hidden`) nos passos 2 e 3 com o texto "Continuar com inscricao gratuita" — semelhante a barra de resumo do topo, mas no fundo.

---

## Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/components/upgrade/StepQualification.tsx` | Campo "Outra funcao": trocar `ml-8` + `maxWidth` por `w-full pl-8` |
| `src/components/upgrade/StepDuvida.tsx` | Campo "Outro": mesma correcao + adicionar `pb-20` ao container para evitar sobreposicao com WhatsApp FAB |
| `src/pages/UpgradeVideo.tsx` | Adicionar sticky footer mobile nos passos 2 e 3 com "Continuar com inscricao gratuita"; simplificar labels da progress bar |

Nenhuma migracao de BD necessaria.
