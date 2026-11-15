// Padronização de errors typados
// Generics
// Interfaces

export type ErrorCode =
  | "ENTRADA_INVALIDA"
  | "EMAIL_DUPLICADO"
  | "NAO_ENCONTRADO"
  | "ERRO_CONEXAO";

export interface AppError {
  code: ErrorCode;
  message: string;
}

export type Success<T> = { ok: true; value: T };
export type Failure = { ok: false; error: AppError };
export type Result<T> = Success<T> | Failure;

export const ok = <T>(value: T): Success<T> => ({ ok: true, value });
export const fail = (code: ErrorCode, message: string): Failure => ({
  ok: false,
  error: { code, message },
});