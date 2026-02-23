

# Adicionar perguntas de qualificacao (Role + Team Size) ao upgrade video

## Resumo

Adicionar duas novas perguntas opcionais ("Qual e o teu papel principal?" e "Quantas pessoas trabalham em marketing?") ao Step 1 do fluxo `/upgrade-video`, persistir os dados na tabela `registrations`, e mostra-los no CRM (TableView + DashboardView).

---

## 1. Migracao de base de dados

Adicionar duas novas colunas a tabela `registrations`:

```sql
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_size text;
```

---

## 2. StepQualification — novas props e UI

**Ficheiro:** `src/components/upgrade/StepQualification.tsx`

- Adicionar novas props ao interface:
  - `role: string | null`
  - `setRole: (r: string | null) => void`
  - `teamSize: string | null`
  - `setTeamSize: (t: string | null) => void`

- Actualizar o titulo de "so 2 perguntas muito rapidas" para "so algumas perguntas rapidas"

- Apos a seccao de sources (incluindo "Outro"), adicionar:

  **Divider:** `<div className="w-full" style={{ height: 1, background: "#e5e7eb", margin: "24px 0" }} />`

  **Pergunta 1 — Papel principal:**
  - Label: "Qual e o teu papel principal?"
  - Sub-label: "(selecciona uma opcao)"
  - Radio-style single select com 5 opcoes (mesmo estilo visual das pill buttons existentes, mas com circulo radio em vez de checkbox quadrado)
  - Opcoes: "Gestor/a de marketing numa empresa", "Empresario/a ou PME — faco o meu proprio marketing", "Freelancer ou consultor/a de marketing", "Criador/a de conteudo", "Outra funcao"

  **Pergunta 2 — Tamanho de equipa (16px spacing abaixo):**
  - Label: "Quantas pessoas trabalham em marketing na tua organizacao?"
  - Sub-label: "(selecciona uma opcao)"
  - 4 opcoes: "So eu", "2 a 5 pessoas", "6 a 20 pessoas", "Mais de 20 pessoas"

- Estilo identico ao existente: pill buttons full-width, borda `hsl(var(--border))`, seleccionado com `hsl(var(--blue-600))` border + `hsl(var(--blue-50))` fundo, circulo radio em vez de check square

---

## 3. UpgradeVideo — state e persistencia

**Ficheiro:** `src/pages/UpgradeVideo.tsx`

- Adicionar state:
  ```
  const [role, setRole] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<string | null>(null);
  ```

- Passar `role`, `setRole`, `teamSize`, `setTeamSize` ao `StepQualification`

- No `onNext` do step 1, incluir `role` e `team_size` no `saveStepData`:
  ```
  saveStepData(2, { sources: srcText, role: role || null, team_size: teamSize || null });
  ```

- No `onSkip`, salvar null para ambos:
  ```
  saveStepData(2, { sources: "SKIPPED", role: null, team_size: null });
  ```

---

## 4. Inscrito type — novos campos

**Ficheiro:** `src/pages/crm/mockData.ts`

Adicionar ao type `Inscrito`:
```
role: string | null;
team_size: string | null;
```

---

## 5. useInscritos — mapear novos campos

**Ficheiro:** `src/hooks/useInscritos.ts`

Na funcao `mapRegistration`, adicionar:
```
role: (r as any).role || null,
team_size: (r as any).team_size || null,
```

---

## 6. CRM TableView — novas colunas

**Ficheiro:** `src/components/crm/TableView.tsx`

Adicionar duas colunas ao header da tabela (apos "Passo"):
- "Funcao" — mostra `i.role || "—"`
- "Equipa" — mostra `i.team_size || "—"`

Incluir no CSV export.

---

## 7. CRM DashboardView — widget "Perfil dos Inscritos"

**Ficheiro:** `src/components/crm/DashboardView.tsx`

Abaixo do card "Distribuicao por Plano", adicionar um novo card:
- Titulo: "Perfil dos Inscritos"
- Condicao: so renderizar barras se >= 5 inscritos tiverem `role` preenchido; caso contrario mostrar "Dados disponiveis apos mais inscricoes"
- Dois mini graficos de barras horizontais:
  1. Distribuicao por `role` (contagem por opcao)
  2. Distribuicao por `team_size` (contagem por opcao)
- Estilo: barras horizontais simples com label a esquerda, barra azul, contagem a direita (mesmo padrao visual dos graficos existentes no dashboard)

---

## Ficheiros a modificar

| Ficheiro | Alteracao |
|----------|-----------|
| Migracao SQL | `ALTER TABLE` para `role` e `team_size` |
| `src/components/upgrade/StepQualification.tsx` | Novas props, titulo, divider, 2 perguntas radio |
| `src/pages/UpgradeVideo.tsx` | State + persistencia de `role` e `team_size` |
| `src/pages/crm/mockData.ts` | Novos campos no type `Inscrito` |
| `src/hooks/useInscritos.ts` | Mapear `role` e `team_size` |
| `src/components/crm/TableView.tsx` | 2 novas colunas + CSV |
| `src/components/crm/DashboardView.tsx` | Widget "Perfil dos Inscritos" |

