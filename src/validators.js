import { ROLES, UserStatus } from "./domain.js";
import { fail, ok } from "./result.js";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ZIPCODE_RE = /^\d{5}(-\d{4})?$/;
export function isRole(value) {
    return typeof value === "string" && ROLES.includes(value);
}
export function isUserStatus(value) {
    return typeof value === "string" && Object.values(UserStatus).includes(value);
}
export function isValidEmail(value) {
    return typeof value === "string" && EMAIL_RE.test(value.trim());
}
export function parseAddress(data) {
    if (typeof data !== "object" || data === null) {
        return fail("INVALID_INPUT", "Endereco deve ser um objeto.");
    }
    const { street, suite, city, zipcode } = data;
    if (typeof street !== "string" || street.trim().length < 2) {
        return fail("INVALID_INPUT", "Rua deve ter ao menos 2 caracteres.");
    }
    if (typeof city !== "string" || city.trim().length < 2) {
        return fail("INVALID_INPUT", "Cidade deve ter ao menos 2 caracteres.");
    }
    if (typeof zipcode !== "string" || !ZIPCODE_RE.test(zipcode.trim())) {
        return fail("INVALID_INPUT", "CEP invalido. Use 12345 ou 12345-6789.");
    }
    if (suite !== undefined && typeof suite !== "string") {
        return fail("INVALID_INPUT", "Complemento deve ser texto.");
    }
    const address = { street: street.trim(), city: city.trim(), zipcode: zipcode.trim() };
    if (suite?.trim())
        address.suite = suite.trim();
    return ok(address);
}
export function parseNewUserInput(data) {
    if (typeof data !== "object" || data === null) {
        return fail("INVALID_INPUT", "Entrada deve ser um objeto.");
    }

    const { name, email, role, status, address: rawAddress } = data;
    if (typeof name !== "string" || name.trim().length < 2) {
        return fail("INVALID_INPUT", "Nome deve ter ao menos 2 caracteres.");
    }
    if (!isValidEmail(email)) {
        return fail("INVALID_INPUT", "E-mail invalido.");
    }
    if (role !== undefined && !isRole(role)) {
        return fail("INVALID_INPUT", `Perfil invalido. Use: ${ROLES.join(", ")}.`);
    }
    if (status !== undefined && !isUserStatus(status)) {
        return fail("INVALID_INPUT", `Status invalido. Use: ${Object.values(UserStatus).join(", ")}.`);
    }
    let address;
    if (rawAddress !== undefined) {
        const parsedAddress = parseAddress(rawAddress);
        if (!parsedAddress.ok)
            return parsedAddress;
        address = parsedAddress.value;
    }
    return ok({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role ?? "viewer",
        status: status ?? UserStatus.Active,
        address,
    });
}
