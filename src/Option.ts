import { panic } from "@frank-mayer/panic"
import type { IntoFuture } from "./IntoFuture"

/**
 * Type `Option` represents an optional value: every `Option` is either `some` and contains a value, or `none`, and does not.
 */
export class Option<T> implements IntoFuture<T, null> {
    protected readonly _value: T | undefined

    protected readonly _isSome: boolean

    public get futureExecutor() {
        if (this._isSome) {
            return (resolveOk: (value: T) => void) =>
                resolveOk(this._value as T)
        }

        return (_: (value: T) => void, resolveErr: (reason: null) => void) =>
            resolveErr(null)
    }

    protected constructor(value: T | undefined, isSome: boolean) {
        this._value = value
        this._isSome = isSome
    }

    /**
     * Creates a new `Option` representing a value.
     *
     * @example
     * ```TypeScript
     * const some = some(42)
     * ```
     */
    public static some<T>(value: T): Option<T> {
        return new Option(value, true)
    }

    private static _none: Option<never> = new Option<never>(
        undefined as never,
        false
    )

    /**
     * Creates a new `Option` representing no value.
     *
     * @example
     * ```TypeScript
     * const none = none<number>()
     * ```
     */
    public static none<T>(): Option<T> {
        return Option._none as Option<T>
    }

    /**
     * Checks if the option is `some`.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     *
     * a.isSome() // true
     * b.isSome() // false
     * ```
     */
    public isSome(): boolean {
        return this._isSome
    }

    /**
     * Checks if the option is `none`.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     *
     * a.isNone() // false
     * b.isNone() // true
     * ```
     */
    public isNone(): boolean {
        return !this._isSome
    }

    /**
     * Returns the contained `some` value.
     * Panics if the value is an `none`.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     *
     * a.unwrap() // 42
     * b.unwrap() // panics
     * ```
     */
    public unwrap(): Readonly<T> {
        if (this._isSome) {
            return this._value as T
        }

        panic("Called Option::unwrap on None")
    }

    /**
     * Returns the contained `some` value or a provided default.
     * @param defaultValue The default value to return.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     *
     * a.unwrapOr(0) // 42
     * b.unwrapOr(0) // 0
     * ```
     */
    public unwrapOr(defaultValue: T): Readonly<T> {
        if (this._isSome) {
            return this._value as T
        }

        return defaultValue
    }

    /**
     * Returns the contained `some` value or computes it from the given function.
     * @param defaultValue A function that returns the default value to return.
     * @returns The contained `some` value or the provided default value.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     *
     * a.unwrapOrElse(() => 0) // 42
     * b.unwrapOrElse(() => 0) // 0
     * ```
     */
    public unwrapOrElse(defaultValue: () => T): Readonly<T> {
        if (this._isSome) {
            return this._value as T
        }

        return defaultValue()
    }

    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.
     * @param f The function to apply.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     *
     * a.map(x => x * 2) // some(84)
     * b.map(x => x * 2) // none<number>()
     * ```
     */
    public map<U>(f: (value: Readonly<T>) => U): Option<U> {
        if (this._isSome) {
            return some(f(this._value as T))
        }

        return none()
    }

    /**
     * Returns `this` option if it contains a value, otherwise returns the other `Option`.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     * const c = some(0)
     *
     * a.or(c) // some(42)
     * b.or(c) // some(0)
     * ```
     */
    public or(other: Option<T>): Option<T> {
        if (this._isSome) {
            return this
        }

        return other
    }

    /**
     * Returns the option if it contains a value, otherwise calls the provided function and returns the result.
     * @param defaultValue A function that returns the default value to return.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     * const c = some(0)
     *
     * a.orElse(() => c) // some(42)
     * b.orElse(() => c) // some(0)
     * ```
     */
    public orElse(defaultValue: () => Option<T>): Option<T> {
        if (this._isSome) {
            return this
        }

        return defaultValue()
    }

    /**
     * Returns the other option if `this` contains a value, otherwise returns `none`.
     * @param other
     * @returns
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     * const c = some(0)
     *
     * a.and(c) // some(0)
     * b.and(c) // none<number>()
     * ```
     */
    public and<U>(other: Option<U>): Option<U> {
        if (this._isSome) {
            return other
        }

        return none()
    }

    /**
     * Returns the other `Option` if `this` contains a value, otherwise returns `none`.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     *
     * a.andThen(x => some(x * 2)) // some(84)
     * b.andThen(x => some(x * 2)) // none<number>()
     * ```
     */
    public andThen<U>(other: (value: Readonly<T>) => Option<U>): Option<U> {
        if (this._isSome) {
            return other(this._value as T)
        }

        return none()
    }

    /**
     * Runs one of the provided functions depending on the value of the option.
     * @param some A function to run if `this` is `some`.
     * @param none A function to run if `this` is `none`.
     * @returns The return value of the function that was run.
     *
     * @example
     * ```TypeScript
     * const a = some(42)
     * const b = none<number>()
     *
     * a.match(
     *     x => x * 2,
     *     () => 0
     * ) // 84
     *
     * b.match(
     *     x => x * 2,
     *     () => 0
     * ) // 0
     * ```
     */
    public match<U>(some: (value: Readonly<T>) => U, none: () => U): U {
        return this._isSome ? some(this._value as T) : none()
    }
}

/**
 * Creates a new `Option` representing a value.
 *
 * @example
 * ```TypeScrip
 * const a = some(42)
 * const b = some("hello")
 * ```
 */
export const some = <T>(value: T) => Option.some<T>(value)

/**
 * Creates a new `Option` representing no value.
 *
 * @example
 * ```TypeScript
 * const a = none<number>()
 * const b = none<string>()
 * ```
 */
export const none = <T>() => Option.none<T>()
