# Importar um presente pelo link

O botão **Novo item** abre um modal (drawer no celular). A busca mostra carregamento
e abre o formulário lateral com os campos encontrados. O usuário revisa e só cria
o item ao clicar em **Salvar**. Fechar o modal cancela o resultado pendente; fechar
o formulário não grava nada. **Preencher manualmente** continua disponível.

## Extratores

- Amazon Brasil: HTML do produto, com nome, imagem principal, preço total em BRL
  e tópicos descritivos. Não usa IA nem serviço pago.
- Mercado Livre: API autenticada para catálogo e oferta selecionada pelo link;
  usa `/sale_price` quando disponível. Se uma consulta for negada, preserva os
  campos acessíveis. Preço pode continuar vazio mesmo com OAuth válido.
- Outras lojas: JSON-LD `Product`, depois Open Graph. Moedas diferentes de BRL e
  preços ambíguos (faixas ou múltiplas ofertas) ficam vazios para revisão.
- Bloqueios, páginas de login, ausência de dados e imagens inválidas permitem
  continuar manualmente. Não existe garantia de cobertura universal.

A imagem é baixada, decodificada e reduzida a WEBP na prévia; permanece em memória
no navegador como `File`. O fluxo existente valida e envia ao S3 somente ao salvar.
A prévia não cria registros de presentes nem objetos no S3.

## Configurar no Railway

Mantenha as variáveis existentes de banco, autenticação e S3. Adicione:

```dotenv
MERCADOLIVRE_CLIENT_ID=4028819120323937
MERCADOLIVRE_CLIENT_SECRET=<secret do aplicativo no DevCenter>
MERCADOLIVRE_REDIRECT_URI=https://presenteio.app/api/integrations/mercadolivre/callback
MERCADOLIVRE_ADMIN_EMAIL=<email da sua conta existente no Presenteio>
MERCADOLIVRE_TOKEN_SECRET=<segredo aleatório de pelo menos 32 caracteres>
```

Gere o último valor com `openssl rand -hex 32`. Um valor também foi gerado no `.env`
local ignorado pelo Git. Não publique esse arquivo. Mantenha o segredo estável:
alterá-lo exige conectar o Mercado Livre novamente. Nenhuma variável é pública
(`NEXT_PUBLIC_*`). Não coloque access/refresh tokens manualmente no Railway.

1. Configure o DevCenter: Authorization Code, Refresh Token, PKCE S256 e Mercado
   Livre habilitados. Redirect URI exatamente igual à variável, sem barra final.
   Publicação e sincronização com Leitura; demais acessos opcionais desabilitados.
2. Publique o código. `npm start` executa `prisma migrate deploy` pelo `prestart`.
   Se o Railway usar um comando personalizado como `next start`, configure
   `npm run migrate` como pre-deploy, ou use `npm start`. A migração adiciona
   `integration_credentials`, sem alterar os presentes existentes.
3. Entre no Presenteio com o email definido em `MERCADOLIVRE_ADMIN_EMAIL`.
4. Abra `https://presenteio.app/api/integrations/mercadolivre/connect`, ou use o link
   de conexão exibido na lista apenas para essa conta.
5. Autorize o aplicativo no ML. O retorno deve mostrar **Mercado Livre conectado**.
6. Use **Novo item** com os links reais, confira os campos e só então salve.

O fluxo verifica estado, prazo, conta de origem e PKCE. Tokens são cifrados com
AES-256-GCM no banco. A renovação usa trava transacional PostgreSQL para evitar
uso simultâneo de um refresh token rotativo entre réplicas. Não há tokens no
cliente, na resposta de prévia ou nos logs da aplicação. Sessões revogadas exigem
nova autorização pelo mesmo link de conexão.

## Limites

Requisições exigem sessão. O limite em memória é de 10 buscas por usuário/minuto,
uma simultânea por usuário e 12 simultâneas por processo (não é um limite global
distribuído). URLs internas, credenciais na URL, portas não padrão e DNS privado
são bloqueados; o IP é fixado ao conectar e revalidado em cada redirecionamento.
HTML, imagens, redirecionamentos e tempo de acesso têm limites.

Preço é uma fotografia da consulta, sem atualização automática ou garantia de
corresponder ao checkout, frete, Pix ou benefícios da conta do comprador.

## Testes

```sh
npm test
npm run lint
POSTGRES_BIN_DIR=/opt/homebrew/opt/postgresql@17/bin npm run test:integration
npm run build
npx playwright install chromium
POSTGRES_BIN_DIR=/opt/homebrew/opt/postgresql@17/bin npm run test:browser
```

Ajuste `POSTGRES_BIN_DIR` para sua instalação. Os testes de integração e navegador
criam bancos descartáveis próprios, sem ler a URL do banco da aplicação. O teste
de navegador usa respostas determinísticas de importação para verificar a UI,
mas executa autenticação, validação de acesso, salvamento e consultas reais ao banco.
Não salva imagens no S3. Evidências ficam em `outputs/product-import-browser/`.

O build requer as variáveis de autenticação e S3 já exigidas pelo projeto. Em
ambientes onde Turbopack não consegue abrir portas internas, é possível verificar
com `npm run build -- --webpack`. O comando de build de produção não foi alterado.

Teste final no Railway: conectar OAuth e importar os quatro links da conversa.
O acesso autenticado ao ML só pode ser confirmado depois dessa autorização; os
testes automatizados não comprovam que o ML permite preço de anúncios de terceiros.

## Referências

- [OAuth do Mercado Livre](https://developers.mercadolivre.com.br/autenticacao-e-autorizacao)
- [Catálogo de produtos](https://developers.mercadolivre.com.br/buscador-de-produtos)
- [API de preços](https://developers.mercadolivre.com.br/devcenter/api-de-precos)
