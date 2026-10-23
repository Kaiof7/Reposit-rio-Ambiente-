# Preparação local

## Pré-requisitos

- Node.js `^22.12.0` ou `>=24` (`node -v`). O Vitest 5 não roda em Node 20.
- pnpm 10 (`pnpm -v`); a versão exata está em `packageManager` no `package.json`. Com Corepack: `corepack enable`.
- Git. Nenhuma outra ferramenta é necessária para desenvolver.

## Primeira execução

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Variáveis (`.env.example`):

- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número do vendedor, só dígitos, `55` + DDD + número. Em produção fica na Vercel; para testes locais use o seu próprio número. Não versione o valor real.
- `LOG_LEVEL`: nível do Pino no servidor (`info` por padrão).

`.env.local` é ignorado pelo Git. Variáveis `NEXT_PUBLIC_*` são embutidas no build: reinicie o `pnpm dev` após alterá-las e, em produção, gere um novo build.

## Banco

O banco é opcional no desenvolvimento: sem `DATABASE_URL`, a loja usa o catálogo padrão do código e o painel não salva.

Para testar o painel localmente, use um PostgreSQL local (nunca o de produção), defina `DATABASE_URL` e `ADMIN_PASSWORD` em `.env.local` e aplique as migrações com `pnpm db:migrate`. Ao mudar `src/db/schema/`, rode `pnpm db:generate`, revise o SQL gerado em `drizzle/` e versione-o.

Em produção (Vercel): Storage → banco Neon ligado ao projeto define `DATABASE_URL` e `DATABASE_URL_UNPOOLED`; o build de produção roda `scripts/migrate.mjs`, que aplica as migrações pendentes. Builds de preview e locais pulam essa etapa.

## Verificar

```bash
pnpm check
```

Roda lint, typecheck, self-check das regras ESLint, testes e build. Não precisa de credenciais nem de rede além do download da fonte Geist no build. Resultado esperado: todos os passos concluídos com código 0.

## Agentes

Leia [AGENTS.md](../AGENTS.md). [CLAUDE.md](../CLAUDE.md) importa as mesmas instruções. Consulte [setup.md](setup.md) para skills locais, plugins, integrações e escopos configurados. Ao abrir o projeto no Claude Code, aceite a confiança do diretório para carregar os plugins e o MCP declarados em `.claude/settings.json` e `.mcp.json`.

## Dificuldades conhecidas

- `tsc --noEmit` isolado falha com `Cannot find name 'LayoutProps'` num clone limpo: os tipos de rota são gerados. Use `pnpm typecheck`, que roda `next typegen` antes.
