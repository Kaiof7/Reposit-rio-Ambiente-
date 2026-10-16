# Setup e evidências

## Origem e contexto

- Data da verificação: 16/10/2026.
- Receita: [Vibe Coding Toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit), revisão única `f13bb354363dafef8ce8d8f605856cc9e1cc52cc` (15/10/2026), prompt 11 (`docs/prompts/11-next-project-bootstrap.md`). O toolkit foi clonado num diretório temporário fora da aplicação; só templates dessa revisão foram copiados.
- Produto: Plaquinhas NFC (ver `PRODUCT.md`).
- Cliente: Claude Code 2.1.301 numa sessão em nuvem (contêiner efêmero, Linux). Modelo e autenticação da sessão preservados; nenhum subagente ou provedor adicional usado.
- Runtime: Node.js 22.22.0, pnpm 10.28.0.
- Destino: repositório existente com `README.md` de uma linha e `.git`; scaffold gerado em pasta temporária e incorporado sem sobrescrever.

## Decisões e fontes

| Decisão | Motivo | Fonte |
|---|---|---|
| `create-next-app@16.4.2` (dist-tag `latest`) | Canal estável; `rc`, `beta`, `preview` e `canary` ignorados | `npm view next dist-tags`, `create-next-app --help` (16/10/2026) |
| Flags `--typescript --tailwind --eslint --app --src-dir --import-alias '@/*' --use-pnpm --disable-git --no-react-compiler --no-cache-components --no-agent-feedback --agents-md --yes` | Defaults do toolkit; flags negativas evitam preferências salvas; Git já existia | Toolkit `docs/04-project-bootstrap.md` |
| Sem Drizzle/PostgreSQL/`pg`/`drizzle-kit`/`@next/env` | Produto sem persistência no MVP (decisão explícita do usuário) | `PRODUCT.md`, `docs/architecture.md` |
| Perfil ESLint leve + `quality/no-direct-console` | Sem banco, as guardas Drizzle e a fronteira de dados não se aplicam; logger existe, então `console` continua proibido | Toolkit `templates/eslint/next.config.mjs.example` e `next-app.config.mjs.example` |
| `typecheck` = `next typegen && tsc --noEmit` | `LayoutProps` gerado pelo Next 16 faltava num clone limpo (`TS2304`) | Erro observado; `next typegen --help` |
| `@types/node@22` e `engines.node` `^22.12.0 \|\| >=24.0.0` | Runtime Node 22; Vitest 5.0.5 exige esse intervalo e peer `@types/node ^22 \|\| >=24` | `npm view vitest peerDependencies`, `engines` do pacote |
| `.env.example` sem `DATABASE_URL`, com `NEXT_PUBLIC_WHATSAPP_NUMBER` | Requisito do produto; número validado por Zod em `src/lib/public-env.ts` | `PRODUCT.md` |
| `.gitignore`: `!.env.example` e `graphify-out/` | Permitir versionar o exemplo; grafo é gerado localmente | Toolkit `docs/04-project-bootstrap.md` |
| Home provisória em pt-BR, remoção dos SVGs do scaffold | Página padrão do Next estava em inglês e usava os SVGs | — |
| Biblioteca de QR code não instalada | Dependência entra junto do fluxo 4, não antecipada | Toolkit `docs/06-project-defaults.md` |

Context7 não pôde ser consultado (ver Verificações); as decisões de API se basearam em `--help` das CLIs, registry npm e `node_modules/next/dist/docs/`.

## Componentes

| Componente | Ação e motivo | Escopo | Estado e evidência |
|---|---|---|---|
| Next 16.4.2, React 19.3.0, TS 5.9.3, Tailwind 4.3.3, ESLint 9.39.5 | Scaffold oficial estável | Projeto | Validado: `pnpm check` verde |
| Zod 4.6.7, server-only 0.0.1, Pino 10.4.0, clsx 2.1.1, tailwind-merge 3.7.0, Vitest 5.0.5 | Núcleo do toolkit | Projeto | Validado: 4 testes passando |
| Drizzle ORM, PostgreSQL/`pg`, drizzle-kit, eslint-plugin-drizzle, `@next/env` | Omitidos: produto sem persistência | — | Decisão registrada |
| `templates/next/src/lib/*` | Copiados; `env-schema`/`env`/teste adaptados sem banco; `public-env.ts` novo | Projeto | Validado por testes |
| `eslint-rules/` completo + `scripts/verify-quality-rules.mjs` | Copiados da revisão | Projeto | Validado: `pnpm lint:rules` |
| Skills Vercel (8 web) + `find-skills` | `skills@1.7.2 add ... --agent claude-code`; catálogo upstream idêntico ao do toolkit (`--list`) | Projeto: `.claude/skills/`, `skills-lock.json` | Arquivos presentes e `skills list` confirma os 9 nomes; descoberta numa sessão nova: pendente. Com um único agente a CLI copiou direto para `.claude/skills/` (sem `.agents/skills/`) |
| `vercel-react-native-skills` | Não instalada: produto só web | — | Decisão |
| Superpowers 7.0.0 (`claude-plugins-official`) | Ausente no host; instalado com `--scope project` | Projeto: `.claude/settings.json` | Instalado e habilitado (`claude plugin list`); descoberta numa sessão nova: pendente |
| Ponytail 5.3.1 | Idem; intensidade `full` é o padrão do plugin; opções opcionais (ledger/webhook) não configuradas | Projeto | Instalado e habilitado; descoberta pendente |
| Caveman 4.0.1 | Idem | Projeto | Instalado e habilitado; a CLI avisou que dependências npm do plugin não foram instaladas (lockfile pnpm); descoberta pendente |
| Context7 | Nenhuma conexão ativa; MCP remoto declarado em `.mcp.json` (sem token) | Projeto | Configurado sem execução: a política de rede do ambiente recusou `mcp.context7.com` (HTTP 403 no proxy) |
| RTK | Binário ausente no host | — | Pendente: não instalado (binário global, fora do escopo); comandos rodaram sem wrapper |
| Graphify (`graphifyy` 0.9.91) | CLI ausente; instalada no site-packages do usuário do contêiner efêmero só para gerar o grafo inicial; `graphify install` (skill global) não executado | Contêiner temporário | Validado: `graphify extract . --code-only --no-cluster` gerou 123 nós/155 arestas cobrindo `src/`, `eslint-rules/`, `scripts/` e configs; `.graphifyignore` copiado. Grafo não versionado |
| Codex | Não usado neste projeto | — | Sem `.codex/config.toml` |

