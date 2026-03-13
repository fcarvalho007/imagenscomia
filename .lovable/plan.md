

# Actualizar template `video_masterclass_day1` na base de dados

## Problema
O preview no CRM mostra o texto antigo ("Obrigado por teres estado presente na Masterclass...") porque lê da tabela `email_templates`. A edge function tem o HTML correcto no fallback, mas o template na BD ainda tem a versão antiga.

## Solução

Executar uma migração SQL que faz `UPDATE` na tabela `email_templates` para a row com `template_key = 'video_masterclass_day1'`:

- **subject**: `{{fname}}, os teus recursos da Masterclass estão prontos`
- **html_body**: O HTML refinado com tom neutro (sem assumir presença), incluindo:
  - Header verde "Os teus recursos estão prontos"
  - Corpo com "A Masterclass... já decorreu e a gravação... está disponível"
  - Lista de 4 recursos (gravação, workbook, exercícios, ferramentas)
  - CTA "Aceder aos meus recursos"
  - Conselho prático
  - Bloco amarelo avaliação Google (podes.entrar.pt/avaliar)
  - Assinatura Frederico Carvalho
  - Footer

### Ficheiro alterado
| Tipo | Detalhe |
|------|---------|
| Migração SQL | `UPDATE email_templates SET subject, html_body WHERE template_key = 'video_masterclass_day1'` |

