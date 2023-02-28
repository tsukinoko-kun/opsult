import { Panic } from "@frank-mayer/panic"
import { IntoFuture } from "./IntoFuture"
import { Result } from "./Result"

/**
 * `Future<T, E>` is the type used for asynchronous operations.
 *
 * Other than a {@link Promise}, a `Future` has **fixed types for the value and the error**.
 */
export class Future<T, E> extends Promise<Result<T, E>> {
    public get futureExecutor() {
        return (resolveOk: (value: T) => void, resolveErr: (reason: E) => void) => {
            this.then((result) => {
                result.futureExecutor(resolveOk, resolveErr)
            })
        }
    }

    constructor(executor: (ok: (value: T) => void, err: (reason: E) => void) => void) {
        super((resolve) => {
            executor(
                (value: T) => resolve(Result.ok(value)),
                (reason: E) => resolve(Result.err(reason))
            )
        })
    }

    /**
     * Creates a new `Future` from a `Promise`. If the `Promise` rejects, the `Future` will be an `err`.
     * @warning This method assumes that the `Promise` rejects with an `Error`. If the `Promise` rejects with a value that is not an `Error`, it will be wrapped in a `Panic`.
     *
     * @example
     * ```TypeScript
     * const a = Future.from(Promise.resolve(42))
     * const b = Future.from(Promise.reject(new Error("Something went wrong")))
     * const c = Future.from(Promise.reject("Something went wrong"))
     *
     * (await a).unwrap() // 42
     * (await b).unwrapErr().message // "Something went wrong"
     * (await c).unwrapErr().message // "Something went wrong"
     * ```
     */
    public static from<T, E extends Error = Error>(promise: Promise<T>): Future<T, E> {
        return new Future((ok, err) => {
            promise.then(ok).catch((errorValue) => {
                if (typeof errorValue == "object") {
                    if (errorValue instanceof Error) {
                        err(errorValue as E)
                        return
                    }

                    if ("message" in errorValue) {
                        err(new Panic(errorValue.message) as E)
                        return
                    }
                }

                err(new Panic(String(errorValue)) as E)
            })
                .catch((error) => {
                    if (error instanceof Error || error instanceof Panic) {
                        err(error as E)
                    }
                    else {
                        err(new Panic(String(error)) as E)
                    }
                })
        })
    }

    /**
     * Creates a new `Future` from a `Promise<IntoFuture<T, E>>`.
     *
     * @example
     * ```TypeScript
     * const a = Future.parse(Promise.resolve(Result.ok(42)))
     * const b = Future.parse(Promise.resolve(Result.err(new Error("Something went wrong"))))
     * ```
     */
    public static parse<T, E>(promise: Promise<IntoFuture<T, E>>): Future<T, E> {
        return new Future((ok, err) => {
            promise.then((result) => {
                result.futureExecutor(ok, err)
            })
        })
    }

    /**
     * Creates a new `Future` from a `ok` value.
     *
     * @example
     * ```TypeScript
     * const a = Future.ok(42)
     * ```
     */
    public static ok<T, E = Error>(value: T): Future<T, E> {
        return new Future((ok) => {
            ok(value)
        })
    }

    /**
     * Creates a new `Future` from a `err` value.
     *
     * @example
     * ```TypeScript
     * const a = Future.err<number, string>("Something went wrong")
     * ```
     */
    public static err<T, E = Error>(reason: E): Future<T, E> {
        return new Future((_, err) => {
            err(reason)
        })
    }

    /**
     * Joins multiple `Future`s into a single `Future` that resolves to an array of all the values.
     *
     * If any of the `Future`s fail, the returned `Future` will fail with an array of all the errors.
     *
     * @example
     * ```TypeScript
     * const a = Future.ok<number, string>(42)
     * const b = Future.ok<number, string>(1337)
     * const c = Future.err<number, string>("Something went wrong")
     * const d = Future.err<number, string>("Something went wrong again")
     *
     * Future.join([a, b, c, d]) // Future.err(["Something went wrong", "Something went wrong again"])
     * Future.join([a, b]) // Future.ok([42, 1337])
     * ```
     */
    public static join<T, E>(futures: Array<Future<T, E>>) {
        return new Future<Array<T>, Array<E>>((ok, err) => {
            Promise.all(futures).then((results) => {
                const errors = new Array<E>()
                const values = new Array<T>()

                for (const result of results) {
                    if (result.isOk()) {
                        values.push(result.unwrap())
                    }
                    else {
                        errors.push(result.unwrapErr())
                    }
                }

                if (errors.length !== 0) {
                    err(errors)
                }
                else {
                    ok(values)
                }
            })
        })
    }

    /** @internal */
    private static workerPool: Map<string, Worker> = new Map()

