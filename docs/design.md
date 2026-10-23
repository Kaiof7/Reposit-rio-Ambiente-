# Design e acessibilidade

## Direção

Público: donos de pequenos negócios no Brasil, pouco técnicos, comprando pelo celular. Interface 100% em português do Brasil, mobile-first, linguagem simples e direta ("Avalie a gente!", "Aproxime o celular"). Tom confiável e prático: o cliente precisa entender o que é NFC sem jargão.

Implementado: vitrine com explicação do NFC, "Como funciona" em 3 passos, "Para quem é" e cards de modelo (ilustração, tamanhos e preço "a partir de"); preços marcados como ilustrativos enquanto `CATALOG_PRICES_ARE_EXAMPLES` for `true`. Implementado também: personalização com prévia fixa no topo no celular e em coluna lateral no desktop; modelo, tamanho e cor como grupos de rádio com nome (cor nunca só como amostra); contadores de caracteres; erro junto do campo e foco no primeiro campo inválido ao enviar. Implementado também: pedido em etapas ("Etapa X de N"), com foco movido para o título da etapa ao avançar ou voltar e estado preservado ao voltar; etapa do link do chip com destino em rádios, campo com teclado de URL, prévia do link que será gravado com "Testar link" (nova aba) e ajuda recolhível para o link de avaliação do Google antes do campo. Implementado também: escolha "Quem faz a arte?" (modelo pronto ou arte sob medida, com observações opcionais); "Ainda não tenho. Quero que vocês façam." nos destinos que a equipe consegue criar (Google, site, cardápio, outro), escondendo o campo de link e explicando o serviço; etapa condicional com os dados do site e/ou do cadastro no Google; seções "Ainda não tem site ou perfil no Google?" e "Sites que já fizemos" (`#sites`) na home. Implementado também: etapa "QR code" com três opções (não, Pix, link), campos da chave conforme o tipo (teclado numérico, telefone ou e-mail), aviso de que os dados não ficam salvos, e prévia do QR sempre preto no branco; no celular a prévia fica antes dos botões, no desktop em coluna lateral fixa. Implementado também: etapa "Seus dados" (nome, WhatsApp com teclado de telefone, cidade, CEP opcional, quantidade com valor calculado e observações) e "Resumo do pedido" com a mensagem exata em seções, botões "Enviar pelo WhatsApp", "Copiar mensagem" e "Voltar" em largura total no celular.

## Sistema existente

- Tokens de cor em `src/app/globals.css`: `--background` e `--foreground`, com variação clara/escura por `prefers-color-scheme`, expostos ao Tailwind como `background` e `foreground`.
- Tipografia: Geist (`next/font/google`) em `src/app/layout.tsx`, exposta como `--font-sans`.
- Helper `cn()` em `src/lib/utils.ts` para compor classes Tailwind.
- Componentes: `CustomizeForm` (`src/components/customize-form.tsx`), `ModelCard` (`src/components/model-card.tsx`) e `PlaqueIllustration` (`src/components/plaque-illustration.tsx`, cor e ícone por modelo; fundos `blue-700`, `teal-700`, `zinc-800`, `fuchsia-700` `orange-700` e `rose-800` em `BACKGROUNDS` do catálogo, com texto branco, contraste AA; tamanhos em `cqw` para servir de card e de prévia). Crie outros junto dos fluxos.
- Texto secundário usa `text-foreground/70` ou `/80` (contraste ≥ 4,5:1 nos dois temas).

## Interação

Use HTML semântico, navegação por teclado, foco visível e contraste adequado (WCAG AA). Dê nome a controles e campos com `<label>`. Erros de validação ficam junto do campo (`aria-describedby`, `aria-invalid`); o resumo de erros recebe foco ao enviar. Operações assíncronas exibem espera e resultado. Respeite `prefers-reduced-motion`.

Específicos do produto:

