import { ROLES, UserStatus } from "./src/domain.js";
import { fetchRemoteUsers, USERS_API_URL } from "./src/user-api.js";
import { UserService } from "./src/user-service.js";
import { formatAddress } from "./src/utils.js";

const service = new UserService();
const $ = (id) => document.getElementById(id);

const PERMISSIONS = ["user:read", "user:write", "user:delete"];
const ADDRESS_FIELDS = ["street", "suite", "city", "zipcode"];

function showResult(result, successText) {
  const box = $("message");
  box.className = result.ok ? "ok" : "error";
  box.textContent = result.ok ? successText : `${result.error.code}: ${result.error.message}`;
}

function showText(kind, text) {
  $("message").className = kind;
  $("message").textContent = text;
}

function fillSelect(select, values, labelFn = (v) => v) {
  for (const value of values) {
    select.append(new Option(labelFn(value), value));
  }
}

function cell(row, content) {
  const td = row.insertCell();
  if (content instanceof Node) td.append(content);
  else td.textContent = content;
  return td;
}

function roleSelect(user) {
  const select = document.createElement("select");
  fillSelect(select, ROLES);
  select.value = user.role;
  select.addEventListener("change", () => {
    showResult(service.updateUser(user.id, { role: select.value }), `Perfil de ${user.name} alterado.`);
    render();
  });
  return select;
}

function statusBadge(status) {
  const span = document.createElement("span");
  span.className = `badge ${status}`;
  span.textContent = UserService.describeStatus(status);
  return span;
}

function permissionList(user) {
  const wrap = document.createElement("span");
  for (const permission of PERMISSIONS) {
    const span = document.createElement("span");
    span.className = `perm ${service.can(user.id, permission) ? "yes" : "no"}`;
    span.textContent = permission.replace("user:", "");
    wrap.append(span);
  }
  return wrap;
}

function readAddressFromForm() {
  const values = Object.fromEntries(ADDRESS_FIELDS.map((field) => [field, $(field).value]));
  const anyFilled = ADDRESS_FIELDS.some((field) => values[field].trim() !== "");
  return anyFilled ? values : undefined;
}

function render() {
  const [users, total] = service.list({
    status: $("filter").value || undefined,
    city: $("cityFilter").value,
    sortBy: $("sort").value,
  });
  const rows = $("rows");
  rows.replaceChildren();
  for (const user of users) {
    const row = rows.insertRow();
    cell(row, user.id);
    cell(row, user.name);
    cell(row, user.email);
    cell(row, formatAddress(user.address));
    cell(row, roleSelect(user));
    cell(row, statusBadge(user.status));
    cell(row, permissionList(user));
  }
  $("total").textContent = `${total} usuário(s)`;
}

$("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const result = service.createUser({
    name: $("name").value,
    email: $("email").value,
    role: $("role").value,
    status: $("status").value,
    address: readAddressFromForm(),
  });
  showResult(result, "Usuário criado.");
  if (result.ok) event.target.reset();
  render();
});

$("seed").addEventListener("click", () => {
  const results = service.createMany(
    {
      name: "Ana Souza",
      email: "ana@exemplo.com",
      role: "admin",
      address: { street: "Rua das Flores", suite: "Apto 12", city: "Curitiba", zipcode: "80010-0000" },
    },
    {
      name: "Bruno Lima",
      email: "bruno@exemplo.com",
      role: "editor",
      address: { street: "Av. Brasil", city: "Curitiba", zipcode: "80020-1000" },
    },
    { name: "Carla Dias", email: "carla@exemplo.com" },
    { name: "Davi Costa", email: "davi@exemplo.com", role: "editor", status: UserStatus.Suspended },
    { name: "Eva Rocha", email: "eva@exemplo.com", status: UserStatus.Deactivated },
  );
  const created = results.filter((r) => r.ok).length;
  showText(created > 0 ? "ok" : "error", `${created} exemplo(s) carregado(s).` + (created < results.length ? " Os demais já existiam." : ""));
  render();
});

$("import").addEventListener("click", async () => {
  const button = $("import");
  button.disabled = true;
  showText("", "Buscando usuários na API...");
  const remote = await fetchRemoteUsers();
  button.disabled = false;
  if (!remote.ok) {
    showResult(remote, "");
    return;
  }
  const results = service.createMany(...remote.value);
  const created = results.filter((r) => r.ok).length;
  showText("ok", `${created} de ${results.length} usuário(s) importado(s) de ${USERS_API_URL}.` + (created < results.length ? " Os demais já existiam." : ""));
  render();
});

fillSelect($("role"), ROLES);
$("role").value = "viewer";
fillSelect($("status"), Object.values(UserStatus), UserService.describeStatus);
fillSelect($("filter"), Object.values(UserStatus), UserService.describeStatus);
$("filter").addEventListener("change", render);
$("cityFilter").addEventListener("input", render);
$("sort").addEventListener("change", render);
render();
