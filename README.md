# Gestão de Usuários

Módulo isolado de gestão de usuários em TypeScript (ES Modules), migrado de Javascript puro. O projeto parte de uma
base criada com ajuda de IA e foi adaptado manualmente para TypeScript.

### Tela de teste (HTML + CSS) feito com IA

A primeira versão da tela (`index.html`, `style.css`, `app.js` e `server.js`) foi removida por complicação ao tentar
fazer funcionar. Uma nova tela foi criada com apoio de IA (Kiro).

| Arquivo          | Responsabilidade                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `index.html`     | Layout da tela: formulário de cadastro, filtros, tabela de usuários e paginação.                    |
| `src/style.css`  | Estilos da tela (cartões, tabela, etiquetas de status e layout responsivo).                         |
| `src/ui.ts`      | Liga a tela ao `UserService`: cadastro, importação da API, filtros, ordenação e paginação.          |
| `vite.config.ts` | Configuração do Vite. O build da tela sai em `dist-web/` (o `dist/` continua sendo do `tsc`).       |

O que a tela faz:

- Cadastra usuários pelo formulário, usando `UserService.createUser`. Os erros de validação aparecem abaixo do formulário.
- Importa usuários da API pública pelo botão "Importar da API" e informa quantos entraram e quantos foram ignorados
  (e-mail já cadastrado ou inválido).
- Lista os usuários cadastrados e importados em uma tabela, com 10 por página.
- Filtra por status e cidade e ordena por nome, e-mail ou data de criação.

Os dados ficam só na memória do navegador. Ao recarregar a página, a lista volta vazia.

Como usar:

```bash
npm run dev         # sobe a tela com o Vite (endereço mostrado no terminal)
npm run build:web   # gera a versão de produção em dist-web/
npm run preview     # serve o resultado do build:web
```

A demonstração via console foi removida. A tela é a única forma de usar e testar o módulo.

## Como executar

Requisito: Node.js 20 ou superior.

```bash
npm install
npm run typecheck   # verifica os tipos sem gerar arquivos
npm run dev         # sobe a tela com o Vite
```

## Mapa de entrega de módulo

### Código do módulo

Todo o código está em `src/`. A ordem de leitura sugerida é `domain.ts`, `result.ts`, `validators.ts`, `repository.ts`,
`user-service.ts` e `user-api.ts`. O `ui.ts` e o `style.css` formam a tela, que usa o módulo sem alterá-lo.

### Modelagem de dados (interfaces, tipos e classes)

| Onde                                  | O que mostra                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/domain.ts`: `Role`, `UserStatus` | Enums de string para perfil e status.                                                              |
| `src/domain.ts`: `User`, `Address`, `NewUserInput`, `ListPage` | Interfaces do domínio. `User` tem `id` e `createdAt` como `readonly`, e `suite` e `address` são opcionais. |
| `src/domain.ts`: `Permission`         | Union de literais (`"user:read" \| "user:write" \| "user:delete"`).                                |
| `src/domain.ts`: `PERMISSIONS_BY_ROLE`| `Record<Role, readonly Permission[]>`, que obriga a cobrir todos os perfis.                        |
| `src/result.ts`: `AppError`, `ErrorCode` | Erro tipado com códigos fechados.                                                               |
| `src/user-service.ts`: `UserService`  | Classe com membro estático (`generateId`, `nextId`), propriedade privada e injeção do repositório pelo construtor. |
| `src/repository.ts`: `InMemoryRepository` | Classe que implementa a interface `Repository<T>`.                                             |

### Uso de generics e tipos avançados

| Onde                                              | O que mostra                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/repository.ts`: `Repository<T extends Entity>` | Generic com restrição: funciona com qualquer entidade que tenha `id`.             |
| `src/result.ts`: `Result<T>`, `ok`, `fail`        | Union discriminada (`ok: true` ou `ok: false`) com generic. O `if (!r.ok)` estreita o tipo. |
| `src/domain.ts`: `UserPatch`, `UserSortKey`       | Tipos derivados com `Partial`, `Pick` e `keyof`, sem repetir campos.               |
| `src/domain.ts`: `Page<T>`                        | Tupla nomeada `[items: T[], total: number]`.                                       |
| `src/utils.ts`: `sortBy<T, K extends keyof T>`    | Só aceita chaves que existem em `T` e mantém o tipo de retorno.                    |
| `src/utils.ts`: `paginate<T>`, `assertNever`      | Generic simples e checagem de exaustividade com `never`.                           |
| `src/validators.ts`, `src/user-api.ts`            | Dados externos entram como `unknown` e são estreitados com type guards (`value is Role`, `value is RemoteUser`). |

### Estrutura de funções e regras de negócio