- Campos de telefone e CEP com `inputMode="numeric"`/`tel` e `autoComplete` adequados; URLs com `type="url"`.
- Escolhas de modelo, tamanho e cor como grupos de rádio acessíveis, não só cores clicáveis: cada cor tem nome.
- Pré-visualizações (arte e QR code) têm texto alternativo descrevendo o conteúdo.
- Abrir o WhatsApp é ação explícita do usuário, depois do resumo; o link avisa que abre outro app.

## Layout e revisão

- Projeto a partir de 360 px de largura, sem rolagem horizontal; coluna única até `md`, conteúdo limitado em telas largas.
- Alvos de toque de pelo menos 44 × 44 px.
- Estados pertinentes: número de WhatsApp não configurado (mensagem clara, sem quebrar), campos inválidos, QR code sem dados suficientes.

Revisão da vitrine (16/10/2026, Chromium/Playwright): Pixel 7 claro e escuro e desktop 1280 px sem rolagem horizontal e sem erros/avisos no console; primeiro Tab foca "Ver modelos" com contorno visível e Enter leva a `#modelos`; hierarquia h1 → h2 → h3. A ilustração no card é decorativa (`aria-hidden`), pois o texto se repete no título e na descrição. O link "Personalizar" tem nome acessível com o modelo ("Personalizar Pix").

Revisão da personalização (16/10/2026, Chromium/Playwright, Pixel 7 e desktop escuro): sem erros no console nem rolagem horizontal; `?modelo=pix` pré-seleciona Pix e só mostra tamanhos disponíveis; `?modelo=` desconhecido cai no primeiro modelo; enviar com nome vazio foca o campo, marca `aria-invalid` e liga o erro por `aria-describedby`; o erro some ao digitar; setas trocam a opção nos grupos de rádio; a prévia reflete frase, nome, cor, formato em pé do display e logo. `color-scheme: light dark` em `globals.css` faz os controles nativos seguirem o tema. 

Revisão do link do chip (16/10/2026, Pixel 7 claro e escuro): sem erros no console nem rolagem horizontal; foco vai ao título "Link do chip" ao avançar; link vazio e "meu site" mostram erro junto do campo com foco nele; `g.page/r/...` vira `https://g.page/r/...`; `@perfil` no Instagram vira o link do perfil; ajuda do Google só aparece para esse destino; voltar e avançar preservam nome e link; trocar o modelo antes de digitar o link ajusta o destino sugerido. Até o fluxo 4 existir, o último "Continuar" só confirma a validação com uma mensagem de status.

Revisão dos serviços extras (16/10/2026, Pixel 7): sem erros no console nem rolagem horizontal; arte sob medida mostra o campo de observações e entra no resumo da etapa; marcar "Ainda não tenho" esconde o link e a ajuda do Google e acrescenta a etapa ("Etapa 2 de 3"); a etapa "Cadastro no Google" foca o primeiro campo inválido e esconde o endereço quando não há endereço fixo; Instagram não oferece criação; trocar o destino desmarca o pedido de criação.

## Manutenção

Mudanças visuais e de interação atualizam `globals.css`/componentes e esta orientação quando houver alteração de regra. Revise telas com a skill `web-design-guidelines` antes de concluir mudanças de UI.

Revisão do QR code (16/10/2026, Pixel 7 e desktop escuro): sem erros no console nem rolagem horizontal; o QR exibido na tela foi rasterizado e lido com jsQR no navegador, devolvendo o payload Pix completo e o link do chip; erros de chave, nome e cidade aparecem juntos, com foco na chave; CPF com dígito errado é recusado; "Outro link" com "quero que vocês façam um site" acrescenta a etapa "Criação de site"; sem QR, a prévia some.

