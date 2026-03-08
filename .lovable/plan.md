

# Inserir template video_masterclass_day3 na base de dados

## Situação actual

- `video_masterclass_thankyou` — na DB com copy do utilizador ✓
- `video_masterclass_day1` — na DB com copy do utilizador ✓
- `video_masterclass_day3` — **NÃO está na DB**. Existe apenas como fallback HTML na edge function, com copy genérico escrito pela IA.

## O que vou fazer

Inserir o template `video_masterclass_day3` na tabela `email_templates` via SQL (insert tool), com copy profissional reescrito. O template segue o padrão visual verde (Masterclass) e a voz do Frederico.

### Copy do template — video_masterclass_day3

**Assunto**: `O que vem a seguir, {{fname}}`

**Corpo** (resumo do conteúdo):

> Olá {{fname}},
>
> Já passaram três dias desde a Masterclass.
>
> Espero que tenhas tido tempo de experimentar pelo menos um dos fluxos que trabalhámos. Não precisa de ser perfeito — precisa de acontecer.
>
> Tenho recebido mensagens de pessoas que já produziram os primeiros clips com o sistema. Se ainda não chegaste lá, não te preocupes. O acesso aos recursos não tem prazo.
>
> **CTA**: Aceder à minha área de recursos → (imagenscomia.com/recursos-video)
>
> ---
>
> Nas próximas semanas vou continuar a produzir conteúdo sobre IA aplicada a marketing e criação de vídeo — no podcast, na newsletter e em novos eventos.
>
> Se ainda não acompanhas:
> → Newsletter Digital Sprint (semanal)
> → Podcast Marketing por Idiotas · RFM
>
> E se tiveres colegas ou clientes que possam beneficiar deste sistema, podes partilhar a página da sessão em imagenscomia.com/video.
>
> ---
>
> Obrigado por teres estado presente.
>
> Frederico Carvalho
> DIGITALFC · fredericocarvalho.pt

Este copy já existe no fallback da edge function — vou usá-lo como base para o HTML profissional na DB, com o mesmo padrão visual (header verde gradient, CTA verde, tipografia Georgia) dos outros 2 templates.

### Alteração

1 operação SQL INSERT via insert tool — sem alteração de código frontend.