| Onde                                      | Regra                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/validators.ts`: `parseNewUserInput`, `parseAddress` | Nome com ao menos 2 caracteres, e-mail válido (normalizado em minúsculas), perfil e status dentro dos enums, CEP no formato `12345` ou `12345-6789`. |
| `src/user-service.ts`: `createUser`       | Valida a entrada, rejeita e-mail duplicado e gera o id e a data de criação.                 |
| `src/user-service.ts`: `createMany`       | Rest parameter: cria vários usuários e devolve um `Result` para cada um.                    |
| `src/user-service.ts`: `updateUser`       | Atualização parcial com revalidação de nome, e-mail, perfil e endereço.                     |
| `src/user-service.ts`: `can`              | Só usuário `Active` tem permissão, de acordo com `PERMISSIONS_BY_ROLE`.                     |
| `src/user-service.ts`: `list`             | Filtra por status e cidade, ordena e pagina.                                                |
| `src/user-service.ts`: `describeStatus`   | `switch` exaustivo com `assertNever`.                                                       |
| `src/user-api.ts`: `fetchRemoteUsers`     | Consome a API pública e converte para o domínio. Todo usuário importado entra como `viewer` e `active`. Falhas de rede viram `Result`. |
| `src/ui.ts`                               | Liga a tela às funções acima, sem regra de negócio própria.                                 |

### Configuração do ambiente

| Arquivo          | O que configura                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `package.json`   | ES Modules (`"type": "module"`) e os scripts `build`, `typecheck`, `dev`, `build:web` e `preview`.      |
| `tsconfig.json`  | Alvo `ES2022`, módulos `NodeNext`, `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns` e `noFallthroughCasesInSwitch`. |
| `vite.config.ts` | Vite para a tela, com saída em `dist-web/` para não colidir com o `dist/` do `tsc`.                              |
| `.gitignore`     | Ignora `node_modules`, `dist` e `dist-web`.                                                                      |
| Seção "Como executar" | Requisito de Node.js 20 ou superior e os comandos de uso.                                                   |

### Decisões técnicas justificadas

| Decisão                                              | Justificativa                                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Result<T>` no lugar de exceções                     | Os erros previstos (validação, e-mail duplicado, rede) fazem parte do tipo de retorno, e o compilador obriga a tratá-los. |
| Entradas externas como `unknown` com type guards     | Dados de formulário, de API e de rede não têm garantia de formato. A checagem em tempo de execução é necessária, e o tipo só é afirmado depois dela. |
| Repositório genérico atrás de uma interface          | O `UserService` não depende do armazenamento em memória e aceita outra implementação pelo construtor. |
| Enums e unions de literais                           | Impedem valores fora da lista e permitem a checagem exaustiva com `never`.                     |
| `strict` e `noUncheckedIndexedAccess` ligados        | Pegam erros de `undefined` na compilação, o principal risco na migração de JavaScript.         |
| Importação com extensão `.js` nos imports            | Exigência do `moduleResolution: NodeNext`. O Vite e o `tsc` resolvem esses imports para os `.ts`. |
| Vite para a tela, `tsc` para checar os tipos         | O Vite serve a tela no navegador, e o `tsc` (`npm run typecheck`) valida os tipos do módulo.   |
| Tela como única demonstração                         | A demonstração via console foi removida para ter um só caminho de uso. A tela (`ui.ts`) usa o módulo sem duplicar regra. |
| Dados só em memória                                  | O escopo é o módulo de gestão. Persistência ficou fora.                                        |

### Uso e avaliação crítica de IA

O uso da IA está descrito na seção "Utilização de IA", mais abaixo. A tela (`index.html`, `src/style.css`, `src/ui.ts`) foram geradas com Kiro.

Conclusão: a IA acelerou o módulo base e a tela, mas o código precisou de revisão manual, principalmente nas regras de atualização e nos dados externos.

## API externa

Os usuários importados vêm de <https://jsonplaceholder.typicode.com/users> (API pública para testes). Dela são
aproveitados nome, e-mail e endereço. Todo usuário importado entra como `viewer` e `active`, pois a API não tem perfil
nem status. Se a rede falhar, o resultado volta como `ERRO_CONEXAO`.

## Utilização de IA

Este projeto usou IA como apoio. Abaixo está o que foi gerado por IA.

A IA acelerou o módulo base em Javascript e a tela, mas a refatoração do modulo para Typescript foi feito de forma manual.

### Onde a IA foi usada

  | Etapa | Uso da IA | Ferramenta |
  |-------|-----------|------------|
  | Módulo base em JavaScript | Geração do módulo de gestão de usuários em Javascript (domínio, validadores, repositório, serviço consumo da API e demonstração no console). Corresponde ao commit "Criação de modulo gestao de usuario com consumo de api opensource gerado por IA". | Kiro |
  | Tela de teste (HTML, CSS e servidor) | A primeira versão foi removida. A nova (HTML, CSS, Vite e `ui.ts`) foi gerada por IA e está na versão final. | Kiro |
  | Revisão do projeto | Análise do código | Kiro |
  | Pesquisa documentação Typescript | Algumas perguntas foram feitas na IA por ser mas rápido e fácil de achar já que ela varre a documentação em segundos | |
