import { UserStatus } from "./domain.js";
import { fail, ok } from "./result.js";
export const USERS_API_URL = "https://jsonplaceholder.typicode.com/users";

function isRemoteUser(value) {
    if (typeof value !== "object" || value === null)
        return false;
    const candidate = value;
    return (typeof candidate.id === "number" &&
        typeof candidate.name === "string" &&
        typeof candidate.email === "string");
}

function toAddress(value) {
    if (typeof value !== "object" || value === null)
        return undefined;
    const { street, suite, city, zipcode } = value;
    if (typeof street !== "string" || typeof city !== "string" || typeof zipcode !== "string")
        return undefined;
    return typeof suite === "string" ? { street, suite, city, zipcode } : { street, city, zipcode };
}
export async function fetchRemoteUsers(url = USERS_API_URL) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return fail("NETWORK_ERROR", `API respondeu com status ${response.status}.`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            return fail("INVALID_INPUT", "Resposta da API nao e uma lista.");
        }
        // A API nao tem perfil nem status: todo usuario importado entra como "viewer" e Active.
        return ok(data.filter(isRemoteUser).map(({ name, email, address }) => ({
            name,
            email,
            role: "viewer",
            status: UserStatus.Active,
            address: toAddress(address),
        })));
    }
    catch (error) {
        return fail("NETWORK_ERROR", error instanceof Error ? error.message : "Falha de rede.");
    }
}
