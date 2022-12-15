const { Option } = require("../")

test("isSome", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()

    expect(someOption.isSome).toBe(true)
    expect(noneOption.isSome).toBe(false)
})

test("isNone", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()

    expect(someOption.isNone).toBe(false)
    expect(noneOption.isNone).toBe(true)
})

test("unwrap", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()

    expect(someOption.unwrap()).toBe(1)
    expect(() => noneOption.unwrap()).toThrow()
})

test("unwrapOr", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()

    expect(someOption.unwrapOr(2)).toBe(1)
    expect(noneOption.unwrapOr(2)).toBe(2)
})

test("unwrapOrElse", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()
    const def = () => 2

    expect(someOption.unwrapOrElse(def)).toBe(1)
    expect(noneOption.unwrapOrElse(def)).toBe(2)
})

test("map", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()
    const f = (x) => x + 1

    expect(someOption.map(f).unwrap()).toBe(2)
    expect(noneOption.map(f).isNone).toBe(true)
})

test("or", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()
    const otherOption = Option.Some(2)

    expect(someOption.or(otherOption).unwrap()).toBe(1)
    expect(noneOption.or(otherOption).unwrap()).toBe(2)
})

test("orElse", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()
    const otherOption = Option.Some(2)
    const f = () => otherOption

    expect(someOption.orElse(f).unwrap()).toBe(1)
    expect(noneOption.orElse(f).unwrap()).toBe(2)
})

test("and", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()
    const otherOption = Option.Some(2)

    expect(someOption.and(otherOption).unwrap()).toBe(2)
    expect(noneOption.and(otherOption).isNone).toBe(true)
})

test("andThen", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()
    const otherOption = Option.Some(2)
    const f = () => otherOption

    expect(someOption.andThen(f).unwrap()).toBe(2)
    expect(noneOption.andThen(f).isNone).toBe(true)
})

test("match", () => {
    const someOption = Option.Some(1)
    const noneOption = Option.None()

    expect(someOption.match(() => 2, () => 3)).toBe(2)
    expect(noneOption.match(() => 2, () => 3)).toBe(3)
})
