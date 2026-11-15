export class InMemoryRepository {
    #items = new Map();
    findById(id) {
        return this.#items.get(id);
    }
    findAll() {
        return [...this.#items.values()];
    }
    save(entity) {
        this.#items.set(entity.id, entity);
    }
    remove(id) {
        return this.#items.delete(id);
    }
}

