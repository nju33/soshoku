import fs from 'fs';
import path from 'path';
import pify from 'pify';
import pPipe from 'p-pipe';
import {rollup} from 'rollup';
import preset from '@nju33/rollup-preset';
import nullpo from 'nullpo';
import {data, construction} from './injector';

const cache = {
  iife: null,
  umd: null,
  es: null
};
const $formats = ['iife', 'umd', 'es'];

const config = {
  plugins: [
    ...preset({
      minify: process.env.NODE_ENV === 'prod'
    })
  ],
  onwarn(warning) {
    if (/es6\.object\.to-string\.js/.test(warning.message)) {
      return;
    }
    console.warn(warning.message);
  }
};

class Script {
  constructor() {
    this.process = pPipe(this.rollup, this.write);
  }

  @data.inject('format', 'moduleName', 'banner')
  @construction.inject('script')
  async rollup({script}, {format, moduleName, banner}) {
    const formats = [format];
    const config$ = {
      ...config,
      entry: script.src
    };
    const bundle = await rollup(config$);

    if (process.env.NODE_ENV === 'prod') {
      const cloned$formats = $formats.slice();
      cloned$formats.splice($formats.indexOf(format), 1);
      Array.prototype.push.apply(formats, cloned$formats);
    }

    const results = formats.reduce(($results, format) => {
      const result = bundle.generate(nullpo({
        format,
        sourceMap: true,
        sourceMapFile: script.dest[format],
        banner: (format === 'iife' ? banner : null),
        moduleName: (() => {
          if (format === 'iife') {
            return moduleName;
          } else if (format === 'umd') {
            return 'default';
          }
          return null;
        })()
      }));

      cache[format] = bundle;
      $results[format] = result;
      return $results;
    }, {});

    return results;
  }

  @construction.inject('script')
  async write({script}, results) {
    Object.keys(results).map(async format => {
      const {code, map} = results[format];
      let output = script.dest[format];
      let basename = path.basename(output);
      if (format === 'iife' && process.env.NODE_ENV === 'prod') {
        const $basename = basename;
        basename = path.basename(output, '.js') + '.min.js';
        output = output.replace($basename, basename);
      }
      const writeFile = pify(fs.writeFile);
      await writeFile(output, code + `\n//# sourceMappingURL=${basename}.map`);
      await writeFile(output + '.map', map.toString());
    });
  }
}

export default new Script();
