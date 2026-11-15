export function sortBy(items, key) {
    return [...items].sort((a, b) => {
        const x = a[key];
        const y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
    });
}
export function paginate(items, page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    return [items.slice(start, start + pageSize), items.length];
}
// Checagem de exaustividade: se um caso de union/enum ficar sem tratamento, nao compila.
export function assertNever(value) {
    throw new Error(`Caso nao tratado: ${String(value)}`);
}
export function formatAddress(address) {
    if (!address)
        return "Sem endereco";
    const street = address.suite ? `${address.street}, ${address.suite}` : address.street;
    return `${street} - ${address.city} (${address.zipcode})`;
}
