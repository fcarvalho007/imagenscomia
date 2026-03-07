

# Plano: Remover badges de plano dos cartões do Pipeline

## Problema
Os cartões do Pipeline mostram badges redundantes ("Sessão Prática", "MC Vídeo", "Pack Completo", "IMG+VID") quando as colunas já identificam o plano. Isto cria ruído visual, como visível nos screenshots.

## Alteração

**Ficheiro**: `src/components/crm/PipelineView.tsx`

Remover do componente `PipelineCard` (linhas 142-152):
1. O badge de plano genérico (`badge.label` — mostra "Sessão Prática", "MC Vídeo", "Pack Completo", "Gratuito")
2. O badge "IMG+VID" exclusivo do bundle

Manter intactos:
- Badge "PÓS-WEBINAR"
- Badge "Seleccionou e saiu"
- Badge "Aguarda pgto" + tempo
- Badge "Pago"
- Badge de webinar (consolidado)
- Badge "GRUPO"

## Ficheiros alterados (1)
- `src/components/crm/PipelineView.tsx` — remover badges de plano dos cartões

