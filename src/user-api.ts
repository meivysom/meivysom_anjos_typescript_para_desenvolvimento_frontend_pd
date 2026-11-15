import { Role, UserStatus, type Address, type NewUserInput } from "./domain.js";
import { fail, ok, type Result } from "./result.js";

export const USERS_API_URL = "https://jsonplaceholder.typicode.com/users";

interface RemoteUser {
  id: number;
  name: string;
  email: string;
  address?: Address ;
}

// A resposta é desconhecida pq vem da rede, ate identificação depois da checagem
function isRemoteUser(value: unknown): value is RemoteUser {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string"
  );
}

// Converte o endereco em Address, caso venha em formato errado
function toAddress(value: unknown): Address | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const { street, suite, city, zipcode } = value as Record<string, unknown>;
  if (typeof street !== "string" || typeof city !== "string" || typeof zipcode !== "string") return undefined;
  return typeof suite === "string" ? { street, suite, city, zipcode } : { street, city, zipcode };
}

// Chamada na api publica retorna valores dela e eu incremento perfil e status
export async function fetchRemoteUsers(url: string = USERS_API_URL): Promise<Result<NewUserInput[]>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return fail("ERRO_CONEXAO", `API respondeu com status ${response.status}.`);
    }
    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      return fail("ENTRADA_INVALIDA", "Resposta da API nao e uma lista.");
    }
    // A API nao tem perfil nem status: todo usuario importado entra como "viewer" e Active.
    return ok(data.filter(isRemoteUser).map(
        ({ name, email, address }): NewUserInput => ({
          name,
          email,
          role: Role.Viewer,
          status: UserStatus.Active,
          address: toAddress(address),
        }),
      ));
  } catch (error) {
    return fail("ERRO_CONEXAO", error instanceof Error ? error.message : "Falha de rede.");
  }
}
