import path from 'path';
import browserSync from 'browser-sync';
import pify from 'pify';

class Server {
  constructor() {
    this.bs = browserSync.create();
    this.init = false;
  }

  async run() {
    await pify(this.bs.init({
      ui: false,
      ghostMode: false,
      open: false,
      notify: false,
      server: {
        baseDir: path.resolve(__dirname, '../test/fixtures'),
        routes: {
          '/scripts': path.resolve(__dirname, '../dist')
        }
      },
      port: 3333,
      browser: 'google chrome'
    }));
    this.init = true;
  }

  reload(filePath) {
    if (!this.init) {
      return;
    }
    const ext = path.extname(filePath);
    this.bs.reload(`*.${ext}`);
  }
}

export default new Server();
