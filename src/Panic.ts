export class Panic implements Error {
    protected _stack: string|undefined = undefined
    public readonly name: string
    public readonly message: string

    public constructor(message: string) {
        this.name = "Panic"
        this.message = message
    }

    public get stack(): string {
        if (this._stack) {
            return this._stack
        }

        const fullStack = new Error().stack

        if (!fullStack) {
            return this.name
        }

        const i1 = fullStack.indexOf("\n", 4)
        const i2 = fullStack.indexOf("\n", i1 + 2)
        return this._stack = fullStack.substring(0, i1) + fullStack.substring(i2)
    }

    public toString(): string {
        return `Panic: ${this.message}`
    }
}
