/**
 * ToDo: внести функцию из /myJsLib.js в проект. У нас же Vanilla JS
 */
const Scripts = [
   ["./myJsLib.js"],
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

function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max) + 1;
   return Math.floor(Math.random() * (max - min)) + min;
}

function rand20() {
   return getRandomInt(1, 20);
}

function rand3() {
   return getRandomInt(2, 3);
}

function randDeck() {
   const res = {sector: 20, multipler: 1};
   if (getRandomInt(1, 60) > 50) {
      if (getRandomInt(1, 15) < 10) {
         res.multipler = 3;
      } else {
         res.multipler = 4;
      }
   } else if (getRandomInt(1, 40) > 22) {
      res.multipler = rand3();
      res.sector = rand20();
   } else {
      res.sector = rand20();
   }
   return res;
}

const isEven = function (someNumber) {
   return (someNumber % 2 === 0);
};
