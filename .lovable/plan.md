

## Alteracoes na pagina /live e homepage

Tres mudancas simples, todas baseadas em logica de tempo no cliente.

---

### 1. Limpar textos no WebinarVideoArea (estado live)

**Ficheiro:** `src/components/webinar/WebinarVideoArea.tsx`

- Remover a linha "Se aparecer 'offline'..." (linhas 60-62)
- Remover o subtitulo com `WEBINAR_CONFIG.metaLine` (linhas 57-59)
- Manter apenas o titulo "Transmissao ao vivo" acima do player

---

### 2. Voltar ao countdown ate as 09:30h, depois mostrar player

**Ficheiro:** `src/components/webinar/webinarConfig.ts`

- Alterar `isLive: true` para `isLive: false`

**Ficheiro:** `src/pages/WebinarLive.tsx`

- Alterar o threshold de "near start" de 30 minutos para 30 minutos (ja esta assim, 09:30 = 30 min antes das 10:00)
- A logica existente ja faz exactamente o que e pedido: `isNearStart = timeDiff <= 30 * 60 * 1000 && timeDiff > 0`
- Resultado: ate 09:30 ve-se o countdown; a partir das 09:30 ve-se o player YouTube

Nao e preciso nenhum cron job ou agendamento — o browser calcula a hora actual e decide qual estado mostrar.

---

### 3. Homepage redireciona para /live a partir das 09:30h

**Ficheiro:** `src/pages/Index.tsx`

- Adicionar verificacao de tempo no topo do componente
- Se `new Date() >= new Date("2026-02-18T09:30:00+00:00")`, fazer `Navigate` para `/live`
- Antes das 09:30, a homepage funciona normalmente com a landing page

```text
Logica no Index.tsx:
  const now = new Date();
  const switchTime = new Date("2026-02-18T09:30:00+00:00");
  if (now >= switchTime) return <Navigate to="/live" replace />;
  // ... resto da landing page
```

---

### Resumo de ficheiros

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/webinar/WebinarVideoArea.tsx` | Remover disclaimer "offline" e subtitulo metaLine |
| `src/components/webinar/webinarConfig.ts` | `isLive: false` |
| `src/pages/Index.tsx` | Redirect para /live apos 09:30h de 18 Fev |

Nenhuma alteracao no backend. Tudo e logica de tempo no browser.
