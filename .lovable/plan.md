
## Alterar uma opção de dúvida no Step 2 do /upgrade

### O que muda

Uma das 5 opções predefinidas de dúvida será alterada para refletir melhor as ferramentas de IA comuns atualmente.

**Opção actual (linha 7):**
```
"Não percebo que ferramenta usar (Midjourney, DALL-E, etc.)"
```

**Opção nova:**
```
"Não percebo que ferramenta usar (ChatGPT, Google, outros...)"
```

### Motivo

A mudança torna as ferramentas de exemplo mais relevantes e atualizadas, focando em ferramentas de IA genéricas (ChatGPT, Google) em vez de ferramentas específicas de geração de imagens (Midjourney, DALL-E).

### Alteração técnica

**Ficheiro: `src/components/upgrade/StepPersonalization.tsx`**
- Modificar a constante `DUVIDA_OPTIONS` na linha 7, alterando apenas o texto da opção
- Nenhuma alteração de lógica ou estrutura necessária
- Nenhuma alteração na base de dados necessária (o texto será armazenado tal como o utilizador selecionar)

