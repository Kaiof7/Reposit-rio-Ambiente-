# Plaquinhas NFC

Loja online de plaquinhas NFC personalizadas para pequenos negócios. O cliente monta o pedido no site e o envia ao vendedor pelo WhatsApp.

## Problema e objetivo

Donos de pequenos negócios querem que seus clientes avaliem no Google, paguem via Pix ou abram o site/Instagram só aproximando o celular de uma plaquinha no balcão, ou lendo um QR code impresso nela. Eles não sabem configurar NFC nem criar a arte. Hoje o pedido acontece por conversa solta no WhatsApp, com idas e vindas e informações faltando.

Objetivo: o cliente escolhe e personaliza a plaquinha sozinho, pelo celular, e chega ao WhatsApp do vendedor com uma mensagem completa e organizada, pronta para fechar o pedido.

## Público e papéis

- **Cliente (comprador):** dono de restaurante, salão, loja ou profissional autônomo no Brasil. Pouco técnico, compra pelo celular. Único papel do site; não há login.
- **Vendedor:** recebe a mensagem no WhatsApp, produz a arte final, grava o chip e combina pagamento e entrega fora do site. Não usa painel no MVP.

## Fluxos da versão inicial

1. **Vitrine.** Página inicial explica que a plaquinha NFC abre um link quando o celular se aproxima, mostra exemplos de uso e os modelos disponíveis (avaliação Google, Pix, link/site, Instagram, cardápio) com foto, tamanhos e preço "a partir de". Resultado: o cliente escolhe um modelo e inicia a personalização.
2. **Personalização do adesivo.** O cliente escolhe modelo, tamanho e cor/fundo, escreve o nome do negócio e a chamada (ex.: "Avalie a gente!") e indica se vai enviar o logo. Uma pré-visualização simples da arte acompanha as escolhas.
3. **Conteúdo do NFC.** O cliente informa o destino gravado no chip: link de avaliação do Google, site, Instagram, cardápio ou outro link. O site valida se é uma URL válida e mostra uma ajuda curta para encontrar o link de avaliação do Google.
4. **QR code opcional.** O cliente decide se quer QR code impresso e para onde ele aponta: chave Pix (tipo, chave e nome do recebedor) ou um link. O navegador gera uma pré-visualização do QR code.
5. **Dados do pedido.** Nome, telefone/WhatsApp, cidade/CEP, quantidade e observações, somados às escolhas anteriores. Validação com Zod no cliente, com erro junto do campo.
6. **Envio pelo WhatsApp.** Ao confirmar, o site mostra um resumo e, em seguida, abre `https://wa.me/<número do vendedor>?text=<mensagem codificada>` com todas as informações organizadas e legíveis.
7. **Páginas de apoio.** Perguntas frequentes (funciona em iPhone e Android? precisa de app? dá para trocar o link depois?) e contato.

## MVP

Em ordem de prioridade:

1. Catálogo tipado de modelos e vitrine.
2. Personalização com pré-visualização da arte.
3. Destino do NFC com validação de URL e ajuda do Google.
4. QR code opcional (Pix ou link) com pré-visualização no navegador.
5. Formulário de pedido validado com Zod.
6. Resumo e abertura do WhatsApp com a mensagem completa.
7. FAQ e contato.

## Fora de escopo

- Pagamento online, login, contas e painel administrativo. O pedido é fechado pelo WhatsApp.
- Banco de dados e persistência de pedidos no servidor (evolução futura, ver abaixo).
- Upload de logo: o cliente marca no formulário que enviará o logo pelo WhatsApp.
- Geração da arte final e do QR code definitivo: o site faz só pré-visualização; o vendedor produz a arte.
- Envio automático de mensagens: o próprio cliente envia a mensagem no WhatsApp dele.

## Requisitos

