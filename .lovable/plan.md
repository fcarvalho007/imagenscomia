

# Diagnóstico: Email "1 hora" — envio incompleto

## O que aconteceu

1. **E-goi sem saldo** — erro `INSUFICIENT_BALANCE` (saldo: -0,008€). Todos os emails caíram no fallback Resend.
2. **Timeout da Edge Function** — com 600ms de delay entre emails, 248 destinatários levariam ~150s. A função tem timeout de ~60s. Resultado: **114 enviados, 134 por enviar**.
3. **Janela horária expirada** — a função só dispara entre 08:30 e 09:30 UTC. Mesmo re-invocando, seria bloqueada pela condição de tempo (linhas 79-84).

## Plano: Enviar aos 134 restantes agora

### Alteração: `send-video-reminder-1h/index.ts`

1. Remover temporariamente a validação de janela horária (linhas 63-84) — substituir por um simples check de dia ou remover completamente
2. Redeploy e invocar imediatamente
3. A deduplicação via `message_logs` já garante que os 114 já enviados não recebem duplicado — só os 134 em falta serão processados
4. Para evitar novo timeout, processar em lotes (os primeiros 134 cabem nos 60s se reduzirmos o delay para 300ms ou usarmos lotes)

### Alternativa mais segura: invocar `resend-failed-emails` adaptado

Como os 134 não têm registo em `message_logs` (nem sent nem failed), a melhor abordagem é:

1. Alterar `send-video-reminder-1h` removendo as linhas 63-84 (date/time guards)
2. Reduzir o delay de 600ms para 300ms
3. Deploy e invocar — processará os 134 em ~42s (dentro do timeout)
4. Depois restaurar os guards originais

### Resultado esperado

- 248 inscritos no vídeo receberão o email de 1h
- Todos via Resend (E-goi sem saldo)
- Sem duplicados graças à deduplicação existente

