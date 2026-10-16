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
│   ├── personalizar/page.tsx # pedido em etapas (lê ?modelo=, padrão: primeiro modelo)
│   ├── perguntas-frequentes/page.tsx # FAQ estático
│   ├── contato/page.tsx     # WhatsApp da loja; renderizada por requisição (connection())
│   └── globals.css       # Tailwind e tokens de cor claro/escuro
├── catalog/
│   ├── models.ts         # catálogo tipado: modelos, tamanhos, cores, preços em centavos
│   ├── services.ts       # serviços extras (site, Google, arte sob medida) e sites da vitrine
│   └── models.test.ts
├── components/
│   ├── site-header.tsx         # cabeçalho com navegação (layout raiz)
│   ├── order-flow.tsx          # Client Component: estado do pedido e navegação entre etapas
│   ├── customize-form.tsx      # etapa 1: escolhas, textos, logo e prévia
│   ├── nfc-link-step.tsx       # etapa 2: destino e link do chip, ajuda do Google, "ainda não tenho"
│   ├── qr-code-step.tsx        # etapa 3: QR code opcional (Pix ou link) com prévia
│   ├── qr-preview.tsx          # SVG do QR code (preto no branco nos dois temas)
│   ├── customer-step.tsx       # dados do cliente, quantidade e valor de referência
│   ├── summary-step.tsx        # resumo = mensagem exata; Enviar pelo WhatsApp e Copiar
│   ├── service-details-step.tsx # etapa condicional: dados para criar site e/ou cadastro no Google
│   ├── text-field.tsx          # campo de texto/área com rótulo, dica e erro ligados
│   ├── styles.ts               # classes Tailwind compartilhadas dos controles
│   ├── model-card.tsx          # card do modelo com tamanhos, "a partir de" e Personalizar
│   └── plaque-illustration.tsx # ilustração/prévia da plaquinha (cor, formato, logo)
├── order/
│   ├── customization.ts        # schema Zod da personalização e regras de troca de modelo
│   ├── customization.test.ts
│   ├── nfc.ts                  # destinos, normalização do link e schema Zod do chip
│   ├── nfc.test.ts
│   ├── pix.ts                  # chaves Pix (CPF/CNPJ com dígitos, celular, e-mail, aleatória) e payload BR Code com CRC16
│   ├── pix.test.ts
│   ├── qr.ts                   # schema Zod da etapa do QR code
│   ├── qr.test.ts
│   ├── customer.ts             # schema Zod dos dados do cliente (telefone, CEP, quantidade)
│   ├── customer.test.ts
│   ├── assemble.ts             # revalida todas as etapas e monta o pedido
│   ├── assemble.test.ts
│   ├── message.ts              # texto da mensagem do WhatsApp e link wa.me
│   ├── message.test.ts
│   ├── services.ts             # schema Zod dos dados dos serviços extras, validação só dos pedidos
│   ├── services.test.ts
│   └── field-errors.ts         # primeira mensagem por campo a partir de um ZodError
└── lib/
    ├── env-schema.ts     # schemas Zod de ambiente e parseEnv sem vazar valores
    ├── env.ts            # ambiente do servidor (LOG_LEVEL), server-only
    ├── public-env.ts     # NEXT_PUBLIC_WHATSAPP_NUMBER validado (55 + DDD + número)
    ├── logger.ts         # Pino com redação, server-only
    ├── utils.ts          # cn()
    ├── format.ts         # formatPrice(centavos) em BRL
    ├── qr.ts             # matriz do QR code (qrcode-generator, correção M)
    ├── qr.test.ts        # decodifica o QR gerado com jsQR
    ├── format.test.ts
    ├── env.test.ts       # testes de ambiente público e do servidor
    └── logger.test.ts    # teste de redação do logger