- Interface 100% em português do Brasil, mobile-first e rápida em rede móvel.
- Acessibilidade: navegação por teclado, foco visível, contraste adequado, rótulo em todos os campos e erros associados ao campo.
- URLs do NFC e do QR code validadas antes do envio.
- Mensagem do WhatsApp com todas as escolhas e dados do pedido, codificada corretamente para a URL `wa.me`.
- Número do vendedor configurável em `NEXT_PUBLIC_WHATSAPP_NUMBER` (somente dígitos, `55` + DDD + número), documentado em `.env.example`. Nenhum número real fica versionado.
- Privacidade: o site não armazena dados do cliente nem chaves Pix. Os dados existem apenas no navegador durante o preenchimento e na mensagem que o próprio cliente envia.
- Sem erros no console do navegador.

## Restrições e decisões técnicas

- Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, pnpm, Node.js 22. Detalhes em `docs/architecture.md` e `docs/setup.md`.
- **Sem banco de dados no MVP.** O catálogo de modelos fica num arquivo de configuração tipado no código; o pedido não é salvo no servidor e segue apenas na mensagem do WhatsApp. Justificativa: o fechamento acontece no WhatsApp, não há painel para consultar pedidos e não guardar dados pessoais nem chaves Pix reduz risco e custo de operação. Por isso o default do toolkit (Drizzle ORM + PostgreSQL) não foi instalado. **Evolução futura:** persistir pedidos (Drizzle + PostgreSQL) quando houver painel do vendedor, histórico ou pagamento online; isso exigirá política de privacidade e retenção de dados.
- Validação com Zod no cliente; não há rota de servidor recebendo pedidos.
- O QR code é gerado no navegador apenas para pré-visualização.

## Hipóteses e pendências

Hipóteses reversíveis (podem mudar sem retrabalho grande):

- **Catálogo, tamanhos, cores e preços "a partir de": a definir.** O código usará valores de exemplo, marcados como tal, até o vendedor informar os reais.
- **Fotos dos modelos: a definir.** Até existirem fotos reais, a vitrine usa ilustrações/placeholders identificados.
- Quantidade mínima por pedido: 1; máxima de exemplo, a definir com o vendedor.
- O QR code Pix da pré-visualização segue o formato BR Code estático (Pix "copia e cola"), montado no navegador com tipo/chave/nome do recebedor e cidade do pedido. A arte final continua a cargo do vendedor.
- Texto da ajuda para achar o link de avaliação do Google: redigido a partir da documentação pública do Google Perfil da Empresa, revisado pelo vendedor.

Pendências que dependem do vendedor (não inventar):

- Número real de WhatsApp para `NEXT_PUBLIC_WHATSAPP_NUMBER` (configurado só no ambiente de deploy).
- Respostas oficiais do FAQ quanto a regravação do chip ("dá para trocar o link depois?"), prazos de produção e frete.
- Dados de contato exibidos na página de contato.
- Hospedagem e domínio (publicação depende de autorização).

## Critérios de aceitação

Produto:

- Pelo celular, o cliente escolhe um modelo, personaliza o adesivo, informa o link do NFC, configura o QR code opcional, preenche seus dados, vê o resumo e abre o WhatsApp com a mensagem completa e correta.
- URLs inválidas e campos obrigatórios vazios mostram erro junto do campo e impedem o envio.
- Todo o fluxo funciona só com teclado, com rótulos e foco visível.
- Nenhum erro no console do navegador durante o fluxo.

Técnicos:

- `pnpm check` (lint, typecheck, self-check das regras, testes e build) passa sem credenciais.
- A montagem da mensagem do WhatsApp e os schemas Zod têm testes Vitest.

## Próxima entrega

Personalização do adesivo (fluxo 2): página com escolha de modelo, tamanho e cor, texto do negócio e chamada, aviso de envio do logo e pré-visualização reutilizando `PlaqueIllustration`; cards da vitrine ganham o botão "Personalizar". Critério: no celular, a pré-visualização muda conforme as escolhas, tudo operável por teclado, `pnpm check` verde.

## Manutenção

Atualize este documento quando objetivo, escopo, restrições ou critérios de aceitação mudarem. Decisões técnicas e evidências detalhadas ficam em `docs/architecture.md` e `docs/setup.md`.
