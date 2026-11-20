## 🎁 Presenteio

**[Presenteio](https://www.presenteio.app/)** é uma aplicação full-stack idealizada, projetada e desenvolvida inteiramente por mim. Construída com [Next.js](https://nextjs.org/), a plataforma permite a criação de listas de presentes personalizadas e também a criação de grupos para sorteio de amigo secreto.


## 🖼️ Demonstração

🎉 A aplicação já está no ar!  
Você pode testar todas as funcionalidades agora mesmo, em produção:

👉 **Acesse em:** [https://www.presenteio.app/](https://www.presenteio.app/)

🎥 **Ou assista ao vídeo demonstração:**  <br><br>
[![Assista ao vídeo](./public/assets/read-me/thumbnail.webp)](https://www.youtube.com/watch?v=DjThL95ll70)


## ✨ Principais funcionalidades
- 🛍️ CRUD completo de produtos:
  - Criar, editar, visualizar e excluir produtos com nome, descrição, link, preço, imagem e opção para alterar a visibilidade do produto na lista compartilhada;
  - ⬆️ Página específica para compartilhamento dos produtos cadastrados
- 🛍️ CRUD completo de grupos para amigo secreto:
  - Criar, editar, visualizar e excluir grupos para amigo secreto, com link para compartilhar e adicionar pessoas no grupo;
  - 💡 Regras de sorteio do amigo secreto que impedem um sorteio inválido (Quantidade de pessoas, sorteio pareado, etc)

- 🔐 Autenticação com **Better Auth** por código enviado por email ou Google, com controle de sessões;
- ✅ Validações robustas de formulários com Zod e React Hook Form;
- 📄 Banco de dados relacional **PostgreSQL** tipado e manipulado com **PrismaORM**;
- 📷 Armazenamento de imagens em bucket **AWS S3**


## 🧠 Tecnologias utilizadas
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [BetterAuth](https://www.better-auth.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [PrismaORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)



## Desenvolvimento local

Requer Docker e Node.js. Depois de instalar as dependências com `npm ci`, execute:

```sh
npm run dev
```

Esse comando inicia PostgreSQL e Mailpit no Docker, aplica as migrations, cria os dados de exemplo ausentes e inicia o Next.js na máquina. O app usa a primeira porta livre de `3000` a `3010`; abra a URL exibida no terminal. O comando configura a URL do Better Auth para essa mesma porta. A caixa de emails fica em `http://127.0.0.1:8025` e abre automaticamente ao solicitar um código OTP. O Mailpit captura a mensagem; nenhum email local é enviado para fora. O banco usa a porta `5434`, para não conflitar com o `rpg-monorepo` (`5433`).

Entre com `etore@test.com` ou `etore2@test.com` até `etore5@test.com`; o código chega à caixa local. A seed inclui presentes e dois grupos, um antes e outro depois do sorteio. Ela só cria registros ausentes, preservando os dados adicionados durante os testes. `npm run resetdev` apaga **somente o banco Docker local** e recria as migrations e a seed. `docker compose down` para os serviços preservando os volumes.

O app abre sem credenciais AWS; somente uploads de imagem exigem as variáveis S3 de `.env.example`. Para testá-los localmente, configure suas credenciais de desenvolvimento. O comando `npm run dev` fixa a URL do banco Docker local e não usa uma `DATABASE_URL` antiga do shell ou do `.env`.

## Staging

Defina `APP_ENV=staging`, `SEED_DEMO_DATA=true`, `MAIL_TRANSPORT=mailpit` e `MAILPIT_API_URL=http://mailpit.railway.internal:8025` no serviço Next.js do Railway. `npm start` executa migrations e a seed idempotente antes de iniciar o app. Se o serviço usar um comando customizado, execute `node scripts/prepare-runtime.mjs` no pré-deploy. No serviço Mailpit, use a imagem `axllent/mailpit:v1.28`, porta HTTP `8025`, `MP_UI_AUTH` com credenciais fortes para a interface, `MP_SEND_API_AUTH` com credenciais distintas para o envio e um volume para `MP_DATABASE=/data/mailpit.db`. Configure `MAILPIT_SEND_USER` e `MAILPIT_SEND_PASSWORD` no serviço Next.js com as credenciais de envio. Publique somente a interface web por HTTPS; o Next.js acessa a API de envio pela rede privada do Railway. A caixa de staging recebe OTP para os emails fictícios da seed. Guarde a URL e as credenciais fora do repositório.

Em produção, não defina `SEED_DEMO_DATA=true` nem `MAIL_TRANSPORT=mailpit`; o envio usa `RESEND_API_KEY`. O código OTP expira em dez minutos, aceita até cinco tentativas e é armazenado com hash. O login por senha fica desativado, mas os hashes das contas existentes permanecem no banco.

## Validação de dados e imagens

As ações validam os formulários no servidor antes de gravar dados ou enviar imagens ao S3. Nomes têm até 255 caracteres; preços são inteiros em centavos entre 0 e 2.147.483.647. Links aceitam HTTP/HTTPS e rejeitam endereços locais e credenciais na URL.

Uploads aceitam arquivos JPEG, PNG e WebP de até 5 MiB e 16 megapixels no total (incluindo quadros de imagens animadas). O servidor confere assinatura, formato e pixels usando Sharp e reencoda a imagem sem metadados antes do upload. O corpo da ação permite 6 MiB para acomodar o formulário e o overhead multipart.

Execute `npm test` para as regressões e `npm run lint` para ESLint e TypeScript. Os testes de upload usam o decodificador real e um S3 simulado, sem acessar o banco ou enviar arquivos à AWS.

Para os testes de transação e concorrência de grupos, execute `npm run test:integration`. O comando inicia um PostgreSQL temporário, aplica as migrations apenas nele e encerra/remove a instância ao terminar. Requer os binários do PostgreSQL; o caminho padrão é `/Library/PostgreSQL/17/bin`, configurável por `POSTGRES_BIN_DIR`.
