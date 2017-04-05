import test from 'ava';
import sinon from 'sinon';
import Soshoku from '../..';

test('test', t => {
  const clock = sinon.useFakeTimers();
  const cb = sinon.spy();
  let soshoku = null;
  let count = 1;

  const fn = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        cb();
        resolve();
      }, 5000);

      t.true(soshoku.__processing);
      t.false(soshoku.__pending);

      if (count === 2) {
        clock.tick(5000);
        t.true(cb.calledTwice);
        t.false(soshoku.__processing);
        count++;
        soshoku.exec();
        t.true(soshoku.__processing);
        t.false(soshoku.__pending);
      } else if (count === 3) {
        clock.tick(5000);
        t.true(cb.calledThrice);
        t.false(soshoku.__processing);
      }
    });
  };

  soshoku = new Soshoku(fn);

  soshoku.exec();
  setTimeout(() => {
    soshoku.exec();
  }, 1000);
  setTimeout(() => {
    soshoku.exec();
  }, 2000);

  clock.tick(1);
  t.true(cb.notCalled);
  clock.tick(5000);
  t.true(cb.calledOnce);
  count++;
});
