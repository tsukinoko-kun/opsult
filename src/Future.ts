import { Panic } from "@frank-mayer/panic"
import { Result } from "./Result"

/**
 * `Future<T, E>` is the type used for asynchronous operations.
 *
 * Other than a {@link Promise}, a `Future` has **fixed types for the value and the error**.
 */
export class Future<T, E> extends Promise<Result<T, E>> {
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
        })
    }

    /**
     * Creates a new `Future` from a `Promise<Result<T, E>>`.
     *
     * @example
     * ```TypeScript
     * const a = Future.parse(Promise.resolve(Result.ok(42)))
     * const b = Future.parse(Promise.resolve(Result.err(new Error("Something went wrong"))))
     * ```
     */
    public static parse<T, E>(promise: Promise<Result<T, E>>): Future<T, E> {
        return new Future((ok, err) => {
            promise.then((result) => {
                if (result.isOk()) {
                    ok(result.unwrap())
                }
                else {
                    err(result.unwrapErr())
                }
            })
        })
    }

    /**
     * Creates a new `Future` from a `Promise<Result<T, E>>` from a `ok` value.
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
     * Creates a new `Future` from a `Promise<Result<T, E>>` from a `err` value.
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
}
