

## Redesign da Pagina /confirmacao (Pos-Pagamento)

### O que muda

A pagina de confirmacao de pagamento sera simplificada e reorganizada com novo conteudo e estrutura.

### Nova Estrutura

1. **Cabecalho**
   - Icone de check animado (manter)
   - Titulo: "Upgrade Realizado!"
   - Subtitulo: "Obrigado pela confianca."
   - Texto: "Vamos aguardar a confirmacao do seu pagamento."

2. **Remover**
   - Caixa "O teu acesso inclui:" (lista de items)
   - Caixa azul "Proximo passo"
   - Bloco referral (convida 2 amigos)

3. **Seccao "PROXIMOS PASSOS"** (titulo grande e visivel)
   - **Passo 1 — Segue-me no Instagram**: Botao rosa do Instagram (manter estilo actual)
   - **Passo 2 — Guarda o dia do webinar**: Botao de adicionar ao calendario (manter componente WebinarCalendarButton)
   - **Passo 3 — Partilha com os teus amigos**: Social card para partilha no LinkedIn e outras redes. Inclui botoes de partilha (LinkedIn, Twitter/X, copiar link) com um card pre-formatado que o utilizador pode partilhar

4. **Rodape** — Manter link "Voltar ao site" e email de contacto

### Alteracoes tecnicas

| Ficheiro | Alteracao |
|---|---|
| `src/pages/Confirmacao.tsx` | Reescrever layout: remover caixa de items e caixa azul; novo titulo/subtitulo; seccao "Proximos Passos" com 3 blocos numerados |
| `src/components/landing/ConfirmacaoExtras.tsx` | Reescrever: remover bloco referral; adicionar passos numerados (Instagram, Calendario, Social Share Card com botoes de partilha LinkedIn/X/copiar link) |

### Social Card de Partilha (Passo 3)

O passo 3 tera um mini-card visual com:
- Preview do evento (titulo do webinar, data, nome do apresentador)
- Botoes para partilhar no LinkedIn, Twitter/X
- Botao para copiar o link do site

Os links de partilha usarao os URLs nativos de cada rede social (ex: `https://www.linkedin.com/sharing/share-offsite/?url=...`).

