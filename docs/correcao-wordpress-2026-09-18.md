# Revisão da instalação WordPress — 18 setembro 2026

## Corrigido e verificado no site

- Plugin Curso IA e CRM atualizado de 0.4.0 para 0.5.0 através do editor WordPress, com confirmação «Arquivo editado com sucesso».
- A pré-visualização `?fc_ia_preview=1` começa explicitamente na LP1 e não recupera preferências antigas. O comportamento de regresso à página pública não foi alterado.
- Percurso LP1 → modal de três perguntas → LP2 online validado, sem inscrição, pagamento ou email.
- Página selecionada e guardada: `/curso-de-inteligencia-artificial/`.
- CRM apontado para `/crm`, que é o módulo já publicado. `/crm/curso-ia` ainda não está publicado.
- Endpoint do projeto preenchido: `https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/course-wordpress-ingest`. Preencher o endereço não significa que a função esteja instalada.
- Privacidade preenchida com a página configurada no próprio WordPress: `/politica-privacidade-termos/`.
- Painel simplificado: percurso da landing, acesso ao CRM, estado dos pagamentos e definições recolhidas.
- Plugin antigo de pré-visualização 0.2.0 confirmado inativo; não foi eliminado.

## Preservação visual

O HTML do pacote é idêntico ao `outputs/landing-ia/index.html` V90: SHA256 `74882f43816d19fcc99c2267241a499176cfad6c96a344b682931c253385d9fe`.

108 referências diretas verificadas. CSS, imagens e scripts mantidos. A única adaptação do app-v90.js já existente é resolver o endereço da fotografia relativamente ao script, para funcionar na pasta do plugin. Foram verificados o modal, a seleção online, a timeline e a vista móvel. Não foram detetadas imagens com endereço definido que falhassem, nem largura horizontal excedente nas vistas observadas.

O separador antigo ainda mostrava a versão 0.2.0 em iframe antes de ser recarregado. Após recarregar, o site serve V90 diretamente, sem iframe.

## Ainda não concluído

- Publicação do código do novo CRM no GitHub/Lovable: bloqueada por aprovação automática, aguardando autorização explícita para o repositório público.
- Migrações, funções e segredos específicos do curso ainda não publicados no backend Lovable.
- Ligação segura WordPress–backend e homologação dos pagamentos, faturação e emails ainda por executar.
- Condições de inscrição/cancelamento do curso por finalizar. Não foi inventada uma política nem substituída pela página de privacidade.
- Inscrições, métricas opcionais e indexação permanecem desativadas.

Pacote de reposição: `wordpress/releases/fc-curso-ia-0.5.0.zip`. A demonstração do complemento opcional continua isolada e sem oferta comercial ativa.
