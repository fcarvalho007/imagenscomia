# Secção "Links" no CRM do Vídeo IA (e Imagens IA)

## Objetivo
Tal como o Curso IA já tem "Links e testes", os webinars passam a ter uma secção **Links** no menu lateral, com as páginas do webinar selecionado — landing page, checkout e restantes páginas — para abrir ou copiar cada endereço com um clique.

## O que muda

1. **Menu lateral** (`src/components/crm/CRMSidebar.tsx`)
   - O item "Links" (ícone Link2, já existente no tipo `CRMView`) passa a aparecer também nos webinars (hoje só aparece no Curso IA).
   - Sem alterações ao seletor de projeto nem aos restantes itens.

2. **Nova vista `WebinarLinks`** (`src/components/crm/WebinarLinks.tsx`)
   - Mesmo padrão visual do `CourseLinks`: linhas com título, descrição, endereço completo, botão **Copiar** e botão **Abrir** (novo separador).
   - Conteúdo conforme o webinar escolhido no seletor do menu:
     - **Vídeo IA**: landing page (`/video-lp`, e variante `/video`), checkout (`/comprar`), upgrade (`/upgrade-video`), gravação (`/upgrade-gravacao`), sessão ao vivo (`/live-video`), masterclass (`/masterclass-video`), recursos da masterclass (`/recursos-masterclass`), área de recursos (`/recursos-video`).
     - **Imagens IA**: landing page (`/`), upgrade (`/upgrade`), sessão ao vivo (`/live`), gravação (`/gravacao`), recursos (`/recursos`), convites (`/convites`).
     - **Consolidado (Todos)**: os dois grupos, um por webinar.
   - Aviso discreto de que páginas com ligação pessoal (recursos, upgrades) só abrem com o link enviado ao participante.
   - As descrições finais de cada página são confirmadas lendo o respetivo ficheiro antes de escrever o texto, para não inventar conteúdo.

3. **Ligação no CRM** (`src/pages/CRM.tsx`)
   - Nova condição `activeView === "links"` a renderizar `WebinarLinks` com o webinar atual.

4. **Testes**
   - Teste unitário novo: a vista lista os links corretos por webinar e os botões copiar/abrir.
   - `npm test`, verificação de tipos e compilação.

## Fora de âmbito
- Nada de migrações, funções de servidor, envios, pagamentos ou faturação.
- Não se publica o frontend; fica apenas na pré-visualização.
- Não se toca no Curso IA nem nas landing pages em WordPress.
