# Google login preso no carregamento — 2026-11-10

Sintoma: usuário clicou em Google no login de produção e observou spinner permanente.

## Reprodução e hipóteses

1. Requisição falha e UI não trata o erro: confirmado. Interceptar apenas no navegador
   a resposta de `/api/auth/sign-in/social` com HTTP 500 reproduziu o botão desabilitado
   sem texto em duas tentativas. O handler não tinha catch/finally nem limite de tempo.
2. Configuração Google indisponível para todos em produção: não sustentada no momento
   do teste. Navegador anônimo chegou à tela `accounts.google.com/v3/signin/identifier`.
3. Bloqueio específico do navegador ou versão antiga da página: não confirmado;
   solicitado ao usuário testar após recarregar e em janela anônima.

Não foi capturado o erro original no navegador do usuário. Não inferir que uma
configuração específica do Railway está incorreta nem que o erro original foi 500.

## Correção

Handler limita requisição a 15 segundos sem retry automático, verifica erro e URL
de retorno, mostra feedback e libera o botão no finally. Nome acessível é preservado
durante o carregamento. Mantém o redirecionamento normal do SDK Better Auth.

Regressões exercitam o callback real do componente: erro HTTP, falha de rede, timeout,
resposta sem URL e nova tentativa bem-sucedida. As quatro falharam antes da correção.

## Verificação concluída

- Quatro regressões passaram após a correção.
- ESLint, TypeScript e build de produção com Webpack passaram.
- Chromium com build local: erro HTTP 500, falha de rede, timeout real de 15 segundos
  exibiram mensagem e liberaram o botão. Nova tentativa redirecionou pelo SDK.
- Nenhum erro JavaScript não tratado no navegador. Screenshot de evidência local:
  `/tmp/presenteio-google-login-fixed.png`.
- O caminho de sucesso em produção já havia aberto o Google sem simulação. A falha
  original específica da sessão do usuário segue sem uma resposta de rede capturada.
