

# Fix: "Ver email" nos 3 fluxos de Recursos

## Problema

Os templates `video_recursos_premium`, `video_recursos_masterclass` e `video_recursos_bundle` não existem na tabela `email_templates`. A edge function `send-video-recursos-access` foi criada mas nunca foi invocada (nem em `dry_run`), por isso os templates não foram inseridos na BD.

## Solução

Invocar a edge function em modo `dry_run: true` para fazer upsert dos 3 templates na tabela `email_templates`. Isto não envia emails — apenas popula os templates para ficarem visíveis e editáveis no CRM.

Vou usar a ferramenta `curl_edge_functions` para chamar:
```
POST /send-video-recursos-access
{ "dry_run": true }
```

Após isto, o botão "Ver email →" abrirá o editor com o HTML do template correspondente.

## Ficheiros alterados

Nenhum ficheiro de código precisa de ser alterado. Apenas uma invocação da edge function.

