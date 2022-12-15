
/**
 * Type `Option` represents an optional value: every `Option` is either `Option.Some` and contains a value, or `Option.None`, and does not.
 */
export class Option<T> {
    protected _value: T | undefined

    /**
     * Checks if the option is `Some`.
     */
    public readonly isSome: boolean

    protected constructor(value: T | undefined, isSome: boolean) {
        this._value = value
        this.isSome = isSome
    }

    /**
     * Creates a new `Option` representing a value.
     */
    public static Some<T>(value: T): Option<T> {
        return new Option(value, true)
    }

    /**
     * Creates a new `Option` representing no value.
     */
    public static None<T>(): Option<T> {
        return new Option<T>(undefined, false)
    }

    /**
     * Checks if the option is `None`.
     */
    public get isNone(): boolean {
        return !this.isSome
    }

    /**
     * Returns the contained `Some` value.
     * Throws an error if the value is an `None`.
     */
    public unwrap(): T {
        if (this.isNone) {
            throw new Error("Called Option::unwrap on None")
        }

        return this._value as T
    }

    /**
     * Returns the contained `Some` value or a provided default.
     * @param defaultValue The default value to return.
     */
    public unwrapOr(defaultValue: T): T {
        if (this.isNone) {
            return defaultValue
        }

        return this._value as T
    }

    /**
     * Returns the contained `Some` value or computes it from the given function.
     * @param defaultValue A function that returns the default value to return.
     * @returns The contained `Some` value or the provided default value.
     */
    public unwrapOrElse(defaultValue: () => T): T {
        if (this.isNone) {
            return defaultValue()
        }

        return this._value as T
    }

    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.
     * @param f The function to apply.
     */
    public map<U>(f: (value: T) => U): Option<U> {
        if (this.isSome) {
            return Option.Some(f(this._value as T))
        }

        return Option.None()
    }

    /**
     * Returns `this` option if it contains a value, otherwise returns the other `Option`.
     */
    public or(other: Option<T>): Option<T> {
        if (this.isSome) {
            return this
        }

        return other
    }

    /**
     * Returns the option if it contains a value, otherwise calls the provided function and returns the result.
     * @param defaultValue A function that returns the default value to return.
     */
    public orElse(defaultValue: () => Option<T>): Option<T> {
        if (this.isSome) {
            return this
        }

        return defaultValue()
    }

    /**
     * Returns the other option if `this` contains a value, otherwise returns `None`.
     * @param other
     * @returns
     */
    public and<U>(other: Option<U>): Option<U> {
        if (this.isSome) {
            return other
        }

        return Option.None()
    }

    /**
     * Returns the other `Option` if `this` contains a value, otherwise returns `None`.
     */
    public andThen<U>(other: (value: T) => Option<U>): Option<U> {
        if (this.isSome) {
            return other(this._value as T)
        }

        return Option.None()
    }

    /**
     * Runs one of the provided functions depending on the value of the option.
     * @param some A function to run if `this` is `Some`.
     * @param none A function to run if `this` is `None`.
     * @returns The return value of the function that was run.
     */
    public match<U>(some: (value: T) => U, none: () => U): U {
        return this.isSome
            ? some(this._value as T)
            : none()
    }
}
