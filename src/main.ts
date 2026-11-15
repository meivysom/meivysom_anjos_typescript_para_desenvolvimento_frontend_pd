import { UserStatus, Role } from "./domain.js";
import { fetchRemoteUsers } from "./user-api.js";
import { UserService } from "./user-service.js";

const service = new UserService();

const results = service.createMany(
  {
    name: "Ana Souza",
    email: "ANA@exemplo.com",
    role: Role.Admin,
    address: { street: "Rua das Flores", suite: "Apto 12", city: "Curitiba", zipcode: "80010-0000" },
  },
  { name: "Bruno Lima", email: "bruno@exemplo.com" },
  { name: "Davi Costa", email: "davi@exemplo.com", status: UserStatus.Suspended }, // cadastrado como suspenso
  { name: "Eva Rocha", email: "eva@exemplo.com", status: "bloqueado" }, // status invalido
  { name: "Ana Clone", email: "ana@exemplo.com" }, // e-mail duplicado
  { name: "X", email: "invalido" }, // dados invalidos
  { name: "Carla Dias", email: "carla@exemplo.com", address: { street: "Rua A", city: "Lima", zipcode: "abc" } }, // CEP invalido
  "nao e objeto", // unknown inesperado
);

results.forEach((r, i) => console.log(`#${i + 1}`, r.ok ? `OK ${r.value.id} ${r.value.email}` : `ERRO ${r.error.code}: ${r.error.message}`));

const bruno = results[1];
if (bruno?.ok) {
  console.log("Bruno pode escrever?", service.can(bruno.value.id, "user:write")); // false (viewer)
  console.log(service.updateUser(bruno.value.id, { role: Role.Viewer }));
  console.log("Bruno pode escrever?", service.can(bruno.value.id, "user:write")); // true
}

const [page, total] = service.list({ status: UserStatus.Suspended, sortBy: "email", page: 1, pageSize: 5 });
console.log(`Suspensos: ${page.length} de ${total}`);


// Importacao de usuarios de uma API publica (precisa de internet; falhas voltam como Result).
const remote = await fetchRemoteUsers();
if (remote.ok) {
  const imported = service.createMany(...remote.value);
  console.log(`Importados da API: ${imported.filter((r) => r.ok).length} de ${imported.length}`);
} else {
  console.log(`Importacao falhou (${remote.error.code}): ${remote.error.message}`);
}

