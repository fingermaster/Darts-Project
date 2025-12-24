// const boardNums = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const board = {
   0: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 50],
   1: [2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 36, 38, 39, 40, 42, 45, 48, 50, 51, 54, 57, 60]
};

const selector = new Selector();

const randomGenerator = {
   all: () => {
      let rand = randDeck();
      selector.toSector(rand.sector);
      selector.toPosition(rand.multiplier);
   },
   sector: () => {
      selector.toSector(rand20());
   }
}

const timer = new Timer(() => {
   sendShot(0, 1);
}, 10, 100);


const sendShot = async function (sector, x) {
   const currentPlayerKey = Game.next;
   const shooter = currentPlayerKey === 'p1' ? 'playerOne' : 'playerTwo';

   // ВЫЧИСЛЯЕМ НОМЕР БРОСКА САМИ (1, 2 или 3)
   const currentShotN = (shotsByPlayer[shooter].all.length % 3) + 1;

   let shotData = {
      player: Settings[currentPlayerKey],
      sector: sector,
      x: x,
      sx: sector * x,
      game: parseInt(Settings.current),
      date: new Date(),
      shotn: currentShotN // Устанавливаем номер сразу!
   };

   // 1. Сохраняем (нам больше не нужно ловить ответ базы, данные уже у нас)
   await Storage.addShot(shotData);

   // 2. Считаем остаток (на основе текущих очков + новый бросок)
   const remaining = Settings.toFinish - (shotsByPlayer[shooter].score + shotsByPlayer[shooter].session + shotData.sx);

   // 3. Проверка перебора
   if (Settings.overshootSkip && (remaining < 0 || remaining === 1)) {
      console.warn(`[OVERSHOOT] Remaining: ${remaining}. Shot #${shotData.shotn}`);
      // Теперь shotData.shotn ТОЧНО существует (1 или 2)
      await Game.processOvershoot(shotData);
   }

   // 4. Финальный расчет и обновление UI
   calculate(() => {
      selector.toIndex(0);
   });
}



const initGame = async () => {
   Settings.isInitializing = true;
   selector.toIndex(0);

   let game = await Storage.CheckGameID();

   if (game.p1) {
      Settings.first = game.first;
      setGameDataNames(game);
      calculate(() => {});
   } else {
      modal.toggle();
   }
   let names = await Storage.PlayersList();
   UI.setupPlayerForm(Settings.p1, Settings.p2, names);

   Settings.isInitializing = false;
}

const setGameDataNames = (data = {}) => {
   if (data.p1) {
      Settings.p1 = data.p1;
      Settings.p2 = data.p2;
   }
   UI.drawPlayerHeaders(Settings.p1, Settings.p2);
}

const modal = {
   state: false,

   async toggle() {
      this.state = !this.state;

      let data = null;
      if (this.state) {
         data = {
            p1: Settings.p1,
            p2: Settings.p2,
            names: await Storage.PlayersList()
         };
      }

      UI.toggleModal(this.state, data);
   },

   isOnModal(x, y) {
      const rect = UI.getModalBounds();
      return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
   }
};

const Game = {
   get next() {
      Storage.GetNext();
      return Settings.next;
   },
   set next(player) {
      Storage.SetNext(player);
      Game.setActivePlayer(player);
   },
   set first(player) {
      Storage.SetNext(player);
      Storage.SetFirst(player);
      Game.setActivePlayer(player);
   },
   setActivePlayer: (player) => {
      UI.toggleActivePlayer(player);
   },
   cancelLastHit: async () => {
      UI.hideWinScreen();
      await Storage.CancelShot();
      calculate(function () {
         // console.log('we are calculate');
      });
   },
   clearX: function () {
      UI.clearHints();
   },
   new: async function () {
      Game.clearX();
      await Storage.NewGame();
      UI.resetBoard(Settings.toFinish);
      await initGame();
   },
   end: (winner) => {
      Storage.EndGame();
      UI.showWinScreen(winner);
   },
   processOvershoot: async function (lastShot) {
      let n = lastShot.shotn; // Это 1 или 2 (если 3 — цикл не начнется)
      while (n < 3) {
         n++;
         await Storage.addShot({
            player: lastShot.player,
            game: lastShot.game,
            sector: 0,
            x: 1,
            sx: 0,
            date: new Date(),
            shotn: n // Явно проставляем следующий номер
         });
      }
   },
};


const shotsByPlayer = {
   playerOne: {
      all: [],
      score: 0,
      session: 0
   },
   playerTwo: {
      all: [],
      score: 0,
      session: 0
   },
}

