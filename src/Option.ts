import { panic } from "@frank-mayer/panic"

/**
 * Type `Option` represents an optional value: every `Option` is either `some` and contains a value, or `none`, and does not.
 */
export class Option<T> {
    protected readonly _value: T | undefined

    protected readonly _isSome: boolean

    protected constructor(value: T | undefined, isSome: boolean) {
        this._value = value
        this._isSome = isSome
    }

    /**
     * Creates a new `Option` representing a value.
     *
     * @example
     * ```TypeScript
     * const some = Option.some(42)
     * ```
     */
    public static some<T>(value: T): Option<T> {
        return new Option(value, true)
    }

    private static _none: Option<never> = new Option<never>(undefined as never, false)

    /**
     * Creates a new `Option` representing no value.
     *
     * @example
     * ```TypeScript
     * const none = Option.none<number>()
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
     * const a = Option.some(42)
     * const b = Option.none<number>()
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
     * const a = Option.some(42)
     * const b = Option.none<number>()
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
     * const a = Option.some(42)
     * const b = Option.none<number>()
     *
     * a.unwrap() // 42
     * b.unwrap() // panics
     * ```
     */
    public unwrap(): T {
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
     * const a = Option.some(42)
     * const b = Option.none<number>()
     *
     * a.unwrapOr(0) // 42
     * b.unwrapOr(0) // 0
     * ```
     */
    public unwrapOr(defaultValue: T): T {
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
     * const a = Option.some(42)
     * const b = Option.none<number>()
     *
     * a.unwrapOrElse(() => 0) // 42
     * b.unwrapOrElse(() => 0) // 0
     * ```
     */
    public unwrapOrElse(defaultValue: () => T): T {
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
     * const a = Option.some(42)
     * const b = Option.none<number>()
     *
     * a.map(x => x * 2) // Option.some(84)
     * b.map(x => x * 2) // Option.none<number>()
     * ```
     */
    public map<U>(f: (value: T) => U): Option<U> {
        if (this._isSome) {
            return Option.some(f(this._value as T))
        }

        return Option.none()
    }

    /**
     * Returns `this` option if it contains a value, otherwise returns the other `Option`.
     *
     * @example
     * ```TypeScript
     * const a = Option.some(42)
     * const b = Option.none<number>()
     * const c = Option.some(0)
     *
     * a.or(c) // Option.some(42)
     * b.or(c) // Option.some(0)
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
     * const a = Option.some(42)
     * const b = Option.none<number>()
     * const c = Option.some(0)
     *
     * a.orElse(() => c) // Option.some(42)
     * b.orElse(() => c) // Option.some(0)
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
     * const a = Option.some(42)
     * const b = Option.none<number>()
     * const c = Option.some(0)
     *
     * a.and(c) // Option.some(0)
     * b.and(c) // Option.none<number>()
     * ```
     */
    public and<U>(other: Option<U>): Option<U> {
        if (this._isSome) {
            return other
        }

        return Option.none()
    }

    /**
     * Returns the other `Option` if `this` contains a value, otherwise returns `none`.
     *
     * @example
     * ```TypeScript
     * const a = Option.some(42)
     * const b = Option.none<number>()
     *
     * a.andThen(x => Option.some(x * 2)) // Option.some(84)
     * b.andThen(x => Option.some(x * 2)) // Option.none<number>()
     * ```
     */
    public andThen<U>(other: (value: T) => Option<U>): Option<U> {
        if (this._isSome) {
            return other(this._value as T)
        }

        return Option.none()
    }

    /**
     * Runs one of the provided functions depending on the value of the option.
     * @param some A function to run if `this` is `some`.
     * @param none A function to run if `this` is `none`.
     * @returns The return value of the function that was run.
     *
     * @example
     * ```TypeScript
     * const a = Option.some(42)
     * const b = Option.none<number>()
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
    public match<U>(some: (value: T) => U, none: () => U): U {
        return this._isSome
            ? some(this._value as T)
            : none()
    }
}

/**
 * Creates a new `Option` representing a value.
 *
 * @example
 * ```TypeScrip
 * const a = Option.some(42)
 * const b = Option.some("hello")
 * ```
 */
export const some = <T>(value: T) => Option.some<T>(value)

/**
 * Creates a new `Option` representing no value.
 *
 * @example
 * ```TypeScript
 * const a = Option.none<number>()
 * const b = Option.none<string>()
 * ```
 */
export const none = <T>() => Option.none<T>()
