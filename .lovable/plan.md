

## Alteracoes ao Modal de Registo e CTAs da Landing Page

### 1. Remover "(nao inclui gravacao da sessao)"

**`src/components/landing/RegistrationModal.tsx`** — linha 295-297

Remover o paragrafo:
```
<p className="text-center mt-2 text-[13px] text-ink-400">
  (não inclui gravação da sessão)
</p>
```

### 2. Efeito CSS no container do modal

**`src/components/landing/RegistrationModal.tsx`** — linha 126

Substituir o className do `motion.div` do modal por estilos que incluem:
- `border: 1px solid rgba(255,255,255,0.08)`
- `box-shadow: 0 25px 60px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`
- `backdrop-filter: blur(20px)`

Adicionar via style inline no `motion.div` do modal, mantendo as classes existentes.

### 3. Destaque da palavra "Gratuito" no titulo

**`src/components/landing/RegistrationModal.tsx`** — linha 213-214

Substituir:
```
Quero confirmar o meu lugar para o Webinar Gratuito — Ao Vivo
```
por:
```
Quero confirmar o meu lugar para o Webinar <span className="text-[#22C55E] font-extrabold">Gratuito</span> — Ao Vivo
```

### 4. Remover setas " → " de todos os CTAs da landing page

Ficheiros afectados (apenas landing page — /upgrade, /confirmacao e /crm nao sao tocados):

| Ficheiro | Texto actual | Texto novo |
|---|---|---|
| `src/components/landing/HeroSection.tsx` (linha 222) | `Sim, quero garantir a minha vaga grátis →` | `Sim, quero garantir a minha vaga grátis` |
| `src/components/landing/TransformationSection.tsx` (linha 58) | `Sim, quero garantir a minha vaga grátis →` | `Sim, quero garantir a minha vaga grátis` |
| `src/pages/Convites.tsx` (linha 286) | `Ainda sem inscrição? Registar gratuitamente →` | `Ainda sem inscrição? Registar gratuitamente` |

Nota: a `→` nos bullets do ProgramSection (linha 75) e um marcador de lista, nao um CTA — nao sera removida.

### Resumo de ficheiros

| Ficheiro | Alteracoes |
|---|---|
| `src/components/landing/RegistrationModal.tsx` | Remover microcopy, adicionar border/shadow/blur ao modal, destacar "Gratuito" |
| `src/components/landing/HeroSection.tsx` | Remover " →" do CTA |
| `src/components/landing/TransformationSection.tsx` | Remover " →" do CTA |
| `src/pages/Convites.tsx` | Remover " →" do CTA |
