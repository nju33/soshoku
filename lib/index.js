export default class Soshoku {
  constructor(func) {
    this.func = func;

    this.__pending = false;
    this.__processing = false;
  }

  async exec() {
    if (this.__processing) {
      this.__pending = true;
      return;
    }

    this.__processing = true;
    await this.func();
    this.__processing = false;

    if (this.__pending) {
      this.__pending = false;
      await this.exec();
    }
  }
}
