let player, players, Game;

// const boardNums = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const board = {
   0: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 50],
   1: [2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 36, 38, 39, 40, 42, 45, 48, 50, 51, 54, 57, 60]
};

players = [];

const selector = new Selector();

const randomGenerator = {
   all: () => {
      let rand = randDeck();
      selector.toSector(rand.sector);
      selector.toPosition(rand.multipler);
   },
   sector: () => {
      selector.toSector(rand20());
   }
}

const timer = new Timer(() => {
   sendShot(0, 1);
}, 10, 100);


const sendShot = async function (sector, x) {
   console.warn(Game.next);
   let shotData = {
      player: Settings[Game.next],
      sector: sector,
      x: x,
      sx: sector * x,
   };
   shotData.game = parseInt(Settings.current);
   shotData.date = new Date();
   await Storage.addShot(shotData);
   let shooter = Game.next === 'p1' ? 'playerOne' : 'playerTwo';
   if (Settings.overshootSkip && shotsByPlayer[shooter].score + shotsByPlayer[shooter].session + shotData.sx > Settings.toFinish - 2) {
      goZero();

      function goZero() {
         if (shotData.shotn < 3) {
            shotData.date++;
            shotData.shotn++;
            shotData.sector = 0;
            shotData.x = 1;
            shotData.sx = 0;
            Storage.addShot(shotData);
            goZero();
         }
      }
   }
   calculate(function () {
      // console.log(`looks like calculated`);
   });

   selector.toIndex(0);
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

function setGameDataNames(data = {}) {
   if (data.p1) {
      Settings.p1 = data.p1;
      Settings.p2 = data.p2;
   }
   UI.drawPlayerHeaders(Settings.p1, Settings.p2);
}

const modal = {
   // el: document.querySelector('.modal'), // Если это константа, лучше оставить в UI или кэшировать
   state: false,

   show() {
      UI.setupPlayerForm(Settings.p1, Settings.p2, []);
      document.querySelector('.modal').classList.add('show');
      this.state = true;
   },

   hide() {
      document.querySelector('.modal').classList.remove('show');
      this.state = false;
   },

   toggle() {
      this.state ? this.hide() : this.show();
   },

   isOnModal(x, y) {
      const rect = document.querySelector('.modal').getBoundingClientRect();
      return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
   }
};

Game = {
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

function clearData() {
   UI.clearGameDisplay();

   shotsByPlayer.playerOne.all = [];
   shotsByPlayer.playerTwo.all = [];
   shotsByPlayer.playerOne.score = 0;
   shotsByPlayer.playerTwo.score = 0;
   shotsByPlayer.playerOne.session = 0;
   shotsByPlayer.playerTwo.session = 0;
}

function calculate(callback) {
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

function whoseTurn(){
   let second = 'p2'
   if (Settings.first === 'p2') second = 'p1'

   let diffMod = Storage.shots.length % 6;
   switch (true) {
      case diffMod < 3:
         if (Game.next !== Settings.first) {
            Game.next = Settings.first;
         }
         Game.setActivePlayer(Settings.first);
         break;
      case diffMod >= 3:
         if (Game.next !== second) {
            Game.next = second;
         }
         Game.setActivePlayer(second);
         break;
   }
}

function getMainInfo() {
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


function getPlayerPoints() {
   getPoints('playerOne');
   getPoints('playerTwo');

   function getPoints(player) {
      UI.drawPlayerPoints(player, shotsByPlayer[player].all);
   }
}

function showHint(score) {
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

function latestThrows() {
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
