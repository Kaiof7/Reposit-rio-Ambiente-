# Plaquinhas NFC

Loja online de plaquinhas NFC personalizadas para pequenos negócios brasileiros. O cliente escolhe o modelo, personaliza a arte, informa o link gravado no chip e o QR code opcional, e envia o pedido completo ao vendedor pelo WhatsApp. Detalhes em [PRODUCT.md](PRODUCT.md).

Estado atual: vitrine, personalização (com arte sob medida), link do chip (com pedido de site ou cadastro no Google) e vitrine de sites implementados com catálogo de exemplo; QR code, dados do pedido, envio pelo WhatsApp e páginas de apoio pendentes.

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

QR code opcional (fluxo 4): etapa para escolher se a plaquinha terá QR code impresso e para onde aponta (chave Pix com tipo, chave e nome do recebedor, ou um link), com validação Zod e pré-visualização do QR code gerado no navegador. Critério: QR legível pela câmera do celular na prévia, Pix no formato BR Code, nada armazenado, `pnpm check` verde. Pendências externas: preços, fotos, número de WhatsApp e respostas do FAQ, a informar pelo vendedor.
