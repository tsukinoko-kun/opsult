import { Panic } from "@frank-mayer/panic"
import { Result } from "./Result"

export class Future<T, E> extends Promise<Result<T, E>> {
    constructor(executor: (ok: (value: T) => void, err: (reason: E) => void) => void) {
        super((resolve) => {
            executor(
                (value: T) => resolve(Result.ok(value)),
                (reason: E) => resolve(Result.err(reason))
            )
        })
    }

    public static from<T, E = Error>(promise: Promise<T>): Future<T, E> {
        return new Future((ok, err) => {
            promise.then(ok).catch(err)
        })
    }

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

    public static ok<T, E = Error>(value: T): Future<T, E> {
        return new Future((ok) => {
            ok(value)
        })
    }

    public static err<T, E = Error>(reason: E): Future<T, E> {
        return new Future((_, err) => {
            err(reason)
        })
    }

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