eslint-rules/             # regras locais quality/* e baseline Next compartilhada
scripts/verify-quality-rules.mjs  # self-check das regras (RuleTester)
```

Implementado: fluxos 1 a 9 do PRODUCT.md.

## Fronteiras e fluxo

Implementado: a vitrine (`src/app/page.tsx`) é um Server Component estático que lê `src/catalog/models.ts`; não envia JavaScript de componente ao cliente. `/personalizar` é renderizada sob demanda (lê `searchParams`) e entrega `OrderFlow`, o Client Component que guarda o estado de todas as etapas no navegador; cada etapa valida com seu schema (`customizationSchema`, `nfcSchema`, `qrSchema`, `validateServiceDetails`) antes de avançar. A lista de etapas é derivada do estado: a etapa de serviços só existe quando o cliente pede criação de site ou cadastro no Google, no chip ou no QR code. No resumo, `assembleOrder` revalida todas as etapas e `buildOrderMessage` gera o texto; o botão é um link `https://wa.me/<número>?text=<encodeURIComponent(mensagem)>` aberto em nova aba. Nada é enviado ao servidor. Planejado: destino do NFC, QR code e formulário rodam num Client Component que valida com Zod, monta a mensagem e abre `https://wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>?text=<encodeURIComponent(mensagem)>`. Não há Route Handler nem Server Action recebendo pedidos.

O número do vendedor é lido no servidor por `src/app/personalizar/page.tsx` e `src/app/contato/page.tsx` (`findWhatsAppNumber`, que devolve `null` se ausente ou inválido) e passado como prop ao `OrderFlow`; com `null`, o resumo e o contato mostram um aviso. As duas páginas são renderizadas por requisição (`searchParams` e `connection()`). Atenção: o Next substitui `process.env.NEXT_PUBLIC_*` pelo valor do momento do `next build`, inclusive no servidor. Valor definido no build fica fixo até o próximo build (verificado em 16/10/2026: build com um número e servidor iniciado com outro mostrou o do build); sem valor no build, o número é lido na execução. Na prática, trocar o número exige novo build. O nome `NEXT_PUBLIC_*` segue o pedido do produto (valor público por natureza).

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
| Ilustração CSS/SVG no lugar de fotos | Não há fotos reais; a mesma peça é a prévia da personalização, dimensionada em `cqw` | Imagens de banco | Fotos reais disponíveis |
| Etapas no mesmo Client Component, sem rota por etapa | Estado único em memória, voltar não perde nada, sem persistência | Uma rota por etapa com estado na URL | Precisar compartilhar ou retomar um pedido |
| Link do chip normalizado (`https://` em domínio puro, `@perfil` → link do Instagram) e restrito a http(s) com domínio | Cliente pouco técnico cola links incompletos; bloqueia `javascript:`/`mailto:` | Exigir URL completa | Chip definido com limite de tamanho |
| Serviços extras como dados no catálogo, sem preço | Preços indefinidos; o fechamento é no WhatsApp | Preço fixo no site | Vendedor definir valores |
| Vitrine de sites com ilustração de navegador | O domínio de exemplo não foi acessível no ambiente de desenvolvimento para captura | Captura de tela em `public/` | Captura real disponível |
| Resumo exibe a própria mensagem do WhatsApp | O cliente confere exatamente o que será enviado; uma só fonte de texto | Resumo visual separado | — |
| Número do WhatsApp lido no servidor e passado como prop | Uma fonte (`findWhatsAppNumber`), aviso quando ausente; o número aparece no HTML, o que é esperado por ser público | Ler `process.env.NEXT_PUBLIC_*` em Client Component | Precisar trocar o número sem novo build: renomear para variável sem `NEXT_PUBLIC_` |
| Estado da personalização só em memória no cliente | Sem persistência; recarregar a página recomeça (exceto o modelo, vindo de `?modelo=`) | URL com todos os campos ou `localStorage` | Clientes perderem dados com frequência |
| QR code gerado no navegador com `qrcode-generator` 2.0.4 | Sem dependências, tipos próprios, MIT; `qrcode` traz `yargs`/`pngjs`; `uqr` ainda é 0.x | Serviço externo de QR (enviaria a chave Pix a terceiros) | — |
| Payload Pix montado no próprio código | Formato público e curto; testado contra o exemplo do manual do BR Code do Banco Central (CRC `1D3D`) | Biblioteca de Pix | Precisar de QR dinâmico ou valor |
| `jsqr` 1.4.0 só em desenvolvimento | Teste de ida e volta prova que o QR gerado é legível | Confiar só na biblioteca geradora | — |

Fontes e datas: `docs/setup.md`.

## Manutenção

Atualize este mapa ao alterar diretórios, dependências relevantes, contratos ou fronteiras. Registre comportamento comprovado; remova decisões que deixaram de valer.
