module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true,
    },
    globals: {
        globalThis: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "unused-imports"],
    extends: [
        "@frank-mayer/eslint-config",
    ]
}
