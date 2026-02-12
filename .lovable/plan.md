

## Modais integrados para Termos e Politica de Privacidade (sem paginas separadas)

Em vez de navegar para paginas separadas, os textos de Termos e Politica de Privacidade abrem em modais (Dialog) diretamente onde o utilizador esta.

### O que muda

1. **Novo componente `LegalModal.tsx`** - Um modal reutilizavel (usando Radix Dialog) que recebe titulo e conteudo. Inclui scroll interno e botao de fechar. Sera usado para ambos os textos.

2. **Conteudo legal em componentes separados** - Criar `src/components/legal/TermosContent.tsx` e `src/components/legal/PrivacidadeContent.tsx` com o texto formatado (reutilizando o conteudo que ja existe em `Termos.tsx` e o texto de Privacidade do historico).

3. **Atualizar FooterSection.tsx** - Os links "Privacidade" e "Termos" passam a abrir modais em vez de navegar. O componente fica com estado local para controlar qual modal esta aberto.

4. **Atualizar WebinarFooter.tsx** - Mesma logica: links abrem modais inline.

5. **Atualizar RegistrationModal.tsx** - Os links "Politica de Privacidade" e "Termos e Condicoes" no texto de consentimento abrem os respetivos modais (sobrepostos ao modal de registo). Removem-se os `target="_blank"` e `href`.

6. **Manter a pagina `/termos`** - A rota continua a funcionar para quem aceder diretamente, mas os links internos usam modais.

### Ficheiros

| Ficheiro | Acao |
|---|---|
| `src/components/legal/LegalModal.tsx` | **Novo** - Modal reutilizavel com scroll, titulo e conteudo |
| `src/components/legal/TermosContent.tsx` | **Novo** - Conteudo JSX dos Termos (extraido de Termos.tsx) |
| `src/components/legal/PrivacidadeContent.tsx` | **Novo** - Conteudo JSX da Politica de Privacidade (13 seccoes) |
| `src/components/landing/FooterSection.tsx` | Botoes abrem LegalModal em vez de links |
| `src/components/webinar/WebinarFooter.tsx` | Botoes abrem LegalModal em vez de links |
| `src/components/landing/RegistrationModal.tsx` | Links no consentimento abrem LegalModal sobreposto |

### Detalhes tecnicos

- O `LegalModal` usa `@radix-ui/react-dialog` (ja instalado) com `z-[200]` para ficar acima do modal de registo (`z-[100]`)
- Fundo escuro (`bg-[#060D1A]`) e texto branco para manter consistencia visual
- Scroll interno com `max-h-[80vh]` e `overflow-y-auto`
- Cada footer passa a ter estado local (`useState`) para controlar abertura/fecho dos modais
- No modal de registo, os links "Politica de Privacidade" e "Termos e Condicoes" tornam-se `<button>` com estilo de link, que abrem o LegalModal por cima
