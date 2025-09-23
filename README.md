# 🎁 Lista de presentes

**Lista de presentes** é uma aplicação fullstack desenvolvida com [Next.js](https://nextjs.org/) que permite a criação de listas de presentes personalizadas. Usuários autenticados podem cadastrar, visualizar, editar e excluir produtos que desejam ganhar em datas especiais, como aniversários, amigos secretos ou casamentos.

Autenticação segura via [BetterAuth](https://www.better-auth.com/), UI estruturada com Tailwind CSS e componentes shadcn/ui, experiência fluida com validação via React Hook Form e Zod.

## ✨ Features

- 🔐 Autenticação com BetterAuth, com recuperação de senha e login social
- 🛍️ CRUD completo de produtos:
  - Criar, editar, visualizar e excluir produtos com nome, descrição, link, preço, imagem e opção para alterar a visibilizade do produto
- ✅ Validações robustas com Zod e React Hook Form
- ⬆️ Página específica para compartilhamento dos produtos cadastrados

## 🖼️ Demonstração

🎉 A aplicação já está no ar!  
Você pode testar todas as funcionalidades agora mesmo, em produção:

👉 **Acesse em:** [https://www.presenteio.app/](https://www.presenteio.app/)

ou assista o vídeo demonstração:
[![Assista ao vídeo](https://img.youtube.com/vi/DjThL95ll70/hqdefault.jpg)](https://www.youtube.com/watch?v=DjThL95ll70)


## 🧠 Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [BetterAuth](https://www.better-auth.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Kysely](https://kysely.dev/)
- [PostgreSQL](https://www.postgresql.org/)

## 🚀 Como Rodar o Projeto Localmente

Siga estas instruções para configurar o projeto em seu ambiente de desenvolvimento.

### Pré-requisitos

- Node.js
- PostgreSQL
- Conta na AWS (para S3)
- (opcional) Conta no Resend (para e-mails)
- (opcional) Conta no Resend (para e-mails)

### 1. Clone o repositório

```bash
git clone https://github.com/etoregrande/lista-de-presentes.git

```

---

### 2. Instale as dependências

```bash
npm install
```

---

### 3. Configure o banco de dados PostgreSQL

Crie um banco de dados local PostgreSQL (ex: `lista_presentes_dev`).

Copie o conteúdo do arquivo `.env.example` para um novo arquivo `.env` na raiz do projeto:

No arquivo `.env`, defina a variável `DATABASE_URL` com a URL do banco, por exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/lista_presentes_dev
```

---

### 4. Configure o armazenamento de imagens (Amazon S3)

Para armazenar imagens dos produtos, será necessário configurar um bucket na AWS S3:

1. Crie e configure um bucket público no Amazon S3.
2. Adicione as seguintes variáveis no seu `.env`:

```env
BUCKET_DOMAIN=
BUCKET_NAME=
BUCKET_REGION=
BUCKET_KEY=
BUCKET_SECRET_KEY=
```

---

### 5. Funcionalidades opcionais

#### 🔐 Login social (Google)

Para ativar o login com Google:

1. Defina a variável no `.env`:

```env
NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED=true
```

2. Configure as credenciais da API do Google:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

#### 📧 Recuperação de senha e confirmação por e-mail

1. Crie uma conta em [Resend](https://resend.com/).
2. Adicione a chave da API ao `.env`:

```env
RESEND_API_KEY=
```

---

### 6. Demais variáveis de ambiente

```env
NODE_ENV=development                      # ou "production" (usar "production" apenas com HTTPS)
BETTER_AUTH_URL=http://localhost:3000     # URL base da aplicação
BETTER_AUTH_SECRET=sua-chave-secreta      # usada pela BetterAuth
EMAIL_VERIFICATION_CALLBACK_URL=/wishlist # não alterar
```

---

### 7. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)
