/**
 * `Result<T, E>` is the type used for returning and propagating errors.
 * Use `Result.Ok` to return a successful result and `Result.Err` to return an error.
 */
export class Result<T, E> {
    protected _value: T | E

    /**
     * Checks if the result is `Ok`.
     */
    public readonly isOk: boolean

    protected constructor(value: T | E, isOk: boolean) {
        this._value = value
        this.isOk = isOk
    }

    /**
     * Creates a new `Result` representing a successful result.
     */
    public static Ok<T, E>(value: T): Result<T, E> {
        return new Result<T, E>(value, true)
    }

    /**
     * Creates a new `Result` representing an error.
     */
    public static Err<T, E>(error: E): Result<T, E> {
        return new Result<T, E>(error, false)
    }

    /**
     * Creates a new `Result` from a `Promise`.
     * If the promise resolves, the result will be `Ok`.
     * If the promise rejects, the result will be `Err`.
     */
    public static WrapPromise<T>(promise: Promise<T>) {
        return (
            promise
                .then(Result.Ok)
                .catch(Result.Err)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as Promise<Result<T, any>>
    }

    /**
     * Checks if the result is `Err`.
     */
    public get isErr(): boolean {
        return !this.isOk
    }

    /**
     * Returns the contained `Ok` value.
     * Throws an error if the value is an `Err`.
     */
    public unwrap(): T {
        if (this.isErr) {
            throw new Error("Called Result::unwrap on Err")
        }

        return this._value as T
    }

    /**
     * Returns the contained `Err` value.
     * Throws an error if the value is an `Ok`.
     */
    public unwrapErr(): E {
        if (this.isOk) {
            throw new Error("Called Result::unwrapErr on Ok")
        }

        return this._value as E
    }

    /**
     * Returns the contained `Ok` value.
     * @param defaultValue The default value to return if the result is an `Err`.
     * @returns The contained `Ok` value or the provided default value.
     */
    public unwrapOr(defaultValue: T): T {
        if (this.isErr) {
            return defaultValue
        }

        return this._value as T
    }

    /**
     * Returns the contained `Ok` value or computes it from the given function.
     * @param defaultValue A function that returns the default value to return if the result is an `Err`.
     * @returns The contained `Ok` value or the provided default value.
     */
    public unwrapOrElse(defaultValue: () => T): T {
        if (this.isErr) {
            return defaultValue()
        }

        return this._value as T
    }

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
     * @param f The function to apply.
     * @returns The `Result` of the function.
     */
    public map<U>(f: (value: T) => U): Result<U, E> {
        if (this.isErr) {
            return Result.Err(this._value as E)
        }

        return Result.Ok(f(this._value as T))
    }

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.
     * @param f The function to apply.
     * @returns The `Result` of the function.
     */
    public mapErr<F>(f: (error: E) => F): Result<T, F> {
        if (this.isOk) {
            return Result.Ok(this._value as T)
        }

        return Result.Err(f(this._value as E))
    }

    /**
     * Runs one of the provided functions depending on the value of `this` result.
     * @param ok The function to run if the result is `Ok`.
     * @param err The function to run if the result is `Err`.
     * @returns The return value of the function that was run.
     */
    public match<U>(ok: (value: T) => U, err: (error: E) => U): U {
        return this.isOk
            ? ok(this._value as T)
            : err(this._value as E)
    }
}
