# Verificação da importação por link — 2026-11-10

## Plano e ambiente

Testar a jornada em desktop e celular: Novo item → link → carregamento → revisão
→ Salvar. Verificar entrada manual, campos parciais, falhas, cancelamento de busca,
ausência de gravação antes de salvar e controle de acesso.

Ambiente: build de produção local, Chromium/Playwright, PostgreSQL descartável,
conta de teste e armazenamento S3 não conectado. Nenhum dado de produção usado.

## Resultados

| Verificação | Resultado |
|---|---|
| Testes de servidor: extração, OAuth, imagens, autorização e regressões | 229 passaram |
| Integração PostgreSQL: migração, renovação concorrente e regressões de grupos | 10 passaram |
| ESLint e TypeScript | Passaram |
| Build de produção com Webpack | Passou, Next.js 16.4.6 |
| Desktop: modal, loading, formulário preenchido | Passou |
| Edição antes de salvar; gravação única pelo server action real | Passou |
| Entrada manual e cancelamento sem gravação | Passou |
| Erro da API no modal com opção manual | Passou |
| Fechar busca pendente impede abertura tardia do formulário | Passou |
| API real rejeita usuário anônimo e URL privada | Passou |
| Amazon real: Airfryer, imagem, descrição e R$ 549,00; cancelar não cria item | Passou |
| Mobile: modal inferior e painel lateral com imagem e campos | Passou |
| Erros JavaScript durante teste de navegador | Nenhum |
| OAuth e importação ML com conta real no Railway | Pendente da configuração e autorização do administrador |
| Upload de imagem importada ao S3 de produção | Não executado; pipeline de validação/upload coberto por testes existentes |

O teste real anterior do cliente HTTP também extraiu os campos do tapete Amazon
(R$ 32,38). Os valores são instantâneos da consulta anônima, sem frete.

## Evidências e reprodução

`npm run test:browser` recria o ambiente isolado e gera `results.json`, `server.log`
e screenshots em `outputs/product-import-browser/` (ignorados pelo Git).
Os screenshots aguardam os painéis entrarem no viewport e terminarem as animações.

Para repetir também o acesso real à loja, defina `LIVE_PRODUCT_URL` com o link da
Amazon antes do comando. A suíte padrão usa respostas determinísticas de prévia;
autenticação, salvamento e banco são reais nos dois modos.

O build local com Turbopack encontrou restrição de criação de portas no ambiente;
a validação foi concluída com `npm run build -- --webpack`. O comando padrão do
projeto continua usando Turbopack. A versão Next.js 16.4.0 inicialmente bloqueou
o build com avisos de segurança; Next e eslint-config-next foram atualizados para
16.4.6, na mesma linha. Isso não representa uma auditoria ou correção de todas as
dependências do projeto.

## Conclusão

Implementação pronta para teste configurado no Railway. O fluxo de importação e
revisão foi validado. Acesso aos campos/preços do Mercado Livre continua dependendo
das permissões efetivas da conta autorizada e deve ser confirmado em produção.
