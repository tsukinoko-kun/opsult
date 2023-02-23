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
     */
    public static some<T>(value: T): Option<T> {
        return new Option(value, true)
    }

    private static _none: Option<never> = new Option<never>(undefined as never, false)

    /**
     * Creates a new `Option` representing no value.
     */
    public static none<T>(): Option<T> {
        return Option._none as Option<T>
    }

    /**
     * Checks if the option is `some`.
     */
    public isSome(): boolean {
        return this._isSome
    }

    /**
     * Checks if the option is `none`.
     */
    public isNone(): boolean {
        return !this._isSome
    }

    /**
     * Returns the contained `some` value.
     * Panics if the value is an `none`.
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
     */
    public map<U>(f: (value: T) => U): Option<U> {
        if (this._isSome) {
            return Option.some(f(this._value as T))
        }

        return Option.none()
    }

    /**
     * Returns `this` option if it contains a value, otherwise returns the other `Option`.
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
     */
    public and<U>(other: Option<U>): Option<U> {
        if (this._isSome) {
            return other
        }

        return Option.none()
    }

    /**
     * Returns the other `Option` if `this` contains a value, otherwise returns `none`.
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
     */
    public match<U>(some: (value: T) => U, none: () => U): U {
        return this._isSome
            ? some(this._value as T)
            : none()
    }
}

/**
 * Creates a new `Option` representing a value.
 */
export const some = <T>(value: T) => Option.some<T>(value)

/**
 * Creates a new `Option` representing no value.
 */
export const none = <T>() => Option.none<T>()
