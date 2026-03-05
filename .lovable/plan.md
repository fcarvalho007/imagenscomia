
# Redesign visual da tab SMS na secção Comunicação

## Objectivo
Transformar a tab SMS actual (funcional mas básica) numa interface premium, altamente visual e apelativa, mantendo toda a lógica de envio existente (dois providers: SMSEasy/IMAGENSIA e E-goi/915015508).

## Alterações — `src/components/crm/ComunicacaoView.tsx`

### Provider Cards (redesign completo)
- Cards com gradiente subtil, ícone de antena/sinal, glow effect no card activo
- Badge animado "ACTIVO" no provider seleccionado
- Informação técnica visível: tipo de remetente (alfanumérico vs numérico), limites
- Hover com scale e transição suave

### Área de destinatário
- Input com ícone de telefone integrado, pill/chip visual ao seleccionar inscrito (com nome + número + botão X para limpar)
- Dropdown de pesquisa com avatares (iniciais coloridas) e highlight do match

### Composer de mensagem
- Textarea com fundo glassmorphism
- Barra de progresso visual colorida para contagem de caracteres (verde → amarelo → vermelho)
- Indicador de "partes SMS" (1 SMS, 2 SMS…) com ícone
- Preview simulada de telemóvel (bolha de mensagem estilo chat) ao lado do composer

### Phone Preview (elemento visual diferenciador)
- Mini mockup de ecrã de telemóvel (moldura arredondada, notch) mostrando a mensagem em tempo real como bolha de SMS
- Mostra o remetente (IMAGENSIA ou 915015508) no topo
- Actualiza em tempo real à medida que o utilizador escreve

### Botão de envio
- Botão com gradiente azul, ícone animado (avião de papel), estado de loading com shimmer
- Disabled state com opacity e tooltip explicativo

### Layout geral
- Grid 2 colunas em desktop: esquerda = formulário, direita = phone preview
- Mobile: stack vertical, preview colapsável
- Header da tab com ícone gradient e descrição

## Ficheiros alterados
- `src/components/crm/ComunicacaoView.tsx` — redesign completo da `SmsTab`
