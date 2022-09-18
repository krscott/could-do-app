export type Ok<T> = {
  isOk: true;
  value: T;
};

export type Err<E> = {
  isOk: false;
  error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ isOk: true, value });
export const err = <E>(error: E): Err<E> => ({ isOk: false, error });
