const Scripts = [
   ["./js/utils.js"],
   ["./js/db.js"],
   ["./js/storage.js"],
   ["./js/selector.js"],
   ["./js/timer.js"],
   ["./js/game.js"],
];

const ConsoleCSS = `padding: 4px 25px 1px 0; background: rgba(255, 199, 32, .5); color: #222; border-width: 0 2px 3px 0; border-style: groove; border-color: rgba(0,0,0,0.44); border-radius: 0px 50px 0 0;`;
const BadConsoleCSS = `padding: 4px 25px 1px 0; background: rgba(255, 50, 32, .1); color: #F00; border-width: 0 2px 3px 0; border-style: groove; border-color: rgba(0,0,0,0.44); border-radius: 0px 50px 0 0;`;
let init = 1;

/**
 * ToDo: сделать флаг на отключение.
 */
const gameConsole = function (message, error = false) {
   console.info(`%c ${init++}. ${message} `, !error ? ConsoleCSS : BadConsoleCSS);
}

function loadNext() {
   const data = Scripts.shift(); // Берем первый элемент и УДАЛЯЕМ его из массива
   if (!data) return; // Если скриптов больше нет - выходим

   let script = document.createElement('script');
   script.type = 'text/javascript'; // Оставляем так, если пока боишься модулей
   script.src = data[0];

   script.onload = () => {
      // gameConsole(`Загружен: ${data[0]}`);
      if (Scripts.length > 0) {
         loadNext(); // ГРУЗИМ СЛЕДУЮЩИЙ ТОЛЬКО ПОСЛЕ ЗАГРУЗКИ ТЕКУЩЕГО
      } else {
         initGame(); // Все загружены строго по очереди
      }
   }

   document.head.appendChild(script);
}
loadNext();

