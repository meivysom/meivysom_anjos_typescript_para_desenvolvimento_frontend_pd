// Modelagem: Literais, enum, interface e tipagem de derivados

export enum Role {
    Admin = "admin",
    Editor = "editor",
    Viewer = "viewer"
}

export enum UserStatus {
  Active = "active",
  Suspended = "suspended",
  Deactivated = "deactivated",
}

export type Permission = "user:read" | "user:write" | "user:delete";

export type UserPatch = Partial<Pick<User, "name" | "email" | "role" | "address">>;
export type UserSortKey = keyof Pick<User, "name" | "email" | "createdAt">;

//Tupla so que nomeada
export type Page<T> = [items: T[], total: number];

export const PERMISSIONS_BY_ROLE: Record<Role, readonly Permission[]> = {
  admin: ["user:read", "user:write", "user:delete"],
  editor: ["user:read", "user:write"],
  viewer: ["user:read"],
};

export interface Address {
  street: string;
  suite?: string;
  city: string;
  zipcode: string;
}

export interface User {
  readonly id: string;
  name: string;
  email: string;
  role: Role;
  address?: Address;
  status: UserStatus;
  readonly createdAt: Date;
}

export interface NewUserInput {
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  address?: Address;
}

export interface ListPage {
  status?: UserStatus;
  city?: string;
  sortBy?: UserSortKey;
  page?: number;
  pageSize?: number;
}