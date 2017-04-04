(() => {
  function doSomething() {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('😇');
        resolve();
      }, 5000)
    });
  }

  const soshoku = new Soshoku(doSomething);
  let count = 0;
  const id = setInterval(() => {
    count++;
    if (count >= 4) {
      clearInterval(id);
      console.log('done');
    }

    console.log(count);
    soshoku.exec();
  }, 1000);
})();
