

# Plano: Reescrever pagina /gravacao + Corrigir Maria Joao no CRM

Duas tarefas independentes.

---

## PARTE 1 — Corrigir Maria Joao na base de dados

Maria Joao (mariajoao.silva@cluttons.com, id `3ebaa628`) tem actualmente `plan_selected = masterclass` mas o utilizador indica que foi uma venda **Premium early bird** (15 EUR).

**Accao:** Actualizar `plan_selected` de `masterclass` para `premium` na tabela `registrations`.

Isto fara com que o CRM (Tabela e Pipeline) mostre automaticamente o badge "Premium" e o valor correcto (15 EUR), sem alteracao de codigo — o `useInscritos.ts` ja mapeia `premium → 15 EUR`.

---

## PARTE 2 — Reescrever pagina /gravacao (remover "Gravacao", repositionar como produto on-demand)

### Ficheiro unico: `src/pages/Gravacao.tsx`

Reescrita completa do conteudo, mantendo a estrutura tecnica (componentes, modal, imports). Todas as alteracoes sao de copy, dados e layout — sem novos ficheiros.

### Seccoes da pagina (11 blocos):

**1) HERO** — Tema claro (branco/cinza/azul), sem dark background
- Badge: "ACESSO IMEDIATO · PACK COMPLETO · 27 EUR"
- H1: "Aprenda a Criar Imagens Profissionais com Inteligencia Artificial — com metodo (nao tentativa-erro)"
- Subheadline: "Do briefing a imagem pronta a publicar, com um processo replicavel e templates prontos."
- Linha de valor: "Ver hoje. Aplicar amanha."
- CTA primario azul (#2563EB): "Garantir acesso imediato (27 EUR)"
- Link secundario: "Ver exactamente o que esta incluido"
- Microcopy: "Pagamento seguro · acesso imediato apos confirmacao · inclui documentos"
- Remover ColorBends/ElectricBorder dark; usar fundo branco/cinza claro

**2) RESPOSTAS RAPIDAS** (novo bloco compacto)
- Grid 2 colunas (desktop), accordion (mobile)
- 9 perguntas curtas com respostas de 1-2 linhas
- Links ancora para seccoes relevantes (pack, testemunhos, FAQ, formador)

**3) O QUE RECEBES (Pack 27 EUR)** — Actualizar deliverables exactos:
- Sessao completa em video (60 min, HD)
- PDF resumo da sessao (consulta rapida)
- SOP — Metodo profissional (Nano Banana Pro) para criar imagens consistentes
- Exercicio pratico com 1 prompt profissional (replicavel)
- Guia passo-a-passo Nano Banana Pro (do briefing ao output final)
- Biblioteca de melhores prompts (editaveis, por objectivo)
- Payoff: "Tudo pronto para aplicar no dia seguinte."
- CTA: "Garantir acesso imediato (27 EUR)"

**4) BLOQUEIOS** — Reescrever os 6 cards:
- 01 Criativos com aspeto generico (tipo stock)
- 02 Falta de consistencia visual entre publicacoes
- 03 Perda de tempo a testar ferramentas sem criterio
- 04 Precisa de mais volume sem aumentar equipa/custos
- 05 Urgencia: criar rapido, sem depender de terceiros
- 06 Autonomia para criar quando e preciso
- Fecho: "Se houver identificacao com 2+ pontos, este pack encurta meses de tentativa-erro."

**5) METODO** — Titulo muda para "O que se aprende no pack (3 blocos praticos)"
- Manter 3 blocos, refinar copy com outcomes explicitos
- Adicionar 3 bullets de resultado: processo replicavel, checklist, templates reutilizaveis
- CTA apos

**6) GALERIA** — Manter GallerySection, adicionar linha "Feito com IA e metodo — sem designer/agencia, em minutos."

**7) AUDIENCIA** — Titulo muda para "Para quem e este pack"; remover "gravacao" do notFor

**8) FORMADOR** — Manter PresenterSection (sem alteracao)

**9) TESTEMUNHOS** — Reduzir de 7 para 6; adicionar "Avaliacoes publicas no Google (DIGITALFC)"

**10) FAQ** — Reescrever perguntas/respostas sem "gravacao":
- Como recebo o acesso?
- Quanto tempo fica disponivel?
- Inclui todos os documentos do pack?
- Funciona com ferramentas gratuitas?
- Preciso de conhecimentos tecnicos?
- Emite fatura/recibo?
- E se tiver dificuldades?
- Bloco de suporte com WhatsApp + email

**11) CTA FINAL** — "Acesso imediato ao video + pack completo de apoio." / "Metodo pronto a aplicar no dia seguinte." / Botao "Garantir acesso (27 EUR)"

### Regras de design (aplicadas a toda a pagina):
- Fundo alternado: #FFFFFF / #F8FAFC
- Bordas: #E2E8F0; texto: #0F172A / #334155
- Azul primario: #2563EB (hover #1D4ED8) para CTAs
- Cards: brancos, border subtle, shadow-sm, radius 16px
- Zero ocorrencias de "Gravacao" em toda a pagina
- Modal de inscricao: titulo e copy actualizados (sem "gravacao")
- usePageMeta: titulo e descricao actualizados

### Verificacao final:
- Grep "gravacao"/"Gravacao"/"gravação"/"Gravação" = 0 resultados na pagina (excepto `registrationSource: "gravacao"` que e tecnico/DB)
- CTAs repetidos 4x ao longo da pagina
- Mobile-first: CTA visivel above the fold

