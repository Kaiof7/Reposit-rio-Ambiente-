# Sua Plaquinha NFC

Loja online de plaquinhas NFC personalizadas para pequenos negócios brasileiros. O cliente escolhe o modelo, personaliza a arte, informa o link gravado no chip e o QR code opcional, e envia o pedido completo ao vendedor pelo WhatsApp. Detalhes em [PRODUCT.md](PRODUCT.md).

Estado atual: vitrine, personalização (com arte sob medida), link do chip e QR code opcional (com pedido de site ou cadastro no Google) e vitrine de sites, dados do pedido, envio pelo WhatsApp, perguntas frequentes e contato implementados com catálogo de exemplo. Falta validar pendências com o vendedor (ver PRODUCT.md).

## Executar

Requer Node.js 22.12+ (ou 24+; exigência do Vitest 5) e pnpm 10 (`packageManager` no `package.json`).

```bash
pnpm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_WHATSAPP_NUMBER (55 + DDD + número)
pnpm dev                      # http://localhost:3000
pnpm check                    # lint, tipos, regras, testes e build
```

O banco (PostgreSQL) guarda só o catálogo editado no painel `/painel`; sem `DATABASE_URL`, a loja usa o catálogo padrão do código. O login do painel usa `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Com `RESEND_API_KEY`, cada pedido enviado ou copiado também chega como cópia no e-mail da loja (`ORDER_EMAIL_TO`, ou `ADMIN_EMAIL`). O número do WhatsApp do vendedor fica só na variável `NEXT_PUBLIC_WHATSAPP_NUMBER` (na Vercel, em Settings → Environment Variables), nunca no repositório.

## Documentação

- [Produto e escopo](PRODUCT.md).
- [Preparação local](docs/onboarding.md).
- [Estrutura e decisões técnicas](docs/architecture.md).
- [Design e acessibilidade](docs/design.md).
- [Checks de qualidade](docs/quality.md).
- [Instruções para agentes](AGENTS.md).
- [Setup e evidências](docs/setup.md).

## Próxima entrega

MVP completo no código. Próximo passo: validar com o vendedor as pendências acima (preços, número de WhatsApp, chip, respostas do FAQ, sites da vitrine), testar um pedido real num celular com o WhatsApp instalado e, com autorização, publicar um preview. Pendências externas: preços, fotos, número de WhatsApp e respostas do FAQ, a informar pelo vendedor.
