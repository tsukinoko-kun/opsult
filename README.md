# opsult

A simple implementation of Option and Result types in TypeScript

[![Types included](https://img.shields.io/badge/Types-included-blue?logo=typescript&style=plastic)](https://www.typescriptlang.org)

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg?logo=law&style=plastic)](https://opensource.org/licenses/MIT)

[![Test](https://github.com/Frank-Mayer/opsult/actions/workflows/test.yml/badge.svg)](https://github.com/Frank-Mayer/opsult/actions/workflows/test.yml)

[![Lint](https://github.com/Frank-Mayer/opsult/actions/workflows/lint.yml/badge.svg)](https://github.com/Frank-Mayer/opsult/actions/workflows/lint.yml)

```TypeScript
import { some } from '@frank-mayer/opsult/Option';

let x: Option<number> = some(2);
x.isSome(); // true
```
