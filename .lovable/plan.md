

# 3 Refinamentos E-goi — Correcções pontuais

## Analise do estado actual

Apos verificar o codigo, apenas **1 dos 3 pontos** requer alteracao:

### 1. FORMATO DO TELEFONE -- precisa de correcao

**Ficheiro:** `supabase/functions/egoi-sync/index.ts`, linhas 99-101

Estado actual: `351-${phone.replace(/\D/g, "")}` (com traço)
Deve ser: `+351${phone.replace(/\D/g, "")}` (com sinal +, sem traço)

Alterar a linha 100 de:
```
? `351-${phone.replace(/\D/g, "")}`
```
para:
```
? `+351${phone.replace(/\D/g, "")}`
```

### 2. TAG EM CONTACTOS EXISTENTES -- ja esta correcto

O codigo actual ja faz isto correctamente. Quando o contacto ja existe (linha 95 `findContact` retorna contactId), o fluxo salta a criacao mas cai na linha 147-148 que chama `attachTag(contactId, TAG_VIDEO_WEBINAR)` independentemente de como o contactId foi obtido. Nenhuma alteracao necessaria.

### 3. TELEFONE NO REGISTER-FREE -- ja esta correcto

O `register-free/index.ts` ja envia `phone: cleanPhone ? "+351${cleanPhone.replace(/\D/g, "")}" : ""` nas duas chamadas a `egoi-sync` (linhas 87 e 203). Quando `cleanPhone` e null, envia `phone: ""` e o `egoi-sync` trata correctamente (omite o campo `cellphone` do payload E-goi). Nenhuma alteracao necessaria.

---

## Resumo

| Ponto | Alteracao |
|---|---|
| 1. Phone format | Trocar `351-` por `+351` na linha 100 de egoi-sync |
| 2. Tag existing | Ja funciona correctamente |
| 3. Phone in register-free | Ja funciona correctamente |

Apos a alteracao, re-deploy da funcao `egoi-sync`.