## Documentação criada

`PRODUCT.md`, `README.md` (substitui o README de uma linha do repositório), `AGENTS.md` (incorpora o bloco `nextjs-agent-rules` gerado pelo Next, preservado no fim), `CLAUDE.md` (`@AGENTS.md`), `docs/architecture.md`, `docs/design.md`, `docs/onboarding.md`, `docs/quality.md` e este arquivo. Não havia `product.md` anterior.

## Verificações

| Item | Estado | Evidência |
|---|---|---|
| `pnpm lint` | Validado | Sem erros nem avisos |
| `pnpm typecheck` | Validado | `next typegen` + `tsc --noEmit` sem erros |
| `pnpm lint:rules` | Validado | Self-check concluído sem falhas |
| `pnpm test` | Validado | 2 arquivos, 4 testes passando, sem credenciais |
| `pnpm build` | Validado | Rotas `/` e `/_not-found` estáticas |
| `pnpm check` | Validado | Código de saída 0 após `rm -rf .next` |
| `pnpm audit --prod` | Validado | Sem vulnerabilidades conhecidas |
| `pnpm audit` | Validado com ressalva | 1 alto em `braces` (GHSA-vfj7-8cjw-p6xm), só desenvolvimento via `eslint-config-next`, sem versão corrigida publicada; nenhum downgrade forçado |
| HTTP | Validado | `pnpm start` em porta livre aleatória: `GET /` → 200, `<html lang="pt-BR">`, título "Plaquinhas NFC" |
| Console do navegador | Validado | Chromium/Playwright emulando Pixel 7: 0 erros/avisos na home |
| Banco / SQL | Não aplicável | Sem persistência |
| Context7 (consulta real) | Pendente | Host bloqueado pela política de rede |
| Descoberta de skills/plugins em sessão nova | Pendente | Só presença em disco e `skills list`/`claude plugin list` verificados |

Recursos temporários: clone do toolkit, scaffold e logs no diretório de rascunho da sessão; servidor `next start` encerrado após o teste. Nenhum hook Git, automação de refresh ou deploy foi criado.

## Pendências e próxima entrega

- Liberar `mcp.context7.com` na política de rede do ambiente (Network access → Allowed domains) e fazer uma consulta real.
- Abrir uma sessão nova do Claude Code no projeto, aceitar a confiança e confirmar descoberta das skills e dos plugins.
- RTK ausente: instalar no ambiente de desenvolvimento, se desejado, fora deste setup.
- Decisões do vendedor: preços, fotos, número de WhatsApp, respostas do FAQ, contato, hospedagem (ver `PRODUCT.md`).
- Advisory de `braces`: reavaliar quando houver versão corrigida ou novo `eslint-config-next`.

Fluxos 1 a 4, serviços extras e vitrine de sites entregues em 16/10/2026; evidências em `docs/design.md`. Dependências adicionadas: `qrcode-generator` 2.0.4 (produção) e `jsqr` 1.4.0 (desenvolvimento). Fluxos 5 e 6 (dados e envio pelo WhatsApp) também entregues; o teste de ponta a ponta usou um número fictício só na variável de ambiente do processo de teste, sem versionar. Fluxo 7 (perguntas frequentes e contato) entregue; todos os fluxos do MVP estão no código. Próximo passo em `PRODUCT.md`.

Revisão sugerida após essa entrega: **3 ciclos** de code review (escopo pequeno, sem dados sensíveis ainda), focos: (1) acessibilidade e mobile da vitrine, (2) tipagem do catálogo e Server/Client boundaries, (3) integração e checks. Prompt:

```text
Faça 3 ciclos de code review do catálogo e da vitrine: 1) acessibilidade/mobile com web-design-guidelines; 2) tipos do catálogo e limites Server/Client com vercel-react-best-practices; 3) revisão integrada. Registre achados com severidade, local e evidência, corrija os autorizados e rode pnpm check ao final.
```
