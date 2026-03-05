

# Filtros deseleccionáveis na Comunicação

## Problema
Clicar em "Todos" (ou qualquer filtro já activo) não faz nada. O utilizador quer poder desmarcar tudo — incluindo "Todos" — para não ter nenhum filtro de grupo activo, permitindo seleccionar destinatários individualmente.

## Alterações em `src/components/crm/comunicacao/EmailTab.tsx`

### 1. Tipos — permitir `null` como estado
- `WebinarFilter` → `WebinarFilter | null` nos props e state
- `PlanoFilter` → `PlanoFilter | null` nos props e state

### 2. Toggle nos botões (FilterBar)
- Webinar: `onClick={() => setWebinar(webinar === v ? null : v)}`
- Plano: `onClick={() => setPlano(plano === v ? null : v)}`

### 3. Estilo "nenhum seleccionado"
Quando `webinar === null` ou `plano === null`, nenhum chip fica highlight (todos ficam no estilo inactivo). Sem alteração visual extra necessária — basta que nenhum tenha o estilo `active`.

### 4. `filterInscritos` — tratar `null`
- `webinar === null` → sem filtro de webinar (equivalente a "todos")
- `plano === null` → sem filtro de plano (equivalente a "todos")

### 5. Contagens no FilterBar
- Quando `webinar === null`, as contagens de plano usam todos os activos (mesmo comportamento de "todos")

### 6. "Seleccionar todos" — comportamento com `null`
O botão "Seleccionar todos (N)" continua a funcionar normalmente — usa `filteredPool` que com `null` retorna todos os activos.

### Ficheiro único
- `src/components/crm/comunicacao/EmailTab.tsx`

