# Sua Plaquinha NFC

Loja online de plaquinhas NFC personalizadas para pequenos negócios. O cliente monta o pedido no site e o envia ao vendedor pelo WhatsApp.

## Problema e objetivo

Donos de pequenos negócios querem que seus clientes avaliem no Google, paguem via Pix ou abram o site/Instagram só aproximando o celular de uma plaquinha no balcão, ou lendo um QR code impresso nela. Eles não sabem configurar NFC nem criar a arte. Hoje o pedido acontece por conversa solta no WhatsApp, com idas e vindas e informações faltando.

Objetivo: o cliente escolhe e personaliza a plaquinha sozinho, pelo celular, e chega ao WhatsApp do vendedor com uma mensagem completa e organizada, pronta para fechar o pedido.

## Público e papéis

- **Cliente (comprador):** dono de restaurante, salão, loja ou profissional autônomo no Brasil. Pouco técnico, compra pelo celular. Não faz login.
- **Vendedor:** recebe a mensagem no WhatsApp, produz a arte final, grava o chip e combina pagamento e entrega fora do site. Usa o painel `/painel` (senha única) para manter tamanhos, preços, disponibilidade dos modelos e estoque ("Esgotado").

## Fluxos da versão inicial

1. **Vitrine.** Página inicial explica que a plaquinha NFC abre um link quando o celular se aproxima, mostra exemplos de uso e os modelos disponíveis (avaliação Google, Pix, link/site, Instagram, cardápio) com foto, tamanhos e preço "a partir de". Resultado: o cliente escolhe um modelo e inicia a personalização.
2. **Personalização do adesivo.** O cliente escolhe modelo, tamanho e cor/fundo, escreve o nome do negócio e a chamada (ex.: "Avalie a gente!") e indica se vai enviar o logo. Uma pré-visualização simples da arte acompanha as escolhas.
3. **Conteúdo do NFC.** O cliente informa o destino gravado no chip: link de avaliação do Google, site, Instagram, cardápio ou outro link. O site valida se é uma URL válida e mostra uma ajuda curta para encontrar o link de avaliação do Google.
4. **QR code opcional.** O cliente decide se quer QR code impresso e para onde ele aponta: chave Pix (tipo, chave, nome e cidade do recebedor; a cidade é exigida pelo padrão BR Code) ou um link (o mesmo do chip, outro link, ou um site a ser criado pela equipe). O navegador gera uma pré-visualização do QR code.
5. **Dados do pedido.** Nome, telefone/WhatsApp, cidade/CEP, quantidade e observações, somados às escolhas anteriores. Validação com Zod no cliente, com erro junto do campo.
6. **Envio pelo WhatsApp.** Ao confirmar, o site mostra um resumo e, em seguida, abre `https://wa.me/<número do vendedor>?text=<mensagem codificada>` com todas as informações organizadas e legíveis.
7. **Páginas de apoio.** Perguntas frequentes (funciona em iPhone e Android? precisa de app? dá para trocar o link depois?) e contato.
8. **Serviços extras (pedido junto com a plaquinha).** Quem ainda não tem o link pode marcar "Ainda não tenho. Quero que vocês façam" no destino do chip (e, no fluxo 4, no QR code com link): **criação de site** (também para cardápio digital ou outro link) ou **cadastro no Google** (Perfil da Empresa, para receber avaliações). Uma etapa extra coleta o mínimo para começar: ramo, conteúdo e links do site; categoria e endereço (ou atendimento sem endereço fixo) do Google. Na personalização, o cliente pode pedir **arte sob medida**, feita à mão por um profissional de mídia, com observações opcionais. Tudo segue na mesma mensagem do WhatsApp.
9. **Vitrine de sites.** Seção "Sites que já fizemos" na home, com sites reais feitos pela equipe, para dar credibilidade. Exemplo inicial: https://orcamento-assistencia-celular.vercel.app.

## MVP

Em ordem de prioridade:

