# Design e acessibilidade

## Direção

Público: donos de pequenos negócios no Brasil, pouco técnicos, comprando pelo celular. Interface 100% em português do Brasil, mobile-first, linguagem simples e direta ("Avalie a gente!", "Aproxime o celular"). Tom confiável e prático: o cliente precisa entender o que é NFC sem jargão.

Implementado: vitrine com explicação do NFC, "Como funciona" em 3 passos, "Para quem é" e cards de modelo (ilustração, tamanhos e preço "a partir de"); preços marcados como ilustrativos enquanto `CATALOG_PRICES_ARE_EXAMPLES` for `true`. Implementado também: personalização com prévia fixa no topo no celular e em coluna lateral no desktop; modelo, tamanho e cor como grupos de rádio com nome (cor nunca só como amostra); contadores de caracteres; erro junto do campo e foco no primeiro campo inválido ao enviar. Direção ainda não implementada: resumo antes de abrir o WhatsApp e botão principal grande ao alcance do polegar.

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

Revisão da personalização (16/10/2026, Chromium/Playwright, Pixel 7 e desktop escuro): sem erros no console nem rolagem horizontal; `?modelo=pix` pré-seleciona Pix e só mostra tamanhos disponíveis; `?modelo=` desconhecido cai no primeiro modelo; enviar com nome vazio foca o campo, marca `aria-invalid` e liga o erro por `aria-describedby`; o erro some ao digitar; setas trocam a opção nos grupos de rádio; a prévia reflete frase, nome, cor, formato em pé do display e logo. `color-scheme: light dark` em `globals.css` faz os controles nativos seguirem o tema. Até o fluxo 3 existir, "Continuar" só confirma a validação com uma mensagem de status.

## Manutenção

Mudanças visuais e de interação atualizam `globals.css`/componentes e esta orientação quando houver alteração de regra. Revise telas com a skill `web-design-guidelines` antes de concluir mudanças de UI.
