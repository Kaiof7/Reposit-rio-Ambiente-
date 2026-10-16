# Código e arquitetura

## Stack efetiva

| Peça | Versão | Observação |
|---|---|---|
| Next.js | 16.4.2 | App Router, Turbopack, `src/`, alias `@/*` |
| React / React DOM | 19.3.0 | |
| TypeScript | 5.9.3 | `strict: true` |
| Tailwind CSS | 4.3.3 | via `@tailwindcss/turbopack` (gerado pelo `create-next-app` 16.4.2) |
| Zod | 4.6.7 | validação de ambiente; formulários no MVP |
| Pino | 10.4.0 | logger do servidor, com redação de segredos |
| clsx + tailwind-merge | 2.1.1 / 3.7.0 | helper `cn` |
| Vitest | 5.0.5 | ambiente Node |
| Node.js / pnpm | 22.22 / 10.28.0 | `engines` exige Node `^22.12.0 \|\| >=24.0.0` (Vitest 5) |

Versões efetivas completas: `pnpm-lock.yaml`. Não há ORM nem driver de banco; `server-only` protege `env.ts` e `logger.ts`.

## Mapa do código

```text
src/
├── app/
│   ├── layout.tsx        # layout raiz, lang="pt-BR", fonte Geist, metadata
│   ├── page.tsx          # vitrine: o que é NFC, como funciona, usos e modelos
│   └── globals.css       # Tailwind e tokens de cor claro/escuro
├── catalog/
│   ├── models.ts         # catálogo tipado: modelos, tamanhos, preços em centavos
│   └── models.test.ts
├── components/
│   ├── model-card.tsx          # card do modelo com tamanhos e "a partir de"
│   └── plaque-illustration.tsx # ilustração da plaquinha (sem fotos ainda)
└── lib/
    ├── env-schema.ts     # schemas Zod de ambiente e parseEnv sem vazar valores
    ├── env.ts            # ambiente do servidor (LOG_LEVEL), server-only
    ├── public-env.ts     # NEXT_PUBLIC_WHATSAPP_NUMBER validado (55 + DDD + número)
    ├── logger.ts         # Pino com redação, server-only
    ├── utils.ts          # cn()
    ├── format.ts         # formatPrice(centavos) em BRL
    ├── format.test.ts
    ├── env.test.ts       # testes de ambiente público e do servidor
    └── logger.test.ts    # teste de redação do logger
eslint-rules/             # regras locais quality/* e baseline Next compartilhada
scripts/verify-quality-rules.mjs  # self-check das regras (RuleTester)
```

Implementado: fluxo 1 (vitrine). Fluxos 2 a 7 ainda não existem no código.

## Fronteiras e fluxo

Implementado: a vitrine (`src/app/page.tsx`) é um Server Component estático que lê `src/catalog/models.ts`; não envia JavaScript de componente ao cliente. Planejado: personalização, destino do NFC, QR code e formulário rodam num Client Component que valida com Zod, monta a mensagem e abre `https://wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>?text=<encodeURIComponent(mensagem)>`. Não há Route Handler nem Server Action recebendo pedidos.

Implementado: `src/lib/env.ts` e `src/lib/logger.ts` importam `server-only` e falham se usados no cliente. `src/lib/public-env.ts` não tem `server-only` porque o número é lido no navegador; acessa a variável pelo nome literal para o Next embutir o valor no build.

## Dados e migrations

**Não há persistência.** Decisão do produto para o MVP: catálogo de modelos num arquivo de configuração TypeScript tipado, versionado com o código; o pedido não é salvo no servidor e só existe na mensagem que o próprio cliente envia pelo WhatsApp. Não há `DATABASE_URL`, schema, `drizzle/` nem scripts `db:*`.

Motivos: o fechamento é manual no WhatsApp, não há painel para ler pedidos, e não guardar dados pessoais nem chaves Pix elimina obrigações de armazenamento e custo de banco.

## Decisões

| Decisão | Motivo | Alternativa | Revisar quando |
|---|---|---|---|
| Sem banco; catálogo em código | Requisito explícito do MVP; privacidade e custo | Drizzle + PostgreSQL (default do toolkit) | Houver painel do vendedor, histórico de pedidos ou pagamento online |
| Perfil ESLint leve + `quality/no-direct-console` | Sem Drizzle não há guardas de ORM nem fronteira de dados a aplicar | Perfil completo `next-app` | Banco for adotado |
| Pino e `env.ts` mantidos sem uso atual | Núcleo do toolkit; prontos para o primeiro código de servidor | Remover até haver uso | Se o MVP terminar sem nenhum código de servidor, avaliar remoção |
| `typecheck` roda `next typegen` antes de `tsc` | `LayoutProps`/`PageProps` são tipos gerados; sem isso `tsc` falha num clone limpo | Depender de `next build` prévio | Next mudar a geração de tipos |
| `@types/node@22` | Alinha ao runtime Node 22 e ao peer `^22 \|\| >=24` do Vitest 5 | `^20` do scaffold | Mudança de runtime |
| `@next/env` não instalado | Só era usado pelo `drizzle.config.ts` do template | Instalar alinhado ao Next | Adoção de Drizzle |
| Preços em centavos inteiros, formatados com `Intl.NumberFormat("pt-BR")` | Evita arredondamento binário | `number` em reais | Houver cálculo de frete ou desconto |
| Ilustração CSS/SVG no lugar de fotos | Não há fotos reais; a mesma peça servirá à pré-visualização do fluxo 2 | Imagens de banco | Fotos reais disponíveis |
| QR code gerado no navegador (biblioteca a escolher na tarefa do fluxo 4) | Pré-visualização apenas; nada sai do navegador | Serviço externo de QR | — |

Fontes e datas: `docs/setup.md`.

## Manutenção

Atualize este mapa ao alterar diretórios, dependências relevantes, contratos ou fronteiras. Registre comportamento comprovado; remova decisões que deixaram de valer.
