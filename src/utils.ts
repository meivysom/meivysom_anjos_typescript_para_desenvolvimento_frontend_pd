import type { Address, Page } from "./domain.js";

// Só aceita chaves que existem em T, e mantem o tipo de retorno.
export function sortBy<T, K extends keyof T>(items: readonly T[], key: K): T[] {
  return [...items].sort((a, b) => {
    const x = a[key];
    const y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

export function paginate<T>(items: readonly T[], page = 1, pageSize = 10): Page<T> {
  const start = (page - 1) * pageSize;
  return [items.slice(start, start + pageSize), items.length];
}

// Checagem de exaustividade: se um caso de union/enum ficar sem tratamento, nao compila.
export function assertNever(value: never): never {
  throw new Error(`Caso nao tratado: ${String(value)}`);
}

export function formatAddress(address?: Address): string {
  if (!address) return "Sem endereço";
  const street = address.suite ? `${address.street}, ${address.suite}` : address.street;
  return `${street} - ${address.city} (${address.zipcode})`;
}