const clearData = () => {
   UI.clearGameDisplay();

   shotsByPlayer.playerOne.all = [];
   shotsByPlayer.playerTwo.all = [];
   shotsByPlayer.playerOne.score = 0;
   shotsByPlayer.playerTwo.score = 0;
   shotsByPlayer.playerOne.session = 0;
   shotsByPlayer.playerTwo.session = 0;
}

const calculate = (callback) => {
   clearData();
   let shots = Storage.shots;

   if (shots.length > 0) {
      let playerOneName = Storage.games[Storage.games.length - 1].p1;

      function shotCheck(player, shot) {
         shot.status = true;

         // Упрощаем расчет сессии
         shotsByPlayer[player].session += shot.sx;

         let remaining = Settings.toFinish - shotsByPlayer[player].score - shotsByPlayer[player].session;

         if (remaining === 0) {
            const isItWon = (Settings.x3and25 === 1)
                  ? (shot.x > 1 || shot.sector === 25 || shot.sector === 50)
                  : (shot.x === 2 || shot.sector === 50);

            if (isItWon) {
               shotsByPlayer[player].score += shotsByPlayer[player].session;
               shotsByPlayer[player].session = 0;
               // ВМЕСТО all[1] используем имя напрямую из объекта shot
               Game.end(shot.player);
               shot.status = true;
            } else {
               shotsByPlayer[player].session = 0;
               shot.status = false;
            }
         } else if (remaining < 2) {
            shotsByPlayer[player].session = 0;
            shot.status = false;
         }

         if (shot.shotn === 3) {
            shotsByPlayer[player].score += shotsByPlayer[player].session;
            shotsByPlayer[player].session = 0;
         }

         shotsByPlayer[player].all.push(shot);
         UI.updateTempScore(player, shotsByPlayer[player].session);
      }

      shots.forEach((shotItem, index) => {
         shotItem.shotn = (index + 1) % 3 === 0 ? 3 : (index + 1) % 3;
         let currentPlayer = shotItem.player === playerOneName ? 'playerOne' : 'playerTwo';
         shotCheck(currentPlayer, shotItem);
      });
   }

   whoseTurn();
   getPlayerPoints();
   latestThrows();
   getMainInfo();

   if (callback) callback('done');
}

const whoseTurn = () => {
   const second = Settings.first === 'p1' ? 'p2' : 'p1';

   // Математика: 0-2 — первый игрок, 3-5 — второй
   const currentPlayer = (Storage.shots.length % 6 < 3) ? Settings.first : second;

   // 1. Логическое обновление (база и состояние)
   if (Game.next !== currentPlayer) {
      Game.next = currentPlayer;
   }

   // 2. Визуальное обновление (всегда, для надежности при инициализации)
   UI.toggleActivePlayer(currentPlayer);
}

const getMainInfo = () => {
   const p1 = shotsByPlayer.playerOne;
   const p2 = shotsByPlayer.playerTwo;

   UI.drawMainInfo(
         {
            scoreHtml: `${Settings.toFinish - p1.score - p1.session} <span>${p1.score}</span>`,
            width: `${(p1.score + p1.session) * 100 / Settings.toFinish}%`
         },
         {
            scoreHtml: `${Settings.toFinish - p2.score - p2.session} <span>${p2.score}</span>`,
            width: `${(p2.score + p2.session) * 100 / Settings.toFinish}%`
         }
   );

   showHint({
      playerOne: Settings.toFinish - p1.score - p1.session,
      playerTwo: Settings.toFinish - p2.score - p2.session,
   });
}


const getPlayerPoints = () => {
   getPoints('playerOne');
   getPoints('playerTwo');

   function getPoints(player) {
      UI.drawPlayerPoints(player, shotsByPlayer[player].all);
   }
}

const showHint = (score) => {
   let h1 = '', h2 = '';

   function hintShot(num) {
      const check = (n) => {
         let res = "";
         if (n % 2 === 0 && n / 2 <= 20) res += `${n / 2}X2 `;
         if (n === 50) res += `${n} `;
         if (Settings.x3and25) {
            if (n % 3 === 0) res += `${n / 3}X3 `;
            if (n === 25) res += `${n}`;
         }
         return res;
      };
      if (num === score.playerOne) h1 += check(num);
      if (num === score.playerTwo) h2 += check(num);
   }

   board[Settings.x3and25].find(hintShot);
   UI.drawHint(h1, h2);
}

const latestThrows = () => {
   const shotsMarkup = [];
   for (let i = Storage.shots.length - 1; i >= Storage.shots.length - 6; i--) {
      let val = Storage.shots[i];
      if (val) {
         // Формируем строку, которую UI просто вставит
         shotsMarkup.push(`
            <div class="player">${val.player ?? ''}</div>
            <div class="value">${val.sector}${val.x !== 1 ? 'x' + val.x : ''}</div>
         `);
      }
   }
   UI.drawLatestThrows(shotsMarkup);
}
