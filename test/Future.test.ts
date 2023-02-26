import { Panic } from "@frank-mayer/panic"
import { Future } from "../Future"
import { err, ok } from "../Result"

test("constructor", async () => {
    expect(new Future(((ok) => ok(1))))
        .resolves
        .toBeInstanceOf(Future)
})

test("from resolve", async () => {
    const f = Future.from(Promise.resolve(1))
    expect(f).toBeInstanceOf(Future)

    const fValue = await f
    expect(fValue).toEqual(ok(1))
})

test("from reject", async () => {
    const f = Future.from(Promise.reject("error"))
    expect(f).toBeInstanceOf(Future)

    const fValue = await f
    expect(fValue.isErr()).toBeTruthy()
    expect(fValue).toEqual(err(new Panic("error")))
})

test("parse ok", async () => {
    const prop = Promise.resolve(ok("ok"))
    const f = Future.parse(prop)
    expect(f).toBeInstanceOf(Future)

    const fValue = await f
    expect(fValue).toEqual(ok("ok"))
    expect(fValue).not.toEqual(ok(1))
})

test("parse err", async () => {
    const f = Future.parse(Promise.resolve(err<number, string>("error")))
    expect(f).toBeInstanceOf(Future)

    const fValue = await f
    expect(fValue).toEqual(err<number, string>("error"))
    expect(fValue).not.toEqual(ok<string, string>("error"))
})

test("ok", async () => {
    const f = Future.ok(42)
    expect(f).toBeInstanceOf(Future)

    const fValue = await f
    expect(fValue).toEqual(ok(42))
    expect(fValue).not.toEqual(ok(13))
    expect(fValue).not.toEqual(err(42))
})

test("err", async () => {
    const f = Future.err("error")
    expect(f).toBeInstanceOf(Future)

    const fValue = await f
    expect(fValue).toEqual(err("error"))
    expect(fValue).not.toEqual(err("other error"))
    expect(fValue).not.toEqual(ok("error"))
})

test("join ok", async () => {
    const f = Future.join<number, Error>([
        Future.ok(1),
        Future.ok(2)
    ])
    expect(f).toBeInstanceOf(Future)

    const fValue = await f
    expect(fValue).toEqual(ok([1, 2]))
    expect(fValue).not.toEqual(ok([1, 3]))
    expect(fValue).not.toEqual(err([1, 2]))
})

test("join err", async () => {
    const f = Future.join<number, number>([
        Future.ok(0),
        Future.err(1),
        Future.err(2)
    ])
    expect(f).toBeInstanceOf(Future)

    const fValue = await f
    expect(fValue).toEqual(err([1, 2]))
    expect(fValue).not.toEqual(err([1, 3]))
    expect(fValue).not.toEqual(ok([1, 2]))
})

test("join reject", async () => {
    const f = Future.join<number, Panic>([
        Future.ok(0),
        Future.from(
            new Promise((_, reject) => {
                reject()
            })
        )
    ])
    expect(f).toBeInstanceOf(Future)

    expect(f).resolves.toThrow()
})
