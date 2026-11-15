# Gestão de Usuários

Módulo isolado de gestão de usuários em TypeScript (ES Modules), migrado de Javascript puro. O projeto parte de uma
base criada com ajuda de IA e foi adaptado manualmente para TypeScript.

### Tela de teste (HTML + CSS) feito com IA

Removido por complicação ao tentar fazer funcionar, não deu tempo, forma de uso via console esta habilitada, é testada ao subir o projeto, e segue o padrão do projeto origem em Javascript

## Como executar

Requisito: Node.js 20 ou superior.

```bash
npm install
npm run typecheck   # verifica os tipos sem gerar arquivos
npm start           # compila para dist/ e executa src/main.ts compilado
```

Outros comandos:

| Comando             | O que faz                                |
| ------------------- | ---------------------------------------- |
| `npm run build`     | Compila `src/` para `dist/`              |
| `npm run typecheck` | Verifica os tipos (`tsc --noEmit`)       |
| `npm start`         | Compila e roda a demonstração no console |

## Como testar a aplicação

O projeto não tem interface gráfica nem framework de testes. A verificação é feita em duas etapas.

### 1. Verificação de tipos

```bash
npm run typecheck
```

Resultado esperado: nenhuma mensagem de erro e código de saída 0.

### 2. Execução da demonstração

```bash
npm start
```

O `src/main.ts` cria usuários, provoca erros de propósito e imprime o resultado de cada caso.

## Estrutura

| Arquivo                             | Responsabilidade                                                          |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `index.html`, `style.css`, `app.js` | Removida. (feito com IA)                                                  |
| `server.js`                         | Removido. (feito com IA)                                                  |
| `src/domain.ts`                     | Enums `Role` e `UserStatus`, tipos, interfaces e permissões por perfil.   |
| `src/result.ts`                     | Tipo `Result`, códigos de erro e helpers `ok` e `fail`                    |
| `src/validators.ts`                 | Validação de usuário e endereço, `isRole`, `isUserStatus`, `isValidEmail` |
| `src/repository.ts`                 | `InMemoryRepository`, repositório genérico em memória                     |
| `src/utils.ts`                      | `sortBy`, `paginate`, `assertNever`, `formatAddress`                      |
| `src/user-api.ts`                   | Busca usuários na API pública JSONPlaceholder e converte para o domínio.  |
| `src/user-service.ts`               | Classe `UserService` com as regras de negócio                             |
| `src/main.ts`                       | Demonstração no console.                                                  |

## API externa

Os usuários importados vêm de <https://jsonplaceholder.typicode.com/users> (API pública para testes). Dela são
aproveitados nome, e-mail e endereço. Todo usuário importado entra como `viewer` e `active`, pois a API não tem perfil
nem status. Se a rede falhar, o resultado volta como `ERRO_CONEXAO`.
