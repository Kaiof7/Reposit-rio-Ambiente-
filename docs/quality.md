# Qualidade

## Comandos

| Script | O que prova |
|---|---|
| `pnpm lint` | ESLint 9 com presets `core-web-vitals` e `typescript` do Next, teto de 350 linhas (`quality/max-lines`) e proibição de `console` em `src/` (`quality/no-direct-console`) |
| `pnpm typecheck` | `next typegen` + `tsc --noEmit` em modo strict |
| `pnpm lint:rules` | Self-check das regras locais em `eslint-rules/` com o `RuleTester` do ESLint |
| `pnpm test` | Vitest (ambiente Node) para `src/**/*.test.ts` |
| `pnpm build` | Build de produção do Next (não roda lint) |
| `pnpm check` | Todos os anteriores em sequência; para no primeiro erro |

Durante o desenvolvimento, rode `pnpm test:watch` ou `pnpm vitest run <arquivo>` para um teste escopado; rode `pnpm check` antes de concluir uma tarefa.

## Regras de base

- TypeScript strict e presets oficiais do Next.
- Teto de 350 linhas e organização proporcional ao comportamento.
- Logger estruturado só no servidor; nada de `console` no código da aplicação.
- Sem banco no MVP, portanto sem guardas Drizzle nem regra de fronteira de dados; voltam com o perfil completo se houver persistência.
- Validação de entradas e ambiente com Zod; erros de ambiente citam só o nome da variável.

## Estratégia de testes

Existentes: `src/lib/env.test.ts` (nível de log e formato do número de WhatsApp, sem ecoar o valor no erro), `src/lib/logger.test.ts` (redação de segredos), `src/catalog/models.test.ts` (ids únicos, tamanhos conhecidos, preços inteiros positivos, preço inicial) `src/lib/format.test.ts` (BRL a partir de centavos) `src/order/customization.test.ts` (validação da personalização, mensagens por campo e troca de modelo preservando o que o cliente escolheu) `src/order/services.test.ts` (validação só dos serviços pedidos, endereço opcional sem endereço fixo, limites de texto) e `src/order/nfc.test.ts` (criação no lugar do link, exceto Instagram; normalização de links e @perfil, rejeição de esquemas não web e de hosts sem domínio, mensagens do schema).

Para o MVP, cubra com Vitest a lógica pura: schemas Zod do pedido, validação de URL, montagem e codificação da mensagem do WhatsApp e payload do QR Pix. Testes DOM/E2E (Testing Library, Playwright) entram junto dos fluxos que precisarem deles; hoje não existem. Não escreva testes que apenas repetem o código.

## Revisão após implementação ou correção

Ao concluir um ciclo de implementação ou correção, sugira de 3 a 8 ciclos posteriores de code review, com quantidade proporcional ao risco, focos complementares e prompt de continuação preenchido. Essa faixa é convenção do projeto; revisões adicionais dependem de pedido do usuário.

Cada ciclo verifica o estado atual e o código conectado, registra achados com severidade, local e evidência e reavalia correções autorizadas com os checks afetados. Correções da mesma rodada não reiniciam a contagem. Termine com verificação integrada e riscos residuais, sem criar ciclos artificiais ou afirmar que uma quantidade de revisões prova ausência de bugs.

## Dependências e entrega

Confira `pnpm audit --prod` e `pnpm audit`. Estado em 16/10/2026: produção sem vulnerabilidades conhecidas; desenvolvimento com 1 advisory alto em `braces` (GHSA-vfj7-8cjw-p6xm, via `eslint-config-next` → `fast-glob` → `micromatch`), sem versão corrigida publicada. Afeta só ferramentas de lint locais com padrões controlados pelo projeto. Lint/build aprovados não significam auditoria zerada.

Checks são comandos explícitos. Hooks Git, bloqueios de push e exigências de branch não fazem parte do padrão. Atualize este documento junto dos scripts e regras que mudarem.