Revisão de dados e envio (16/10/2026, Pixel 7, ponta a ponta a partir da home): pedido com arte sob medida, cadastro no Google e QR Pix chegou a "Etapa 6 de 6"; erros de nome, WhatsApp e cidade aparecem juntos com foco no nome; o link do botão é `https://wa.me/<número>` e o parâmetro `text` decodifica igual ao resumo; "Copiar mensagem" copia o mesmo texto; o clique abre nova aba (o ambiente de teste bloqueia o domínio wa.me, então a abertura real do app ficou para testar num celular); sem número configurado, aviso no lugar do botão; sem erros no console.

Revisão das páginas de apoio (16/10/2026, Pixel 7 claro e escuro): cabeçalho com "Plaquinhas NFC", "Modelos", "Dúvidas" e "Contato" (alvos de 44 px, primeiro Tab no nome da loja); FAQ com uma pergunta por `h2`, sem rolagem horizontal; contato com "Chamar no WhatsApp" para `https://wa.me/<número>` e o telefone formatado, ou aviso quando o número não está configurado; links entre FAQ, contato e pedido funcionando; sem erros no console.

Code review das páginas de apoio (16/10/2026, 3 ciclos):

1. Textos: o FAQ dizia que o chip abria o "app do banco" e que o QR "é só apontar a câmera"; o QR do Pix é lido no app do banco, não pela câmera. Corrigido no FAQ e na etapa do QR code. Compatibilidade NFC reescrita sem "maioria dos celulares", incluindo iPhone 7 a X pela Central de Controle. Perguntas retóricas trocadas por frases diretas.
2. Acessibilidade: link "Pular para o conteúdo" (primeiro Tab, leva o foco a `#conteudo`), `aria-current="page"` no cabeçalho (componente cliente pequeno com `usePathname`), avisos fixos sem `role="alert"`, `theme-color` claro/escuro. Sem rolagem horizontal em 320 px nas quatro rotas.
3. Integração: o número do WhatsApp fica fixo no valor do `next build` quando definido nele (teste: build com um número, servidor com outro, a página mostrou o do build); documentação e comentários corrigidos. Regressão de ponta a ponta do pedido sem mudanças de comportamento.

Segunda rodada de code review (16/10/2026, 3 ciclos):

1. Navegação e layout: no celular, a prévia fixa da personalização cobria o campo focado ao voltar com Shift+Tab ("Nome do negócio" sob a prévia). Corrigido com `scroll-padding-top: 12rem` no `html` apenas quando a prévia fixa existe e abaixo de `lg` (`globals.css`, atributo `data-sticky-preview`); retestado sem campos cobertos e com o foco de erro visível. Link de pular, `aria-current` e `theme-color` sem achados.
2. Textos em celular real: não executado (sem aparelho com NFC neste ambiente). Revisão das afirmações levou a explicar que o botão do leitor de NFC dos iPhones 7 a X pode precisar ser adicionado à Central de Controle. Teste físico segue pendente.
3. Documentação da variável: `PRODUCT.md` agora diz que o número precisa estar definido antes do build.

Painel do vendedor (`/painel`, 23/10/2026): fora da navegação e com `noindex`. Login por senha com erro junto do campo. Cada modelo e cada tamanho fica recolhido em `<details>`, com resumo de estado ("Oculto", "Esgotado", "N tamanho(s) à venda"); o editor tem "Aparece na loja", e para cada tamanho a caixa de oferta, o preço (teclado decimal) e "Esgotado"; mensagens de salvamento em `role="status"`. Na loja, tamanho esgotado mostra "Esgotado" no card e fica desativado no pedido; modelo sem nenhum tamanho à venda mostra "Esgotado no momento" no lugar de "Personalizar" e fica desativado na escolha de modelo; modelo oculto some da vitrine e do pedido. Teste de ponta a ponta com PostgreSQL 16 local (Pixel 7, claro e escuro): login, senha errada, salvar, preço inválido, tamanho novo, sessão expirada, logout e pedido com o tamanho novo; console sem erros, sem rolagem horizontal.