1. Catálogo tipado de modelos e vitrine.
2. Personalização com pré-visualização da arte.
3. Destino do NFC com validação de URL e ajuda do Google.
4. QR code opcional (Pix ou link) com pré-visualização no navegador.
5. Formulário de pedido validado com Zod.
6. Resumo e abertura do WhatsApp com a mensagem completa.
7. FAQ e contato.
8. Serviços extras: criação de site, cadastro no Google e arte sob medida, pedidos junto com a plaquinha.
9. Vitrine de sites feitos pela equipe.

## Fora de escopo

- Pagamento online e contas de cliente. O pedido é fechado pelo WhatsApp.
- Persistência de pedidos no servidor (evolução futura). O banco guarda só o catálogo editado no painel.
- Criar ou renomear modelos pelo painel: os 5 modelos (textos, ícones, comportamento do Pix e do NFC) continuam no código.
- Baixa automática de estoque: como o pedido fecha no WhatsApp, o vendedor marca "Esgotado" manualmente.
- Upload de logo: o cliente marca no formulário que enviará o logo pelo WhatsApp.
- Geração da arte final e do QR code definitivo: o site faz só pré-visualização; o vendedor produz a arte.
- Envio automático de mensagens: o próprio cliente envia a mensagem no WhatsApp dele.
- Criação de perfil no Instagram: a conta precisa ser aberta pelo dono; o site só pede o @.
- Execução dos serviços extras pelo site: o site só coleta o pedido; site, cadastro e arte são feitos pela equipe fora dele.

## Requisitos

- Interface 100% em português do Brasil, mobile-first e rápida em rede móvel.
- Acessibilidade: navegação por teclado, foco visível, contraste adequado, rótulo em todos os campos e erros associados ao campo.
- URLs do NFC e do QR code validadas antes do envio.
- Mensagem do WhatsApp com todas as escolhas e dados do pedido, codificada corretamente para a URL `wa.me`.
- Número do vendedor configurável em `NEXT_PUBLIC_WHATSAPP_NUMBER` (somente dígitos, `55` + DDD + número), documentado em `.env.example`. O número real não fica no repositório: é o número pessoal do vendedor e o repositório é público.
- Privacidade: o site não armazena dados do cliente nem chaves Pix. Os dados existem apenas no navegador durante o preenchimento e na mensagem que o próprio cliente envia.
- Sem erros no console do navegador.

## Restrições e decisões técnicas

- Nome da loja: **Sua Plaquinha NFC**, escolhido pelo vendedor em 16/10/2026 (antes "Plaquinhas NFC"). Aparece no cabeçalho, nos títulos das páginas e no topo da mensagem do pedido.
- Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, pnpm, Node.js 22. Detalhes em `docs/architecture.md` e `docs/setup.md`.
- **Banco só para o catálogo (desde 23/10/2026).** Antes o catálogo ficava no código e não havia banco. A pedido do vendedor, o painel `/painel` passou a editar tamanhos, preços, disponibilidade dos modelos e "Esgotado", guardados em PostgreSQL (Neon via Vercel, plano gratuito) com Drizzle ORM, o padrão do projeto. Os pedidos continuam sem ser salvos: seguem só na mensagem do WhatsApp, e o site não guarda dados do cliente nem chaves Pix. Sem `DATABASE_URL`, a loja usa o catálogo padrão do código. Acesso ao painel por senha única em `ADMIN_PASSWORD`.
- Validação com Zod no cliente; não há rota de servidor recebendo pedidos.
- O QR code é gerado no navegador apenas para pré-visualização.

## Hipóteses e pendências

Hipóteses reversíveis (podem mudar sem retrabalho grande):