    /**
     * Creates a new `Future` from a function that is executed in a Web Worker.
     * The function must be a pure function that does not use any variables from the outer scope.
     *
     * The return value of the function must be serializable (if any).
     *
     * @example
     * ```TypeScript
     * const a = Future.do(() => 42)
     * const b = Future.do(() => { throw new Error("Something went wrong") })
     * const c = Future.do(() => ({ foo: "bar" }))
     *
     * (await a).unwrap() // 42
     * (await b).unwrapErr().message // "Something went wrong"
     * (await c).unwrap() // { foo: "bar" }
     * ```
     */
    // eslint-disable-next-line max-lines-per-function
    public static do<T>(fn: () => T): Future<T, Panic> {
        // eslint-disable-next-line max-lines-per-function
        return new Future((ok, err) => {
            const str = fn.toString()

            const worker = (Future.workerPool.has(str))
                ? Future.workerPool.get(str) as Worker
                : (() => {
                    const objUrl =
                        URL.createObjectURL(
                            new File([
                                new Blob(
                                    [[
                                        `const main = (${fn.toString()});`,
                                        "self.onmessage = (async () => {",
                                        "try {",
                                        "postMessage({isOk: true, value: await main()});",
                                        "} catch (e) {",
                                        "postMessage({isOk: false, value: e});",
                                        "}",
                                        "})",
                                    ].join("")], { type: "text/javascript" }
                                )],
                            `${fn.name}.js`,
                            { type: "text/javascript" }
                            ))
                    // eslint-disable-next-line no-console
                    console.debug(objUrl)
                    const temp = new Worker(objUrl)
                    Future.workerPool.set(str, temp)
                    return temp
                })()

            try {
                worker.onmessage = (event) => {
                    const { isOk, value } = event.data as { isOk: boolean, value: T | Error }
                    if (isOk) {
                        ok(value as T)
                    }
                    else {
                        err(new Panic((value as Error).message))
                    }
                }

                worker.postMessage(null)
            }
            catch (e) {
                if (e instanceof Error) {
                    err(new Panic(e.message))
                }
                else {
                    err(new Panic(JSON.stringify(e)))
                }
            }
        })
    }

    /**
     * Execute another `Future` after `this` one has resolved successfully.
     *
     * This function can be used to chain two `Future`s together and ensure that the final `Future` isn't resolved until both have finished. The function provided is yielded the successful result of `this` `Future` and returns another value which can be converted into a `Future`.
     *
     * Note that because {@link Result} implements the {@link IntoFuture} interface `this` method can also be useful for chaining fallible and serial computations onto the end of one `Future`.
     *
     * If `this` `Future` is dropped, panics, or completes with an error then the provided function `f` is never called.
     *
     * Note that `this` function consumes the receiving `Future` and returns a wrapped version of it.
     *
     * @example
     * ```TypeScript
     * const a = Future.ok(42)
     * const b = a.andThen((value) => Future.ok(value + 1))
     *
     * (await b).unwrap() // 43
     * ```
     */
    public andThen<U>(fn: (value: T) => Future<U, E> | IntoFuture<U, E>): Future<U, E> {
        return new Future((ok, err) => {
            this.then((thisResult) => {
                if (thisResult.isOk()) {
                    const other = fn(thisResult.unwrap())
                    other.futureExecutor(ok, err)
                }
                else {
                    err(thisResult.unwrapErr())
                }
            })
        })
    }

    /**
     * Execute another `Future` if `this` one resolves with an error.
     *
     * Return a `Future` that passes along `this` `Future`'s value if it succeeds, and otherwise passes the error to the function `f` and waits for the `Future` it returns. The function may also simply return a value that can be converted into a `Future`.
     *
     * Note that because {@link Result} implements the {@link IntoFuture} interface `this` method can also be useful for chaining together fallback computations, where when one fails, the next is attempted.
     *
     * If `this` `Future` is dropped, panics, or completes successfully then the provided function f is never called.
     *
     * Note that `this` function consumes the receiving `Future` and returns a wrapped version of it.
     *
     * @example
     * ```TypeScript
     * const a = Future.err("Something went wrong")
     * const b = a.orElse((err) => Future.ok(42))
     *
     * (await b).unwrap() // 42
     * ```
     */
    public orElse<U>(f: (err: E) => Future<U, E> | IntoFuture<U, E>): Future<T | U, E> {
        return new Future((ok, err) => {
            this.then((thisResult) => {
                if (thisResult.isOk()) {
                    ok(thisResult.unwrap())
                }
                else {
                    const other = f(thisResult.unwrapErr())
                    other.futureExecutor(ok, err)
                }
            })
        })
    }

    /**
     * Map `this` `Future`’s result to a different type, returning a new `Future` of the resulting type.
     *
     * This function is similar to the `Optio`::map` where it will change the type of the underlying `Future`. This is useful to chain along a computation once a `Future` has been resolved.
     *
     * The function provided will only be called if `this` `Future` is resolved successfully. If `this` `Future` returns an error, panics, or is dropped, then the function provided will never be invoked.
     *
     * Note that `this` function consumes the receiving `Future` and returns a wrapped version of it.
     *
     * @example
     * ```TypeScript
     * const a = Future.ok(42)
     * const b = a.map((value) => value + 1)
     *
     * (await b).unwrap() // 43
     * ```
     */
    public map<U>(f: (value: T) => U): Future<U, E> {
        return new Future((ok, err) => {
            this.then((thisResult) => {
                if (thisResult.isOk()) {
                    ok(f(thisResult.unwrap()))
                }
                else {
                    err(thisResult.unwrapErr())
                }
            })
        })
    }
}
