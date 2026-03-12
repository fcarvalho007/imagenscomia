

# Refinar design do email `video_masterclass_thankyou`

O template actual tem um design funcional mas básico. Vou elevar o design visual mantendo a identidade da marca (gradiente verde, Georgia serif, tom pessoal).

## Melhorias de design

### Header
- Adicionar um **H1** no banner verde: "Obrigado pela presença" (consistente com outros templates que têm título no header)
- Adicionar um **ícone decorativo** ✅ antes do subtítulo

### Corpo
- **Separar visualmente** os blocos de conteúdo com mais espaçamento
- Estilizar os **links dos recursos como botões** em vez de URLs em texto — mais clicáveis e profissionais
- Adicionar **ícones inline** (📚, 🎬) nos itens da lista para diferenciação visual
- Melhorar a **tipografia**: texto de acesso mais subtil (cor cinza), hierarquia mais clara

### Assinatura
- Adicionar **avatar/foto** do Frederico (URL externo ou placeholder)
- Layout lado a lado (foto + texto) para a assinatura

### Geral
- Adicionar **rodapé** com texto legal/unsubscribe em cinza claro (profissionalismo)
- Melhorar o **callout box** verde — adicionar padding e ícone mais visível

## Ficheiros alterados

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/send-video-masterclass-thankyou/index.ts` | Novo HTML do fallback com design refinado |
| DB `email_templates` | UPDATE `html_body` para `video_masterclass_thankyou` |

