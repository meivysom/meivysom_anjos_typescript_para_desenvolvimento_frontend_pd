import { UserStatus, type User, type UserSortKey } from "./domain.js";
import { fetchRemoteUsers } from "./user-api.js";
import { UserService } from "./user-service.js";
import { isUserStatus } from "./validators.js";

const PAGE_SIZE = 10;

const service = new UserService();
let currentPage = 1;

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} nao encontrado no HTML.`);
  return el as T;
}

const form = byId<HTMLFormElement>("user-form");
const formMessage = byId<HTMLParagraphElement>("form-message");
const usersBody = byId<HTMLTableSectionElement>("users-body");
const filterStatus = byId<HTMLSelectElement>("filter-status");
const filterCity = byId<HTMLInputElement>("filter-city");
const sortSelect = byId<HTMLSelectElement>("sort-by");
const btnImport = byId<HTMLButtonElement>("btn-import");
const btnPrev = byId<HTMLButtonElement>("btn-prev");
const btnNext = byId<HTMLButtonElement>("btn-next");
const pageInfo = byId<HTMLSpanElement>("page-info");

function setMessage(text: string, kind: "error" | "success" | "info" = "info"): void {
  formMessage.textContent = text;
  formMessage.className = kind === "info" ? "message" : `message message--${kind}`;
}

function cell(content: string | Node): HTMLTableCellElement {
  const td = document.createElement("td");
  td.append(content);
  return td;
}

function statusBadge(status: UserStatus): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = `badge badge--${status}`;
  span.textContent = UserService.describeStatus(status);
  return span;
}

function userRow(user: User): HTMLTableRowElement {
  const tr = document.createElement("tr");
  tr.append(
    cell(user.name),
    cell(user.email),
    cell(user.role),
    cell(statusBadge(user.status)),
    cell(user.address?.city ?? "-"),
  );
  return tr;
}

function render(): void {
  const status = isUserStatus(filterStatus.value) ? filterStatus.value : undefined;
  const city = filterCity.value.trim() || undefined;
  const sortBy = sortSelect.value as UserSortKey;

  const [items, total] = service.list({ status, city, sortBy, page: currentPage, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Se a pagina atual deixou de existir (ex.: filtro novo), volta para a ultima valida.
  if (currentPage > totalPages) {
    currentPage = totalPages;
    render();
    return;
  }

  usersBody.replaceChildren();
  if (items.length === 0) {
    const tr = document.createElement("tr");
    tr.className = "table__empty";
    const td = cell("Nenhum usuário encontrado.");
    td.colSpan = 5;
    tr.append(td);
    usersBody.append(tr);
  } else {
    usersBody.append(...items.map(userRow));
  }

  pageInfo.textContent = `Página ${currentPage} de ${totalPages} (${total} usuários)`;
  btnPrev.disabled = currentPage <= 1;
  btnNext.disabled = currentPage >= totalPages;
}

function readFormInput(): Record<string, unknown> {
  const data = new FormData(form);
  const text = (key: string): string => String(data.get(key) ?? "").trim();

  const input: Record<string, unknown> = {
    name: text("name"),
    email: text("email"),
    role: text("role"),
    status: text("status"),
  };

  const address = { street: text("street"), suite: text("suite"), city: text("city"), zipcode: text("zipcode") };
  // Endereco e opcional: so envia se algum campo foi preenchido.
  if (Object.values(address).some((v) => v !== "")) input.address = address;

  return input;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = service.createUser(readFormInput());
  if (!result.ok) {
    setMessage(result.error.message, "error");
    return;
  }
  form.reset();
  setMessage(`Usuário ${result.value.name} cadastrado.`, "success");
  render();
});

btnImport.addEventListener("click", async () => {
  btnImport.disabled = true;
  setMessage("Importando...");
  const remote = await fetchRemoteUsers();
  btnImport.disabled = false;

  if (!remote.ok) {
    setMessage(`Importação falhou (${remote.error.code}): ${remote.error.message}`, "error");
    return;
  }
  const results = service.createMany(...remote.value);
  const imported = results.filter((r) => r.ok).length;
  const skipped = results.length - imported;
  setMessage(
    skipped > 0
      ? `Importados ${imported} de ${results.length} (${skipped} ignorados, e-mail já cadastrado ou inválido).`
      : `Importados ${imported} de ${results.length}.`,
    imported > 0 ? "success" : "error",
  );
  render();
});

function onFilterChange(): void {
  currentPage = 1;
  render();
}
filterStatus.addEventListener("change", onFilterChange);
sortSelect.addEventListener("change", onFilterChange);
filterCity.addEventListener("input", onFilterChange);

btnPrev.addEventListener("click", () => {
  currentPage--;
  render();
});
btnNext.addEventListener("click", () => {
  currentPage++;
  render();
});

render();
