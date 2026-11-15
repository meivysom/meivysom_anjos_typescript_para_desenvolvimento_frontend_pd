/** Validacao de dados externos (unknown) com type guards. */
import { UserStatus, type Address, type NewUserInput, Role } from "./domain.js";
import { fail, ok, type Result } from "./result.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// CEP no formato 12345 ou 12345-6789.
const ZIPCODE_RE = /^\d{5}(-\d{4})?$/;

export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    (Object.values(Role) as string[]).includes(value)
  );
}

export function isUserStatus(value: unknown): value is UserStatus {
  return (
    typeof value === "string" &&
    (Object.values(UserStatus) as string[]).includes(value)
  );
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

export function parseAddress(data: unknown): Result<Address> {
  if (typeof data !== "object" || data === null) {
    return fail("ENTRADA_INVALIDA", "Endereco deve ser um objeto.");
  }
  const { street, suite, city, zipcode } = data as Record<string, unknown>;

  if (typeof street !== "string" || street.trim().length < 2) {
    return fail("ENTRADA_INVALIDA", "Rua deve ter ao menos 2 caracteres.");
  }
  
  if (typeof city !== "string" || city.trim().length < 2) {
    return fail("ENTRADA_INVALIDA", "Cidade deve ter ao menos 2 caracteres.");
  }
  
  if (typeof zipcode !== "string" || !ZIPCODE_RE.test(zipcode.trim())) {
    return fail("ENTRADA_INVALIDA", "CEP invalido. Use 12345 ou 12345-6789.");
  }
  
  if (suite !== undefined && typeof suite !== "string") {
    return fail("ENTRADA_INVALIDA", "Complemento deve ser texto.");
  }
  
  const address: Address = {
    street: street.trim(),
    city: city.trim(),
    zipcode: zipcode.trim(),
  };
  
  if (suite?.trim()) address.suite = suite.trim();
  
  return ok(address);
}

export function parseNewUserInput(data: unknown): Result<NewUserInput> {
  if (typeof data !== "object" || data === null) {
    return fail("ENTRADA_INVALIDA", "Entrada deve ser um objeto.");
  }
  // Asserção segura: ja garantimos que e um objeto nao nulo; cada campo continua unknown.
  const {
    name,
    email,
    role,
    status,
    address: rawAddress,
  } = data as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) {
    return fail("ENTRADA_INVALIDA", "Nome deve ter ao menos 2 caracteres.");
  }
  
  if (!isValidEmail(email)) {
    return fail("ENTRADA_INVALIDA", "E-mail invalido.");
  }

  if (role !== undefined && !isRole(role)) {
    return fail(
      "ENTRADA_INVALIDA",
      `Perfil invalido. Use: ${Object.values(Role).join(", ")}.`,
    );
  }

  if (status !== undefined && !isUserStatus(status)) {
    return fail(
      "ENTRADA_INVALIDA",
      `Status invalido. Use: ${Object.values(UserStatus).join(", ")}.`,
    );
  }

  let address: Address | undefined;

  if (rawAddress !== undefined) {
    const parsedAddress = parseAddress(rawAddress);
    if (!parsedAddress.ok) return parsedAddress;
    address = parsedAddress.value;
  }

  return ok({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role ?? Role.Viewer,
    status: status ?? UserStatus.Active,
    address,
  });
}
