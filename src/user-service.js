import { PERMISSIONS_BY_ROLE, UserStatus, } from "./domain.js";
import { InMemoryRepository } from "./repository.js";
import { fail, ok } from "./result.js";
import { assertNever, paginate, sortBy } from "./utils.js";
import { isRole, isValidEmail, parseAddress, parseNewUserInput } from "./validators.js";
export class UserService {
    #repo;
    static nextId = 1;
    constructor(repo = new InMemoryRepository()) {
        this.#repo = repo;
    }
    static generateId() {
        return `usr_${UserService.nextId++}`;
    }
    static describeStatus(status) {
        switch (status) {
            case UserStatus.Active:
                return "Ativo";
            case UserStatus.Suspended:
                return "Suspenso";
            case UserStatus.Deactivated:
                return "Desativado";
            default:
                return assertNever(status);
        }
    }
    createUser(input) {
        const parsed = parseNewUserInput(input);
        if (!parsed.ok)
            return parsed;
        if (this.emailInUse(parsed.value.email)) {
            return fail("DUPLICATE_EMAIL", `E-mail ja cadastrado: ${parsed.value.email}`);
        }
        const user = {
            ...parsed.value,
            id: UserService.generateId(),
            createdAt: new Date(),
        };
        this.#repo.save(user);
        return ok({ ...user });
    }

    createMany(...inputs) {
        return inputs.map((input) => this.createUser(input));
    }
    updateUser(id, patch) {
        const current = this.#repo.findById(id);
        if (!current)
            return fail("NOT_FOUND", `Usuario ${id} nao encontrado.`);
        if (patch.name !== undefined && patch.name.trim().length < 2) {
            return fail("INVALID_INPUT", "Nome deve ter ao menos 2 caracteres.");
        }
        if (patch.email !== undefined) {
            if (!isValidEmail(patch.email))
                return fail("INVALID_INPUT", "E-mail invalido.");
            if (this.emailInUse(patch.email, id)) {
                return fail("DUPLICATE_EMAIL", `E-mail ja cadastrado: ${patch.email}`);
            }
        }

        if (patch.role !== undefined && !isRole(patch.role)) {
            return fail("INVALID_INPUT", "Perfil invalido.");
        }
        const updated = { ...current, ...patch };
        if (patch.address !== undefined) {
            const parsed = parseAddress(patch.address);
            if (!parsed.ok)
                return parsed;
            updated.address = parsed.value;
        }
        this.#repo.save(updated);
        return ok({ ...updated });
    }
    can(id, permission) {
        const user = this.#repo.findById(id);
        return user?.status === UserStatus.Active && PERMISSIONS_BY_ROLE[user.role].includes(permission);
    }
    list({ status, city, sortBy: key = "name", page, pageSize } = {}) {
        const wantedCity = city?.trim().toLowerCase();
        const filtered = this.#repo
            .findAll()
            .filter((u) => status === undefined || u.status === status)
            .filter((u) => !wantedCity || u.address?.city.toLowerCase() === wantedCity);
        return paginate(sortBy(filtered, key), page, pageSize);
    }
    emailInUse(email, ignoreId) {
        const normalized = email.trim().toLowerCase();
        return this.#repo.findAll().some((u) => u.email === normalized && u.id !== ignoreId);
    }
}
