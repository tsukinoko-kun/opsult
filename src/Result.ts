import { panic } from "@frank-mayer/panic"
import type { IntoFuture } from "./IntoFuture"

/**
 * `Result<T, E>` is the type used for returning and propagating errors.
 * Use `ok` to return a successful result and `err` to return an error.
 */
export class Result<T, E> implements IntoFuture<T, E> {
    protected readonly _value: T | E

    protected readonly _isOk: boolean

    public get futureExecutor() {
        if (this._isOk) {
            return (resolveOk: (value: T) => void) =>
                resolveOk(this._value as T)
        }
        return (_: (value: T) => void, resolveErr: (reason: E) => void) =>
            resolveErr(this._value as E)
    }

    protected constructor(value: T | E, isOk: boolean) {
        this._value = value
        this._isOk = isOk
    }

    /**
     * Creates a new `Result` representing a successful result.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = ok("Hello World")
     * ```
     */
    public static ok<T, E>(value: T): Result<T, E> {
        return new Result<T, E>(value, true)
    }

    /**
     * Creates a new `Result` representing an error.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = err(42)
     * const b: Result<number, string> = err("Hello World")
     * ```
     */
    public static err<T, E>(error: E): Result<T, E> {
        return new Result<T, E>(error, false)
    }

    /**
     * Checks if the result is `ok`.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.isOk() // true
     * b.isOk() // false
     * ```
     */
    public isOk(): boolean {
        return this._isOk
    }

    /**
     * Checks if the result is `err`.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.isErr() // false
     * b.isErr() // true
     * ```
     */
    public isErr(): boolean {
        return !this._isOk
    }

    /**
     * Returns `res` if the result is `ok`, otherwise returns the `err` value of `this`.
     * Arguments passed to and are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `andThen`, which is lazily evaluated.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     * const c: Result<number, string> = ok(13)
     *
     * a.and(c) // ok(13)
     * b.and(c) // err("Hello World")
     * ```
     */
    public and<U>(res: Result<U, E>): Result<U, E> {
        if (this._isOk) {
            return res
        }

        return this as unknown as Result<U, E>
    }

    /**
     * Returns `res` if the result is `err`, otherwise returns the `ok` value of `this`.
     * Arguments passed to or are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `orElse`, which is lazily evaluated.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     * const c: Result<number, string> = err(13)
     *
     * a.or(c) // ok(42)
     * b.or(c) // err(13)
     * ```
     */
    public or<F>(res: Result<T, F>): Result<T, F> {
        if (this._isOk) {
            return this as unknown as Result<T, F>
        }

        return res
    }

    /**
     * Calls `f` if the result is `ok`, otherwise returns the `err` value of `this`.
     * Often used to chain fallible operations that may return `err`.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     * const f = (x: number) => ok<number, string>(x + 1)
     *
     * a.andThen(f) // ok(43)
     * b.andThen(f) // err("Hello World")
     * ```
     */
    public andThen<U>(f: (value: Readonly<T>) => Result<U, E>): Result<U, E> {
        if (this._isOk) {
            return f(this._value as T)
        }

        return this as unknown as Result<U, E>
    }

    /**
     * Calls `f` if the result is `err`, otherwise returns the `ok` value of `this`.
     * This function can be used for control flow based on result values.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     * const f = (x: string) => ok<number, string>(x.length)
     *
     * a.orElse(f) // ok(42)
     * b.orElse(f) // ok(11)
     * ```
     */
    public orElse<F>(f: (error: Readonly<E>) => Result<T, F>): Result<T, F> {
        if (this._isOk) {
            return this as unknown as Result<T, F>
        }

        return f(this._value as E)
    }

    /**
     * Returns the contained `ok` value.
     * Panics if the value is an `err`.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.unwrap() // 42
     * b.unwrap() // panic
     * ```
     */
    public unwrap(): Readonly<T> {
        if (this._isOk) {
            return this._value as T
        }

        panic("Called Result::unwrap on Err")
    }

    /**
     * Returns the contained `err` value of `this`.
     * Panics if the value is an `ok`.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.unwrapErr() // panic
     * b.unwrapErr() // "Hello World"
     * ```
     */
    public unwrapErr(): Readonly<E> {
        if (this._isOk) {
            panic("Called Result::unwrapErr on Ok")
        }

        return this._value as E
    }

    /**
     * Returns the contained `ok` value of `this`.
     * @param defaultValue The default value to return if the result is an `err`.
     * @returns The contained `ok` value or the provided default value.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.unwrapOr(0) // 42
     * b.unwrapOr(0) // 0
     * ```
     */
    public unwrapOr(defaultValue: T): Readonly<T> {
        if (this._isOk) {
            return this._value as T
        }

        return defaultValue
    }

    /**
     * Returns the contained `ok` value of `this` or computes it from the given function.
     * @param defaultValue A function that returns the default value to return if the result is an `err`.
     * @returns The contained `ok` value or the provided default value.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.unwrapOrElse(() => 0) // 42
     * b.unwrapOrElse(() => 0) // 0
     * ```
     */
    public unwrapOrElse(defaultValue: () => T): Readonly<T> {
        if (this._isOk) {
            return this._value as T
        }

        return defaultValue()
    }

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
     * @param f The function to apply.
     * @returns The `Result` of the function.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.map(x => x * 2) // ok(84)
     * b.map(x => x * 2) // err("Hello World")
     * ```
     */
    public map<U>(f: (value: Readonly<T>) => U): Result<U, E> {
        if (this._isOk) {
            return ok(f(this._value as T))
        }

        return this as unknown as Result<U, E>
    }

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `err` value, leaving an `ok` value untouched.
     * @param f The function to apply.
     * @returns The `Result` of the function.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.mapErr(x => x.length) // ok(42)
     * b.mapErr(x => x.length) // err(11)
     * ```
     */
    public mapErr<F>(f: (error: Readonly<E>) => F): Result<T, F> {
        if (this._isOk) {
            return this as unknown as Result<T, F>
        }

        return err(f(this._value as E))
    }

    /**
     * Runs one of the provided functions depending on the value of `this` result.
     * @param ok The function to run if the result is `ok`.
     * @param err The function to run if the result is `err`.
     * @returns The return value of the function that was run.
     *
     * @example
     * ```TypeScript
     * const a: Result<number, string> = ok(42)
     * const b: Result<number, string> = err("Hello World")
     *
     * a.match(
     *     x => x * 2,
     *     x => x.length
     * ) // 84
     *
     * b.match(
     *     x => x * 2,
     *     x => x.length
     * ) // 11
     */
    public match<U>(
        ok: (value: Readonly<T>) => U,
        err: (error: Readonly<E>) => U
    ): U {
        return this._isOk ? ok(this._value as T) : err(this._value as E)
    }
}

/**
 * Creates a new `Result` representing a successful result.
 *
 * @example
 * ```TypeScript
 * const a: Result<number, string> = ok(42)
 * const b: Result<number, string> = err("Hello World")
 *
 * a.isOk() // true
 * b.isOk() // false
 * ```
 */
export const ok = <T, E>(value: T): Result<T, E> => Result.ok(value)

/**
 * Creates a new `Result` representing an error.
 *
 * @example
 * ```TypeScript
 * const a: Result<number, string> = ok(42)
 * const b: Result<number, string> = err("Hello World")
 *
 * a.isErr() // false
 * b.isErr() // true
 * ```
 */
export const err = <T, E>(error: E): Result<T, E> => Result.err(error)
