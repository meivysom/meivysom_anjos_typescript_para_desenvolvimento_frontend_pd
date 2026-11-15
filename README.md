# Gestão de Usuários

Módulo isolado de gestão de usuários em JavaScript puro (ES Modules). É um ponto de partida da migração para TypeScript e foi criado com ajuda de IA.

## Regras

O projeto vai ser commitado no github onde cada commmit vai abordar uma evolução no projeto referente as rublicas solicitadas.
Para analisar a evolução so verificar no hitóricos de commit do projeto.

## Como executar

Requisito: Node.js 20 ou superior. Não há dependências para instalar.

### Tela de teste (HTML + CSS) feito com IA

```bash
npm start
```

Abra <http://localhost:3000> no seu navegador para testar o sistema de forma visual.


### Console

```bash
npm run console
```

Executa `src/main.js`, que imprime os mesmos cenários no terminal e, no fim, importa usuários da API (precisa de internet).

## Regras de negócio

- Nome com pelo menos 2 caracteres. E-mail válido, normalizado em minúsculas e único.
- Endereço é opcional. Se informado, exige rua e cidade (mínimo 2 caracteres) e CEP no formato `12345` ou `12345-6789`. O complemento é opcional.
- Perfis: `admin`, `editor`, `viewer` (padrão `viewer`). Cada perfil tem permissões: `viewer` lê, `editor` lê e escreve, `admin` lê, escreve e exclui.
- Status: `active`, `suspended` ou `deactivated`, definido no cadastro (padrão `active`). O módulo não altera o status depois; ele só é armazenado, exibido e usado em filtro e permissões.
- Só usuários ativos têm permissões.
- A listagem pode filtrar por status e por cidade (sem diferenciar maiúsculas de minúsculas).
- Falhas de negócio retornam `{ ok: false, error }` em vez de lançar exceção.

## Estrutura

| Arquivo | Responsabilidade |
|---------|------------------|
| `index.html`, `style.css`, `app.js` | Tela de teste. Só liga os eventos da página ao módulo. Não tem regra de negócio. (feito com IA) |
| `server.js` | Servidor estático mínimo para a tela. (feito com IA) |
| `src/domain.js` | Constantes do domínio: perfis, status, permissões por perfil. |
| `src/result.js` | Helpers `ok` e `fail` do resultado. |
| `src/validators.js` | Validação de usuário e de endereço, `isRole`, `isValidEmail`. |
| `src/repository.js` | `InMemoryRepository`, repositório em memória reutilizável. |
| `src/utils.js` | `sortBy`, `paginate`, `assertNever`, `formatAddress`. |
| `src/user-api.js` | Busca usuários (e endereços) na API pública JSONPlaceholder e converte para o domínio. |
| `src/user-service.js` | Classe `UserService` com as regras de negócio. |
| `src/main.js` | Demonstração no console. |

## API externa

Os usuários importados vêm de <https://jsonplaceholder.typicode.com/users> (API pública e open source, usada para testes). Dela são aproveitados nome, e-mail e endereço (rua, complemento, cidade e CEP). Todo usuário importado entra como `viewer` e `active`, pois a API não tem perfil nem status. Se a rede falhar, o resultado volta como `NETWORK_ERROR` e a tela mostra a mensagem.
