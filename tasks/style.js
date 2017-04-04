import fs from 'fs';
import pify from 'pify';
import pPipe from 'p-pipe';
import less from '@nju33/less';
import postcss from 'postcss';
import preset from '@nju33/postcss-preset';
import {construction} from './injector';

class Style {
  constructor() {
    this.process = pPipe(this.read, this.less, this.postcss, this.write);
  }

  @construction.inject('style')
  async less({style}, css) {
    let result = null;
    result = await less.render(css, style.src);
    return result.css;
  }

  async postcss(css) {
    let jsonContents = null;
    const result = await postcss([
      ...preset({
        module({json}) {
          jsonContents = JSON.stringify(json);
        }
      })
    ]).process(css);
    return {css: result.css, json: jsonContents};
  }

  @construction.inject('style')
  async read({style}) {
    const contents = await pify(fs.readFile)(style.src, 'utf-8');
    return contents;
  }

  @construction.inject('style')
  async write({style}, {css, json}) {
    const writeFile = pify(fs.writeFile);
    await Promise.all([
      writeFile(style.dest.css, css),
      writeFile(style.dest.json, json)
    ]);
  }
}

export default new Style();
