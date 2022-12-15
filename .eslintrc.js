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
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        "@typescript-eslint/no-var-requires": "off",
        "array-callback-return": ["error", { allowImplicit: true }],
        "constructor-super": "error",
        "no-undef": "error",
        curly: ["error", "multi-line"],
        "brace-style": ["error", "stroustrup"],
        "keyword-spacing": ["error", { before: true, after: true }],
        "arrow-spacing": ["error", { before: true, after: true }],
        "space-before-function-paren": ["error", {
            anonymous: "never",
            named: "never",
            asyncArrow: "always"
        }],
        "space-before-blocks": ["error", "always"],
        "space-in-parens": ["error", "never"],
        "comma-spacing": ["error", { before: false, after: true }],
        indent: ["error", 4],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "for-direction": "error",
        "guard-for-in": "off",
        "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
        "no-alert": "error",
        "no-caller": "error",
        "no-constant-binary-expression": "error",
        "no-constructor-return": "error",
        "no-debugger": "error",
        "no-self-assign": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-unreachable": "error",
        "no-unsafe-finally": "error",
        "no-throw-literal": "error",
        "no-unused-expressions": "error",
        "no-async-promise-executor": "error",
        "getter-return": "error",
        semi: ["error", "never"],
        quotes: ["error", "double"],
        "max-depth": ["error", 3],
        "max-nested-callbacks": ["error", 3],
        "max-len": [
            "error",
            {
                code: 80,
                tabWidth: 4,
                ignoreComments: true,
                ignoreStrings: true,
            },
        ],
        "prefer-const": "error",
        "no-console": "error",
        "unused-imports/no-unused-imports": "error",
        "@typescript-eslint/no-unused-vars": "error",
        "no-else-return": ["error", { allowElseIf: false }],
        "unused-imports/no-unused-vars": [
            "warn",
            {
                vars: "all",
                varsIgnorePattern: "^_",
                args: "after-used",
                argsIgnorePattern: "^_",
            },
        ],
        "max-lines-per-function": [
            "error",
            { max: 30, skipBlankLines: true, skipComments: true },
        ],
        "no-restricted-syntax": [
            "error",
            {
                selector: "FunctionDeclaration[async=false][id.name=/Async$/]",
                message: "Function ending in 'Async' must be declared async",
            },
            {
                selector: "FunctionDeclaration[async=true][id.name!=/Async$/]",
                message: "Async function name must end in 'Async'",
            },
            {
                selector:
                    "MethodDefinition[value.async=false][key.name=/Async$/]",
                message: "Method ending in 'Async' must be declared async",
            },
            {
                selector:
                    "MethodDefinition[value.async=true][key.name!=/Async$/]",
                message: "Async method name must end in 'Async'",
            },
            {
                selector:
                    "Property[value.type=/FunctionExpression$/][value.async=false][key.name=/Async$/]",
                message: "Function ending in 'Async' must be declared async",
            },
            {
                selector:
                    "Property[value.type=/FunctionExpression$/][value.async=true][key.name!=/Async$/]",
                message: "Async function name must end in 'Async'",
            },
            {
                selector:
                    "VariableDeclarator[init.type=/FunctionExpression$/][init.async=false][id.name=/Async$/]",
                message: "Function ending in 'Async' must be declared async",
            },
            {
                selector:
                    "VariableDeclarator[init.type=/FunctionExpression$/][init.async=true][id.name!=/Async$/]",
                message: "Async function name must end in 'Async'",
            },
        ],
    },
}
