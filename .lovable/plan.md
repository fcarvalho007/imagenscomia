

# Actualizar conteúdo da página /recursos-masterclass

Três alterações no ficheiro `src/components/recursos/RecursosMasterclassConteudo.tsx`:

## 1. Configuração (`MASTERCLASS_RECURSOS_CONFIG`)

Actualizar o objecto de configuração com:

- **vimeoEmbedUrl**: `"https://player.vimeo.com/video/1173341892?badge=0&autopause=0&player_id=0&app_id=58479"`
- **audioUrl**: `"https://drive.google.com/file/d/1zdZmZOSWGImU9vllvkzD_Jhc8x-DfFC8/view?usp=sharing"`
- **workbookUrl**: `"https://drive.google.com/file/d/1zdZmZOSWGImU9vllvkzD_Jhc8x-DfFC8/view?usp=sharing"`
- **chapters**: Substituir os 3 placeholders pelos 5 capítulos fornecidos (fórmula do prompt, workflow replicável, consistência visual, demonstração Farmácia/Podcast, fluxos visuais)

Adicionar array de **recursos extra** com os 4 links adicionais (Exercício Roteiro, Exercício 3 Ativos, Guia Prompts, Storyboard Beta).

## 2. Vídeo embed

O `vimeoEmbedUrl` preenchido activa automaticamente o player existente (a lógica `hasVideo` já trata disto). Ajustar o padding do container de `56.25%` para `75%` conforme o embed fornecido.

## 3. Sidebar — Recursos

Expandir a secção de recursos na sidebar para incluir os 6 itens:
1. Workbook resumo Masterclass (Google Drive)
2. Só áudio da Masterclass (Google Drive)
3. Exercício Roteiro Vídeo (podes.entrar.pt/pre-roteiro)
4. Exercício 3 ativos visuais (podes.entrar.pt/3ativos)
5. Guia de Estudo — Prompts para Vídeo (imagenscomia.com/guia-prompts)
6. Ferramenta Storyboard — em desenvolvimento (podes.entrar.pt/storyboardbeta)

Substituir a renderização condicional actual (que só mostra audio + workbook) por um array de recursos mapeado dinamicamente, cada um com ícone, nome e subtítulo apropriados.

### Ficheiro alterado
| Ficheiro | Alteração |
|----------|-----------|
| `src/components/recursos/RecursosMasterclassConteudo.tsx` | Config completa + 5 capítulos + 6 recursos + vídeo Vimeo |

