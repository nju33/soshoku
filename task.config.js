import fs from 'fs';
import pify from 'pify';
import Case from 'case';
import ora from 'ora';
import aru from 'aru';
import meow from 'meow';
import chokidar from 'chokidar';
import debounce from 'lodash/debounce';
import PrettyError from 'pretty-error';
import beeper from 'beeper';
import pkg from './package';
import {data, construction} from './tasks/injector';
import server from './tasks/server';
import style from './tasks/style';
import script from './tasks/script';

const pe = new PrettyError();
const cli = meow(`
  Usage
    $ yarn build
`, {
  alias: {
    b: 'beep',
    f: 'format',
    w: 'watch'
  }
});

data.set({
  name: pkg.name,
  moduleName: Case.pascal(pkg.name),
  banner: `
/*!
 * Copyright 2017, nju33
 * Released under the MIT License
 * https://github.com/nju33/${pkg.name}
 */
`.trim(),
  format: cli.flags.format || 'iife'
});

construction.set({
  style: {
    watch: `${__dirname}/src/styles/**/*.less`,
    src: `${__dirname}/src/styles/style.less`,
    dest: {
      css: `${__dirname}/lib/styles/style.css`,
      json: `${__dirname}/lib/styles/style.json`
    }
  },
  script: {
    watch: `${__dirname}/lib/**/*.+(js|html)`,
    src: `${__dirname}/lib/index.js`,
    dest: {
      iife: `${__dirname}/dist/${pkg.name}.js`,
      umd: `${__dirname}/dist/${pkg.name}.umd.js`,
      es: `${__dirname}/dist/${pkg.name}.es.js`
    }
  }
});

(async () => {
  const access = pify(fs.access);
  await aru('style', access(construction.get('style').src));
  await aru('script', access(construction.get('script').src));

  switch (cli.input[0]) {
    default:
    case 'dev': {
      chokidar.watch([
        construction.get('style').watch,
        construction.get('script').watch,
        `${__dirname}/+(example|test/fixtures)/**/*`
      ]).on('all', debounce(async (ev, filePath) => {
        build(cli.input[0], ev).then(() => {
          server.reload(filePath);
        });
      }, 50));
      await server.run();
      break;
    }
    case 'build':
    case 'prod': {
      build(cli.input[0]);
      break;
    }
  }
})();

async function build(task, ev = null) {
  const spinner = startOra();
  try {
    await aru.right('style', style.process);
    await aru.right('script', script.process);
    spinner.succeed(`[${task}${ev ? ':' + ev : ''}] Process succeed`);
  } catch (err) {
    spinner.fail(`[${task}${ev ? ':' + ev : ''}] Process fail`);
    console.log(pe.render(err));
    if (cli.flags.beep) {
      beeper(2);
    }
  }
}

function startOra() {
  return ora({
    color: 'yellow',
    text: 'Processing...'
  }).start();
}
