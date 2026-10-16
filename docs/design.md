# Design e acessibilidade

## Direção

Público: donos de pequenos negócios no Brasil, pouco técnicos, comprando pelo celular. Interface 100% em português do Brasil, mobile-first, linguagem simples e direta ("Avalie a gente!", "Aproxime o celular"). Tom confiável e prático: o cliente precisa entender o que é NFC sem jargão.

Direção ainda não implementada: vitrine com cards de modelo (foto, tamanhos, preço "a partir de"), personalização em etapas curtas com pré-visualização sempre visível, resumo antes de abrir o WhatsApp e botão principal grande ao alcance do polegar.

## Sistema existente

- Tokens de cor em `src/app/globals.css`: `--background` e `--foreground`, com variação clara/escura por `prefers-color-scheme`, expostos ao Tailwind como `background` e `foreground`.
- Tipografia: Geist (`next/font/google`) em `src/app/layout.tsx`, exposta como `--font-sans`.
- Helper `cn()` em `src/lib/utils.ts` para compor classes Tailwind.
- Componentes: nenhum ainda. Crie-os junto dos fluxos, sem catálogo antecipado.

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

Revisão feita no bootstrap: home provisória carregada num Pixel 7 emulado (Chromium/Playwright), sem erros nem avisos no console. A interface do MVP ainda não existe.

## Manutenção

Mudanças visuais e de interação atualizam `globals.css`/componentes e esta orientação quando houver alteração de regra. Revise telas com a skill `web-design-guidelines` antes de concluir mudanças de UI.
