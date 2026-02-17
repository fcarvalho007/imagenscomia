

## Nova Pagina /gravacao — Venda da Gravacao (27 euros)

Pagina de venda pos-evento, reutilizando componentes e padroes visuais da homepage.

---

### Ficheiros a criar

| Ficheiro | Descricao |
|----------|-----------|
| `src/pages/Gravacao.tsx` | Pagina principal com todas as seccoes inline (hero, pack, bloqueios, metodo, galeria, audiencia, presenter, FAQ, CTA final, footer) |

### Ficheiros a alterar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/App.tsx` | Adicionar route `/gravacao` |
| `supabase/functions/create-payment/index.ts` | Adicionar plano `gravacao` com value 33.21 (27 + 23% IVA) |

---

### Estrutura da pagina (Gravacao.tsx)

Uma unica pagina self-contained com todas as seccoes. Reutiliza componentes existentes (ScrollReveal, ColorBends, ElectricBorder, GallerySection, PresenterSection, FooterSection, WhatsAppSupportButton) e o PurchaseModal para o fluxo de pagamento.

#### Seccoes (de cima para baixo):

**1. Hero (navy/gradiente com ColorBends)**
- Badge pill: "ACESSO IMEDIATO"
- H1: "Gravacao: Imagens Profissionais com Inteligencia Artificial"
- Sub: "Do briefing a imagem pronta a publicar -- com metodo, exemplos e passos replicaveis."
- Micro-linha: "Inclui documentos de apoio para aplicar no dia seguinte."
- 4 quick-facts (mesmo padrao da home): Formato (Gravacao HD), Acesso (Imediato), Documentos (Incluidos), Investimento (27 euros)
- CTA verde (ElectricBorder): "Quero acesso imediato (27 euros)" -- abre PurchaseModal com plan="gravacao"
- Link secundario: "Ver o que esta incluido" (scroll para seccao pack)
- Badge Google Reviews (mesmo da home): "5,0 stars 1 194 avaliacoes no Google"
- Microcopy: "Pagamento seguro. Acesso imediato apos confirmacao."

**2. O que recebe (Pack 27 euros)**
- Fundo off-white
- Cartao premium com lista: Gravacao HD, Resumo PDF, Checklist ferramentas, Estrutura briefing reutilizavel, Checklist anti-erros, Mini-biblioteca de prompts base
- CTA repetido

**3. Isto resolve estes 6 bloqueios**
- Mesmo padrao visual do ChallengesSection (cards numerados 01-06)
- Copy adaptado ao pos-evento
- Fecho: "Se houver identificacao com 2 ou mais pontos, esta gravacao encurta meses de tentativa e erro."

**4. O metodo (em 3 blocos)**
- Mesmo padrao do ProgramSection (cards 01/02/03 com border-left colorido)
- Etiqueta "METODO" em vez de "AO VIVO"
- Copy adaptado
- CTA repetido

**5. Galeria**
- Reutiliza o componente GallerySection existente (mesmas imagens)

**6. Para quem e / nao e**
- Mesmo padrao do AudienceSection
- Copy adaptado (sem "webinar", foco na "gravacao")

**7. Quem apresenta**
- Reutiliza o componente PresenterSection existente

**8. Perguntas frequentes**
- Acordeao com FAQs adaptadas: acesso, duracao, documentos, ferramentas gratuitas, conhecimentos tecnicos, fatura, dificuldades

**9. CTA Final**
- Navy com particles-bg (mesmo padrao CTAFinalSection)
- Headline: "Acesso imediato a gravacao + pack de apoio."
- Sub: "Metodo pronto a aplicar no dia seguinte."
- CTA verde: "Garantir acesso (27 euros)"

**10. Footer + WhatsApp**
- Reutiliza FooterSection e WhatsAppSupportButton

---

### Fluxo de pagamento

O CTA abre o PurchaseModal existente com `plan="gravacao"`. O create-payment recebe o novo plano e gera link EuPago.

Novo produto no create-payment:
```text
gravacao: {
  value: 33.21,  // 27 + 23% IVA
  identifier: "WEBINAR-GRAVACAO",
  description: "Gravacao + Pack de Apoio — Webinar IA",
}
```

### SEO

usePageMeta com titulo e descricao adequados:
- Titulo: "Gravacao: Criar Imagens com IA para Empresas — Acesso Imediato"
- Descricao: "Acesso imediato a gravacao do webinar + documentos de apoio. Metodo testado para criar imagens profissionais com IA. 27 euros, pagamento unico."

