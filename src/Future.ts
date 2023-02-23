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
}
