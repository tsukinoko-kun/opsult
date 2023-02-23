const { Ok, Err, Result } = require("../")

test("isOk", () => {
    const okRes = Ok(1)
    const errRes = Err(2)

    expect(okRes.isOk()).toBe(true)
    expect(errRes.isOk()).toBe(false)
})

test("isErr", () => {
    const okRes = Ok(1)
    const errRes = Err(2)

    expect(okRes.isErr()).toBe(false)
    expect(errRes.isErr()).toBe(true)
})

test("WrapPromise", async () => {
    const okRes = (await Result.WrapPromise(Promise.resolve(1)))
    expect(okRes.unwrap()).toBe(1)

    const errRes = (await Result.WrapPromise(Promise.reject(2)))
    expect(errRes.unwrapErr()).toBe(2)
})

test("unwrap", () => {
    const okRes = Ok(1)
    const errRes = Err(2)

    expect(okRes.unwrap()).toBe(1)
    expect(() => errRes.unwrap()).toThrow()
})

test("unwrapErr", () => {
    const okRes = Ok(1)
    const errRes = Err(2)

    expect(() => okRes.unwrapErr()).toThrow()
    expect(errRes.unwrapErr()).toBe(2)
})

test("unwrapOr", () => {
    const okRes = Ok(1)
    const errRes = Err(2)

    expect(okRes.unwrapOr(3)).toBe(1)
    expect(errRes.unwrapOr(3)).toBe(3)
})

test("unwrapOrElse", () => {
    const okRes = Ok(1)
    const errRes = Err(2)
    const fn = () => 3

    expect(okRes.unwrapOrElse(fn)).toBe(1)
    expect(errRes.unwrapOrElse(fn)).toBe(3)
})

test("map", () => {
    const okRes = Ok(1)
    const errRes = Err(2)
    const fn = (x) => x + 1

    expect(okRes.map(fn).unwrap()).toBe(2)
    expect(errRes.map(fn).unwrapErr()).toBe(2)
})

test("mapErr", () => {
    const okRes = Ok(1)
    const errRes = Err(2)
    const fn = (x) => x + 1

    expect(okRes.mapErr(fn).unwrap()).toBe(1)
    expect(errRes.mapErr(fn).unwrapErr()).toBe(3)
})

test("match", () => {
    const okRes = Ok(1)
    const errRes = Err(2)

    expect(okRes.match(() => 3, () => 4)).toBe(3)
    expect(errRes.match(() => 3, () => 4)).toBe(4)
})
