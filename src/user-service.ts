import {
  PERMISSIONS_BY_ROLE,
  UserStatus,
  ListPage,
  type Permission,
  type User,
  type UserPatch,
  type Page
} from "./domain.js";
import { InMemoryRepository, type Repository } from "./repository.js";
import { fail, ok, type Result } from "./result.js";
import { assertNever, sortBy, paginate } from "./utils.js";
import { isRole, isValidEmail, parseAddress, parseNewUserInput } from "./validators.js";
export class UserService {
    private static nextId = 1;

    constructor(private readonly repo: Repository<User> = new InMemoryRepository<User>()) {}

    static generateId(): string {
        return `usr_${UserService.nextId++}`;
    }

    static describeStatus(status: UserStatus): string {
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
    
    createUser(input: unknown): Result<User> {
    const parsed = parseNewUserInput(input);
    if (!parsed.ok) return parsed;

    if (this.emailInUse(parsed.value.email)) {
      return fail("EMAIL_DUPLICADO", `E-mail ja cadastrado: ${parsed.value.email}`);
    }
    const user: User = {
      ...parsed.value,
      id: UserService.generateId(),
      createdAt: new Date(),
    };
    this.repo.save(user);
    return ok({ ...user });
  }

  // Rest parameter: aceita N entradas.
  createMany(...inputs: unknown[]): Result<User>[] {
    return inputs.map((input) => this.createUser(input));
  }

  updateUser(id: string, patch: UserPatch): Result<User> {
    const current = this.repo.findById(id);
    if (!current) return fail("NAO_ENCONTRADO", `Usuario ${id} nao encontrado.`);

    if (patch.name !== undefined && patch.name.trim().length < 2) {
      return fail("ENTRADA_INVALIDA", "Nome deve ter ao menos 2 caracteres.");
    }
    if (patch.email !== undefined) {
      if (!isValidEmail(patch.email)) return fail("ENTRADA_INVALIDA", "E-mail invalido.");
      if (this.emailInUse(patch.email, id)) {
        return fail("NAO_ENCONTRADO", `E-mail ja cadastrado: ${patch.email}`);
      }
    }
    // Patch vem de fora em runtime, entao o role tambem e revalidado.
    if (patch.role !== undefined && !isRole(patch.role)) {
      return fail("ENTRADA_INVALIDA", "Perfil invalido.");
    }
    const updated: User = { ...current, ...patch };
    if (patch.address !== undefined) {
      const parsed = parseAddress(patch.address);
      if (!parsed.ok) return parsed;
      updated.address = parsed.value;
    }
    this.repo.save(updated);
    return ok({ ...updated });
  }

  can(id: string, permission: Permission): boolean {
    const user = this.repo.findById(id);
    return user?.status === UserStatus.Active && PERMISSIONS_BY_ROLE[user.role].includes(permission);
  }

  list({ status, city, sortBy: key = "name", page, pageSize }: ListPage = {}): Page<User> {
    const wantedCity = city?.trim().toLowerCase();
    const filtered = this.repo
      .findAll()
      .filter((u) => status === undefined || u.status === status)
      .filter((u) => !wantedCity || u.address?.city.toLowerCase() === wantedCity);
    return paginate(sortBy(filtered, key), page, pageSize);
  }

  private emailInUse(email: string, ignoreId?: string): boolean {
    const normalized = email.trim().toLowerCase();
    return this.repo.findAll().some((u) => u.email === normalized && u.id !== ignoreId);
  }
}
