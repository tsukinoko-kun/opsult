<h1 style="display: flex; flex-direction: column; flex-wrap: nowrap; align-content: center; align-items: center; justify-content: center; gap: 1rem;">
    <img style="height:1.5em; width: 1.5em; transform:translateY(0.25em)" src="https://raw.githubusercontent.com/Frank-Mayer/opsult/main/public/icon.svg" />
    <span>opsult</span>
</h1>

<div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-content: center; align-items: center;     justify-content: center; gap: 0.5rem;">
    <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/Types-included-blue?logo=typescript&amp;style=plastic" alt="Types included"></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-teal.svg?logo=law&amp;style=plastic" alt="License: MIT"></a>
    <a href="https://github.com/Frank-Mayer/opsult/actions/workflows/test.yml"><img src="https://github.com/Frank-Mayer/opsult/actions/workflows/test.yml/badge.svg" alt="Test"></a>
    <a href="https://github.com/Frank-Mayer/opsult/actions/workflows/lint.yml"><img src="https://github.com/Frank-Mayer/opsult/actions/workflows/lint.yml/badge.svg" alt="Lint"></a>
</div>

## Basic overfiew

A implementation of Option, Result and Future types in TypeScript. If you know Rust, you will feel right at home.

### Option

```TypeScript
import { Option } from '@frank-mayer/opsult/Option';

const a: Option<number> = some(1);
const b: Option<number> = none();
const c: Option<number> = some(2);

a.andThen((x: number) => c.map((y: number) => x + y)); // some(3)
b.andThen((x: number) => c.map((y: number) => x + y)); // none()
```

### Result

```TypeScript
import { Result } from '@frank-mayer/opsult/Result';

const a: Result<number, string> = ok(1);
const b: Result<number, string> = err('error');
const c: Result<number, string> = ok(2);

a.andThen((x: number) => c.map((y: number) => x + y)); // ok(3)
b.andThen((x: number) => c.map((y: number) => x + y)); // err('error')
```

### Future

```TypeScript
import { Future } from '@frank-mayer/opsult/Future';

const fut: Future<number, string> = new Future<number, string>((ok, err) => {
    setTimeout(() => err("timeout"), 1000);

    complexAsyncOperation((x: number) => {
        ok(x);
    });
})

const res: Result<number, string> = await fut;

res.match({
    ok: (x: number) => console.log(x),
    err: (e: string) => console.error(e)
});
```

[Read the docs to learn on how to use it.](https://Frank-Mayer.github.io/opsult)

## Installation

```bash
npm i @frank-mayer/opsult
```
