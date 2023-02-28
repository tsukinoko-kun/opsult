/**
 * A type that can be converted into a {@link Future}.
 */
export interface IntoFuture<T, E> {
    /**
     * A function that can be used to create the {@link Future}.
     */
    get futureExecutor(): (ok: (value: T) => void, err: (reason: E) => void) => void
}
