

# Converter Comunicação para tema claro

## Contexto

As secções Dashboard, Pipeline, Tabela, Faturação e Automações usam fundo `#F8FAFC` com texto escuro. A secção Comunicação (e as sub-tabs Email/SMS) usa fundo `#0f172a` com texto branco — criando inconsistência visual.

## Ficheiros a alterar (4)

### 1. `ComunicacaoView.tsx`
- Fundo: `#0f172a` → `#F8FAFC`
- Título: `text-white` → `text-[#0F172A]`
- Subtítulo: `rgba(255,255,255,0.4)` → `#64748B`
- Tabs: adaptar cores active/inactive para light

### 2. `EmailTab.tsx`
- **FilterBar** (componente partilhado): chips de `rgba(255,255,255,...)` → borders e backgrounds claros (`#E2E8F0`, `#2563EB/10%`)
- Labels: `text-white/30` → `text-slate-400`
- Inputs (search, subject, textarea): fundo branco, border `#E2E8F0`, texto `#0F172A`
- Toolbar botões: hover light
- Recipient chips: fundo `blue-50`, texto `blue-600`
- Dropdown de resultados: fundo branco, sombra, texto escuro
- Results Dialog: fundo branco em vez de `#0f172a`

### 3. `SmsTab.tsx`
- Mesmas alterações de labels, inputs, chips, dropdown
- Provider cards: fundo branco com border, active com `blue-50`
- Character progress bar: fundo `#E2E8F0`
- Caption do PhonePreview: `text-white/20` → `text-slate-400`

### 4. `PhonePreview.tsx`
- **Manter escuro** — é um mockup de telemóvel, faz sentido visualmente ser escuro independentemente do tema da página

## Padrão de cores (consistente com Faturação/Automações)

| Elemento | Antes (dark) | Depois (light) |
|----------|-------------|----------------|
| Fundo página | `#0f172a` | `#F8FAFC` |
| Título | `text-white` | `text-[#0F172A]` |
| Subtítulo | `white/40` | `#64748B` |
| Labels | `white/35` | `#94A3B8` |
| Inputs bg | `white/4%` | `#FFFFFF` |
| Inputs border | `white/8%` | `#E2E8F0` |
| Input text | `text-white` | `text-slate-900` |
| Placeholder | `white/25` | `#94A3B8` |
| Dropdown bg | `#1e293b` | `#FFFFFF` |
| Dropdown hover | `white/5%` | `#F1F5F9` |

## Resultado

Comunicação fica visualmente integrada com o resto do CRM. O PhonePreview mantém o estilo escuro como elemento decorativo.

