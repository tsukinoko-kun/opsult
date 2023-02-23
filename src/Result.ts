import { panic } from "@frank-mayer/panic"

/**
 * `Result<T, E>` is the type used for returning and propagating errors.
 * Use `ok` to return a successful result and `err` to return an error.
 */
export class Result<T, E> {
    protected readonly _value: T | E

    protected readonly _isOk: boolean

    protected constructor(value: T | E, isOk: boolean) {
        this._value = value
        this._isOk = isOk
    }

    /**
     * Creates a new `Result` representing a successful result.
     */
    public static ok<T, E>(value: T): Result<T, E> {
        return new Result<T, E>(value, true)
    }

    /**
     * Creates a new `Result` representing an error.
     */
    public static err<T, E>(error: E): Result<T, E> {
        return new Result<T, E>(error, false)
    }

    /**
     * Checks if the result is `ok`.
     */
    public isOk(): boolean {
        return this._isOk
    }

    /**
     * Checks if the result is `err`.
     */
    public isErr(): boolean {
        return !this._isOk
    }

    /**
     * Returns the contained `ok` value.
     * Panics if the value is an `err`.
     */
    public unwrap(): T {
        if (this._isOk) {
            return this._value as T
        }

        panic("Called Result::unwrap on Err")
    }

    /**
     * Returns the contained `err` value.
     * Panics if the value is an `ok`.
     */
    public unwrapErr(): E {
        if (this._isOk) {
            panic("Called Result::unwrapErr on Ok")
        }

        return this._value as E
    }

    /**
     * Returns the contained `ok` value.
     * @param defaultValue The default value to return if the result is an `err`.
     * @returns The contained `ok` value or the provided default value.
     */
    public unwrapOr(defaultValue: T): T {
        if (this._isOk) {
            return this._value as T
        }

        return defaultValue
    }

    /**
     * Returns the contained `ok` value or computes it from the given function.
     * @param defaultValue A function that returns the default value to return if the result is an `err`.
     * @returns The contained `ok` value or the provided default value.
     */
    public unwrapOrElse(defaultValue: () => T): T {
        if (this._isOk) {
            return this._value as T
        }

        return defaultValue()
    }

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
     * @param f The function to apply.
     * @returns The `Result` of the function.
     */
    public map<U>(f: (value: T) => U): Result<U, E> {
        if (this._isOk) {
            return Result.ok(f(this._value as T))
        }

        return this as unknown as Result<U, E>
    }

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `err` value, leaving an `ok` value untouched.
     * @param f The function to apply.
     * @returns The `Result` of the function.
     */
    public mapErr<F>(f: (error: E) => F): Result<T, F> {
        if (this._isOk) {
            return this as unknown as Result<T, F>
        }

        return Result.err(f(this._value as E))
    }

    /**
     * Runs one of the provided functions depending on the value of `this` result.
     * @param ok The function to run if the result is `ok`.
     * @param err The function to run if the result is `err`.
     * @returns The return value of the function that was run.
     */
    public match<U>(ok: (value: T) => U, err: (error: E) => U): U {
        return this._isOk
            ? ok(this._value as T)
            : err(this._value as E)
    }
}

/**
 * Creates a new `Result` representing a successful result.
 */
export const ok = <T, E>(value: T): Result<T, E> => Result.ok(value)

/**
 * Creates a new `Result` representing an error.
 */
export const err = <T, E>(error: E): Result<T, E> => Result.err(error)
