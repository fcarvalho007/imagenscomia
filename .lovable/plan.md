

## Ajustes visuais e de copy na Landing Page e Modal

### Alteracoes

**1. HeroSection.tsx**
- Remover o subtitulo "para a Tua Empresa" (linhas 23-25)
- Remover o bloco "Isto soa familiar?" com os 3 bullets e a linha de alivio (linhas 35-60)
- Mover o badge Google 5,0 para depois do botao verde (ja esta nessa posicao, confirmar ordem)
- Aumentar o botao verde para ter a mesma largura da caixa de video: alterar `max-w-[380px]` para `max-w-[640px]`

**2. PricingCardsSection.tsx**
- Remover a linha "Sem compromisso" (linhas 54-58)
- Adicionar subtexto "(nao inclui gravacao da sessao)" por baixo do botao, em texto subtil

**3. RegistrationModal.tsx (CaptureView)**
- Alterar titulo "Concluir reserva do lugar" para:
  - "Quero confirmar o meu lugar para o Webinar Gratuito - Ao Vivo"
  - Linha adicional: "Quarta-feira, 18 de Fevereiro, 10h"
- Alterar texto dos termos (linha 258-262) para:
  - "Autorizo o envio de comunicacoes relacionadas com este evento e conteudos de marketing do Frederico Carvalho. Os dados pessoais serao tratados pela sua empresa Fomentar Sonhos. Politica de Privacidade e Termos e Condicoes."
- Remover frase "Sem spam. Cancelamento a qualquer momento." (linha 264)

### Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/HeroSection.tsx` | Remover subtitulo, remover bloco familiar, aumentar botao |
| `src/components/landing/PricingCardsSection.tsx` | Remover "Sem compromisso", adicionar nota gravacao |
| `src/components/landing/RegistrationModal.tsx` | Reescrever titulo modal, termos, remover frase spam |

