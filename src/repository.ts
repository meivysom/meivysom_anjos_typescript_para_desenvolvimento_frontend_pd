// Utilização de Gererics, utilizado com qualquer entidade que tenha id

export interface Entity {
  readonly id: string;
}

export interface Repository<T extends Entity> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(entity: T): void;
  remove(id: string): boolean;
}

export class InMemoryRepository<T extends Entity> implements Repository<T> {
  private readonly items = new Map<string, T>();

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findAll(): T[] {
    return [...this.items.values()];
  }

  save(entity: T): void {
    this.items.set(entity.id, entity);
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }
}
