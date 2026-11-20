# Revisão visual — 20/11/2026

**Ambiente:** build local Next.js 16.4.6 com webpack, PostgreSQL e Mailpit locais, Playwright/Chromium em desktop (1440 × 900) e mobile (390 × 844).

| Verificação | Resultado |
| --- | --- |
| Login com foto em desktop e mobile; etapa OTP com instrução contextual | Passou |
| Cereja + baunilha como padrão e primeira paleta | Passou |
| Tema e paleta no menu do usuário, prévia com cancelamento | Passou |
| Preferência salva na conta e restaurada em navegador sem `localStorage` | Passou |
| Foco do campo de importação totalmente visível | Passou; espaço de 8 px até a área rolável |
| Lista, participantes, lista compartilhada e editor em mobile | Passou; sem rolagem horizontal |
| Editor mostra imagem e campos lado a lado no desktop e empilhados no mobile | Passou |
| Fechamento do produto sem transformação compartilhada da imagem | Passou |
| `npm run lint`, 223 testes e `npx next build --webpack` | Passou |

## Ajustes após a segunda revisão

- A foto e a tagline do login agora têm respiro inferior consistente; os controles de aparência foram retirados dessa tela.
- A prévia de Claro, Escuro e Sistema altera a página no clique, antes de salvar. Cancelar restaura a preferência da conta.
- A sidebar ganhou ações mais visíveis com as duas cores da paleta, tipografia e espaçamentos revistos.
- Os cartões mostram o preço como texto próximo do nome. O painel “Quem eu tirei” revela o resultado sem sobreposição no hover.
- O editor de produto mostra título e preço junto da imagem, campos ao lado no desktop e empilhados no mobile; agora oferece Cancelar e Salvar.
- Ao criar um item, a lista recebe o novo cartão no início com escala e fade. Em telas pequenas, a página rola até a lista antes da entrada.

**Verificação de interação:** Playwright confirmou a prévia imediata do tema e seu cancelamento, a ausência dos controles no login, o hover do sorteio, a altura e os campos do modal em desktop/mobile, e a entrada animada do novo item. O item de teste foi removido. A preferência de aparência da conta usada na revisão foi preservada.

## Ajustes dos cartões e do editor

- Os nomes dos produtos usam a fonte dos títulos em uma linha truncada, com tamanho menor; o preço continua próximo do nome.
- A ilustração do presente agora usa as variáveis de cada paleta e ocupa menos espaço no cartão e no editor.
- Os pontos dos grupos na sidebar usam a cor secundária do tema.
- A visibilidade tem uma área própria e avisa quando o produto não aparecerá na lista compartilhada. O botão de exclusão fica à direita do controle, apenas com ícone e nome acessível, na cor destrutiva da paleta.

**Verificação:** cartões e editor inspecionados em desktop (1440 × 900) e mobile (390 × 844), incluindo o aviso ao desativar a visibilidade. `npm run lint`, 223 testes e `npx next build --webpack` passaram.

[Cartões desktop](feedback-3-cards-desktop.png) · [Cartões mobile](feedback-3-card-mobile.png) · [Editor desktop](feedback-3-editor-desktop.png) · [Aviso de invisibilidade mobile](feedback-3-editor-invisible-mobile.png)

## Contraste e espaçamento dos cartões

- O corpo do presente usa a cor de texto da paleta secundária e a fita usa a cor secundária; a ilustração se destaca nos fundos claros e escuros.
- Removida a altura mínima desnecessária do texto dos cartões, preservando uma linha truncada para o nome. No desktop, o espaço medido abaixo do preço é 21 px, equivalente aos 20 px de padding lateral interno e externo.

[Cereja escuro](feedback-4-card-cherry-dark.png) · [Azul claro](feedback-4-card-blue-light.png)

## Modal de grupo, flip e presentes comprados

- Os campos do modal “Novo amigo secreto” têm a mesma largura em desktop e mobile (medidos no navegador: 282,5 px e 358 px, respectivamente).
- O cartão “Quem eu tirei” voltou a girar em 3D. As duas faces são opacas, ocultam o verso durante a rotação e funcionam com clique ou toque.
- Na lista compartilhada, presentes comprados têm opacidade e saturação reduzidas, sem perder a interação.

[Modal desktop](feedback-5-new-group-desktop.png) · [Modal mobile](feedback-5-new-group-mobile.png) · [Flip durante a rotação](feedback-5-flip-mid-desktop.png) · [Flip revelado mobile](feedback-5-flip-after-mobile.png) · [Presente indisponível](feedback-5-shared-purchased-desktop.png)

## Hover

- Os elementos decorativos do cartão de revelação ampliam suavemente no hover; a face cresce discretamente sem interferir no flip.
- Os cartões de produto sobem e ampliam levemente, com zoom suave da foto ou ilustração.

**Verificação no Chromium:** escala calculada da ilustração do produto passou de `none` a `1.08`; dos elementos decorativos, de `none` a `1.12`; o cartão chegou a `1.012`.

[Produto em hover](feedback-6-product-hover.png) · [Revelação em hover](feedback-6-reveal-hover.png)

O build padrão com Turbopack não conclui neste ambiente por `EPERM` ao abrir uma porta interna. O build com webpack concluiu.

## Telas principais

[Login desktop](feedback-login.png) · [Login mobile](login-mobile.png) · [Etapa do código](login-otp.png) · [Lista desktop](wishlist-desktop.png) · [Lista mobile](wishlist-mobile.png) · [Editor desktop](feedback-product-desktop.png) · [Editor mobile](feedback-product-mobile.png) · [Novo produto desktop](feedback-new-product-desktop.png) · [Grupo e sorteio](feedback-draw-after.png) · [Sorteio mobile](feedback-draw-mobile.png) · [Lista compartilhada mobile](shared-mobile.png) · [Sidebar mobile](sidebar-mobile.png) · [Sidebar cereja escura](feedback-sidebar-cherry-dark.png) · [Prévia escura](feedback-appearance-dark.png) · [Prévia clara](feedback-appearance-light.png) · [Entrada de item mobile](feedback-new-item-mobile.png) · [Foco no modal](import-focus-final.png)

## Paletas

| Paleta | Claro | Escuro |
| --- | --- | --- |
| Cereja + baunilha | [Abrir](wishlist-cherry-light.png) | [Abrir](wishlist-cherry-dark.png) |
| Coral + azul petróleo | [Abrir](wishlist-coral-light.png) | [Abrir](wishlist-coral-dark.png) |
| Violeta + lima | [Abrir](wishlist-violet-light.png) | [Abrir](wishlist-violet-dark.png) |
| Azul elétrico + pêssego | [Abrir](wishlist-blue-light.png) | [Abrir](wishlist-blue-dark.png) |
| Terracota + oliva | [Abrir](wishlist-terracotta-light.png) | [Abrir](wishlist-terracotta-dark.png) |
| Sálvia + pêssego | [Abrir](wishlist-sage-light.png) | [Abrir](wishlist-sage-dark.png) |
| Ameixa + dourado | [Abrir](wishlist-plum-light.png) | [Abrir](wishlist-plum-dark.png) |
