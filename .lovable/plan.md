

## Corrigir eliminacao de registos no CRM

### Problema raiz

A funcao `deleteInscrito` no hook `useInscritos.ts` apenas remove o registo do estado local (memoria do browser). Nunca apaga da base de dados. Como o CRM faz refresh automatico a cada 30 segundos, o registo "volta" porque continua na base de dados.

Como consequencia, ao tentar registar o mesmo email, a edge function `register-free` encontra o registo na base de dados e devolve "ja esta inscrito".

### Solucao

#### 1. Adicionar politica de DELETE na base de dados

A tabela `registrations` atualmente so permite SELECT e UPDATE. Precisa de uma politica que permita DELETE.

**Migracao SQL:**
```sql
CREATE POLICY "allow_anon_delete"
  ON public.registrations
  FOR DELETE
  USING (true);
```

#### 2. Apagar da base de dados ao eliminar no CRM

**Ficheiro:** `src/hooks/useInscritos.ts`

Alterar a funcao `deleteInscrito` para:
- Primeiro apagar o registo da base de dados com `supabase.from("registrations").delete().eq("id", inscritoId)`
- Depois remover do estado local
- Mostrar erro na consola se a eliminacao falhar

### Resumo

| Alteracao | Detalhe |
|---|---|
| Migracao SQL | Adicionar politica DELETE na tabela `registrations` |
| `src/hooks/useInscritos.ts` | `deleteInscrito` passa a apagar da base de dados antes de remover do estado local |

