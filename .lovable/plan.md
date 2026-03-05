

# Corrigir mensagem de confirmação no /upgrade-video

## Problema
Quando o utilizador compra (gravação ou masterclass), o step 7 mostra "Estás inscrito, Frederico" e "Webinar Vídeo com IA · 5 de Março · 10h00" — como se fosse apenas uma inscrição gratuita. Isto não faz sentido para quem acabou de pagar.

## Alteração em `src/pages/UpgradeVideo.tsx` (função `renderConfirmation`, linhas 319-418)

### Lógica condicional baseada no estado da compra

**Se comprou algo** (`orderState.videoPremium || orderState.masterclass`):
- Título: "Compra confirmada, {nome}! 🎉"
- Subtítulo: resumo do que comprou (ex: "Gravação + Pack de Apoio" ou "Masterclass + Gravação")
- Mensagem: "Receberás os acessos por email em breve."

**Se não comprou** (inscrição gratuita, step 7 sem extras):
- Manter o actual: "Estás inscrito, {nome}." + "Webinar Vídeo com IA · 5 de Março · 10h00"

### Ficheiro único
- `src/pages/UpgradeVideo.tsx` — ~10 linhas alteradas no bloco `renderConfirmation`

