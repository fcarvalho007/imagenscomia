

## 1. Botao WhatsApp em /upgrade, /convites e /live

Adicionar o componente `WhatsAppSupportButton` (ja existente) nas tres paginas adicionais. Basta importar e renderizar no final de cada pagina.

| Ficheiro | Alteracao |
|---|---|
| `src/pages/Upsell.tsx` | Importar e adicionar `<WhatsAppSupportButton />` no final do JSX |
| `src/pages/Convites.tsx` | Importar e adicionar `<WhatsAppSupportButton />` no final do JSX |
| `src/pages/WebinarLive.tsx` | Importar e adicionar `<WhatsAppSupportButton />` no final do JSX |

Nenhuma alteracao ao componente em si — e reutilizado tal como esta.

## 2. Email de contacto no Footer da landing page

No `FooterSection.tsx`, o link "Contacto" (actualmente `href="#"`) sera substituido por um link `mailto:` com o email correcto.

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/FooterSection.tsx` | Substituir `<a href="#">Contacto</a>` por `<a href="mailto:frederico.carvalho@digitalfc.pt">frederico.carvalho@digitalfc.pt</a>` |

### Detalhe tecnico

**Upsell.tsx** — adicionar no final do return, antes do ultimo `</div>`:
```text
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
...
<WhatsAppSupportButton />
```

**Convites.tsx** — mesmo padrao, dentro do `RegistrationModalProvider` wrapper.

**WebinarLive.tsx** — adicionar apos `<WebinarFooter />`.

**FooterSection.tsx** — linha 16:
```text
Antes:  <a href="#" ...>Contacto</a>
Depois: <a href="mailto:frederico.carvalho@digitalfc.pt" ...>frederico.carvalho@digitalfc.pt</a>
```

