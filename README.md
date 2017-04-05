# Soshoku

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Request re-execution during processing Even when you come back and forth, you only re-execute once.

## Install or Download

```sh
yarn add soshoku
npm i -S soshoku
```

Or access to [releases page](https://github.com/nju33/soshoku/releases).
Then, download the latest version.

## Usage

```js
import soshoku from 'soshoku';
const soshoku = require('soshoku');
```

or

```html
<script src="/path/tp/soshoku.js"></script>
```

### API

#### `constructor(func)`

- `func`: `Promise`

Register function.

#### `exec()`

Execute function.

### Example

```js
import Soshoku from 'soshoku';

const doSomethingAsync = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('called!');
      resolve();
    }, 5000)
  });
}

new soshoku = new Soshoku(doSomethingAsync);

soshoku.exec();
setTimeout(soshoku.exec, 1000);
setTimeout(soshoku.exec, 2000);

// The result comes out as 'called!' After 5s.
// And after 5s we also get 'called!'.
// But after 5s there is nothing.
```

## LICENSE

The MIT License (MIT)

Copyright (c) 2017 nju33 <nju33.ki@gmail.com>
