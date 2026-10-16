# Plaquinhas NFC

Loja online de plaquinhas NFC personalizadas para pequenos negócios brasileiros. O cliente escolhe o modelo, personaliza a arte, informa o link gravado no chip e o QR code opcional, e envia o pedido completo ao vendedor pelo WhatsApp. Detalhes em [PRODUCT.md](PRODUCT.md).

Estado atual: vitrine, personalização (com arte sob medida), link do chip e QR code opcional (com pedido de site ou cadastro no Google) e vitrine de sites, dados do pedido e envio pelo WhatsApp implementados com catálogo de exemplo; páginas de apoio (FAQ e contato) pendentes.

## Executar

Requer Node.js 22.12+ (ou 24+; exigência do Vitest 5) e pnpm 10 (`packageManager` no `package.json`).

```bash
pnpm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_WHATSAPP_NUMBER (55 + DDD + número)
pnpm dev                      # http://localhost:3000
pnpm check                    # lint, tipos, regras, testes e build
```

Não há banco de dados nem credenciais privadas. O número do WhatsApp é público por natureza (vai no link `wa.me`), mas o número real não é versionado.

## Documentação

- [Produto e escopo](PRODUCT.md).
- [Preparação local](docs/onboarding.md).
- [Estrutura e decisões técnicas](docs/architecture.md).
- [Design e acessibilidade](docs/design.md).
- [Checks de qualidade](docs/quality.md).
- [Instruções para agentes](AGENTS.md).
- [Setup e evidências](docs/setup.md).

## Próxima entrega

Páginas de apoio (fluxo 7): perguntas frequentes (funciona em iPhone e Android? precisa de app? dá para trocar o link depois?) e contato, com links no topo/rodapé. Respostas que dependem do vendedor ficam marcadas como pendentes. Critério: páginas acessíveis pelo celular, sem erro no console, `pnpm check` verde. Pendências externas: preços, fotos, número de WhatsApp e respostas do FAQ, a informar pelo vendedor.
