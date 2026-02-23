
# Corrigir data duplicada na sidebar do Upgrade Video

## Problema

Na sidebar desktop do `/upgrade-video`, quando nenhum addon esta seleccionado, a data e hora do webinar aparecem duas vezes:

- Linha 245: `5 Mar · 10h00`
- Linha 246: `📅 5 de Março · 10h00`

## Solucao

Remover a linha 246 (a segunda ocorrencia com o icone de calendario) e manter apenas a linha 245 com o formato curto `5 Mar · 10h00`, que e consistente com o estilo das outras linhas da sidebar (ex: `12 Mar · 10h-13h`).

## Alteracao

**Ficheiro:** `src/pages/UpgradeVideo.tsx`

Remover a linha 246:
```
<p className="text-[12px] mt-1" style={{ color: '#888' }}>📅 5 de Março · 10h00</p>
```

Resultado final do bloco (linhas 243-249):
```
<div>
  <p className="font-semibold text-[14px] text-ink-900">Webinar Vídeo com IA</p>
  <p className="text-[14px] text-ink-400 mt-0.5">5 Mar · 10h00</p>
</div>
<p className="font-heading font-bold text-[16px] text-green-600">€0</p>
```

1 ficheiro, 1 linha removida. Nenhuma alteracao em mobile (a barra mobile nao mostra esta informacao).
