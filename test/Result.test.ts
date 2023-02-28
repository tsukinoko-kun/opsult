import { ok, err } from "../Result"
import type { Result } from "../Result"

test("isOk", () => {
    const okRes = ok(1)
    const errRes = err(2)

    expect(okRes.isOk()).toBe(true)
    expect(errRes.isOk()).toBe(false)
})

test("isErr", () => {
    const okRes = ok(1)
    const errRes = err(2)

    expect(okRes.isErr()).toBe(false)
    expect(errRes.isErr()).toBe(true)
})

test("and", () => {
    const a: Result<number, string> = ok(42)
    const b: Result<number, string> = err("Hello World")
    const c: Result<number, string> = ok(13)

    expect(a.and(b)).toBe(b)
    expect(a.and(c)).toBe(c)
    expect(b.and(c)).toBe(b)
})

test("andThen", () => {
    const a: Result<number, string> = ok(42)
    const b: Result<number, string> = err("Hello World")
    const c: Result<number, string> = ok(13)
    const fn = () => c

    expect(a.andThen(fn)).toBe(c)
    expect(b.andThen(fn)).toBe(b)
})

test("or", () => {
    const a: Result<number, string> = ok(42)
    const b: Result<number, string> = err("Hello World")
    const c: Result<number, string> = ok(13)

    expect(a.or(b)).toBe(a)
    expect(b.or(c)).toBe(c)
})

test("orElse", () => {
    const a: Result<number, string> = ok(42)
    const b: Result<number, string> = err("Hello World")
    const c: Result<number, string> = ok(13)
    const fn = () => c

    expect(a.orElse(fn)).toBe(a)
    expect(b.orElse(fn)).toBe(c)
})

test("unwrap", () => {
    const okRes = ok(1)
    const errRes = err(2)

    expect(okRes.unwrap()).toBe(1)
    expect(() => errRes.unwrap()).toThrow()
})

test("unwrapErr", () => {
    const okRes = ok(1)
    const errRes = err(2)

    expect(() => okRes.unwrapErr()).toThrow()
    expect(errRes.unwrapErr()).toBe(2)
})

test("unwrapOr", () => {
    const okRes = ok(1)
    const errRes = err(2)

    expect(okRes.unwrapOr(3)).toBe(1)
    expect(errRes.unwrapOr(3)).toBe(3)
})

test("unwrapOrElse", () => {
    const okRes = ok(1)
    const errRes = err(2)
    const fn = () => 3

    expect(okRes.unwrapOrElse(fn)).toBe(1)
    expect(errRes.unwrapOrElse(fn)).toBe(3)
})

test("map", () => {
    const okRes = ok<number, number>(1)
    const errRes = err<number, number>(2)
    const fn = (x: number) => x + 1

    expect(okRes.map(fn).unwrap()).toBe(2)
    expect(errRes.map(fn).unwrapErr()).toBe(2)
})

test("mapErr", () => {
    const okRes = ok<number, number>(1)
    const errRes = err<number, number>(2)
    const fn = (x: number) => x + 1

    expect(okRes.mapErr(fn).unwrap()).toBe(1)
    expect(errRes.mapErr(fn).unwrapErr()).toBe(3)
})

test("match", () => {
    const okRes = ok(1)
    const errRes = err(2)

    expect(okRes.match(() => 3, () => 4)).toBe(3)
    expect(errRes.match(() => 3, () => 4)).toBe(4)
})
