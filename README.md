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

- 🔐 Sistema de autenticação completo com **BetterAuth**, com cadastro, recuperação de senha, confirmação de cadastro por email via **Resend**, login social e controle de sessões;
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



## Validação de dados e imagens

As ações validam os formulários no servidor antes de gravar dados ou enviar imagens ao S3. Nomes têm até 255 caracteres; preços são inteiros em centavos entre 0 e 2.147.483.647. Links aceitam HTTP/HTTPS e rejeitam endereços locais e credenciais na URL.

Uploads aceitam arquivos JPEG, PNG e WebP de até 5 MiB e 16 megapixels no total (incluindo quadros de imagens animadas). O servidor confere assinatura, formato e pixels usando Sharp e reencoda a imagem sem metadados antes do upload. O corpo da ação permite 6 MiB para acomodar o formulário e o overhead multipart.

Execute `npm test` para as regressões e `npm run lint` para ESLint e TypeScript. Os testes de upload usam o decodificador real e um S3 simulado, sem acessar o banco ou enviar arquivos à AWS.

Para os testes de transação e concorrência de grupos, execute `npm run test:integration`. O comando inicia um PostgreSQL temporário, aplica as migrations apenas nele e encerra/remove a instância ao terminar. Requer os binários do PostgreSQL; o caminho padrão é `/Library/PostgreSQL/17/bin`, configurável por `POSTGRES_BIN_DIR`.