- **Catálogo, tamanhos, cores e preços "a partir de": a definir.** O código usará valores de exemplo, marcados como tal, até o vendedor informar os reais.
- **Fotos dos modelos: a definir.** Até existirem fotos reais, a vitrine usa ilustrações/placeholders identificados.
- Quantidade por pedido: de 1 a 100 (máximo de exemplo, a definir com o vendedor); acima disso o cliente explica nas observações.
- CEP é opcional; cidade é obrigatória.
- O resumo mostra exatamente a mensagem enviada. Se o WhatsApp abrir sem texto ou não abrir, o cliente usa "Copiar mensagem". Sem número configurado, o botão do WhatsApp some e aparece um aviso.
- O QR code Pix da pré-visualização segue o formato BR Code estático (Pix "copia e cola") sem valor fixo, montado no navegador com chave, nome (até 25 caracteres, sem acentos) e cidade (até 15) do recebedor. A arte final continua a cargo do vendedor.
- No modelo Pix, a etapa do QR code já começa com "QR code do Pix" marcado; nos demais, com "Não, só o chip".
- Texto da ajuda para achar o link de avaliação do Google: redigido a partir da documentação pública do Google Perfil da Empresa, a revisar pelo vendedor.
- Os serviços extras são opcionais e pedidos explicitamente: trocar o destino do chip desmarca o pedido de criação, para não incluir um serviço pago sem intenção.
- O site aceita domínio sem `https://` e, no Instagram, só o `@perfil`, convertendo para o link completo mostrado ao cliente antes de seguir.

Pendências que dependem do vendedor (não inventar):

- **Criar o banco e a senha do painel na Vercel:** Storage → criar banco Neon ligado ao projeto (define `DATABASE_URL`) e a variável `ADMIN_PASSWORD` (12+ caracteres); depois, novo deploy de produção, que aplica as migrações.

- **Preços e prazos dos serviços extras** (site, cadastro no Google, arte sob medida): o site mostra "Valor combinado pelo WhatsApp" até serem definidos.
- **Descrição e imagem dos sites da vitrine:** o ambiente de desenvolvimento não acessou https://orcamento-assistencia-celular.vercel.app nem https://lanchonete-site-ruddy.vercel.app (adicionado em 18/10/2026, descrição provisória "Site para uma lanchonete.") nem https://santa-maria-orcamento.vercel.app (adicionado em 20/10/2026, descrição provisória "Site de orçamento para a Santa Maria."); a descrição atual ("Site de orçamento para uma assistência de celulares") foi deduzida do endereço e precisa ser confirmada. A vitrine usa uma ilustração de navegador até haver captura de tela real.

- Número de WhatsApp do vendedor: definido só na variável `NEXT_PUBLIC_WHATSAPP_NUMBER` do projeto na Vercel, antes do build (o Next fixa o valor no `next build`; trocar o número exige Redeploy). Em 17/10/2026 o número chegou a ser versionado e foi removido dos arquivos; continua no histórico do Git. Sugestão: usar um número exclusivo da loja (WhatsApp Business), já que ele aparece no site.
- Respostas oficiais do FAQ quanto a regravação do chip ("dá para trocar o link depois?"), prazos de produção e frete. Hoje o FAQ responde de forma neutra ("depende de como o chip é gravado"; prazo e entrega combinados pelo WhatsApp).
- Compatibilidade NFC citada no FAQ (iPhone XS ou mais novo sem app; Android com NFC ligado): baseada em conhecimento geral, a confirmar com testes nos chips usados.
- Outros canais de contato (e-mail, Instagram, endereço): a página de contato mostra só o WhatsApp configurado.
- Modelo do chip NFC usado (ex.: NTAG213, NTAG215). Ele limita o tamanho do link gravado (no NTAG213, cerca de 130 caracteres). Hoje o site não limita o comprimento; quando o chip for definido, o limite entra na validação do link.
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

MVP completo no código. Próximo passo: validar com o vendedor as pendências acima (preços, número de WhatsApp, chip, respostas do FAQ, sites da vitrine), testar um pedido real num celular com o WhatsApp instalado e, com autorização, publicar um preview.

## Manutenção

Atualize este documento quando objetivo, escopo, restrições ou critérios de aceitação mudarem. Decisões técnicas e evidências detalhadas ficam em `docs/architecture.md` e `docs/setup.md`.
