let player, players, Game;

let checkValue = function (value) {
   return value === -1 ? 0 : value;
}

const Settings = {
   isInitializing: false,
   data: {
      toFinish: 501,
      x3and25: 1,
      overshootSkip: 0,
      p1: 'Player One',
      p2: 'Player Two',
      current: 1,
      first: 'p1',
      next: 'p1',
   },

   load(dbData) {
      // 1. Обновляем данные в объекте напрямую, минуя сеттеры
      Object.assign(this.data, {
         toFinish: dbData.toFinish ?? 501,
         x3and25: dbData.x3and25 ?? 1,
         overshootSkip: dbData.overshootSkip ?? 0,
         p1: dbData.p1 ?? 'Player One',
         p2: dbData.p2 ?? 'Player Two',
         current: dbData.id ?? 1,
         first: dbData.first ?? 'p1',
         next: dbData.next ?? 'p1'
      });

      // 2. Обновляем интерфейс, так как автоматика сеттеров была пропущена
      UI.renderInfoBar(this.data);
      UI.updateSettingsView('toFinish', this.data.toFinish);
      UI.updateSettingsView('x3and25', this.data.x3and25);
      UI.updateSettingsView('overshootSkip', this.data.overshootSkip);

      console.log("Settings loaded from DB successfully");
   },

   set(key, value) {
      if (this.data[key] === value) return;

      this.data[key] = value;

      if (['toFinish', 'x3and25', 'overshootSkip'].includes(key)) {
         UI.updateSettingsView(key, value);
      }

      UI.renderInfoBar(this.data);
      //Если идёт инициализация, то в базу не записываем.
      if(!this.isInitializing) {
         Storage.SetSettings();
      }
   },

   get toFinish() { return this.data.toFinish; },
   set toFinish(v) { this.set('toFinish', v); },
   get x3and25() { return this.data.x3and25; },
   set x3and25(v) { this.set('x3and25', v); },
   get overshootSkip() { return this.data.overshootSkip; },
   set overshootSkip(v) { this.set('overshootSkip', v); },
   get p1() { return this.data.p1; },
   set p1(v) { this.set('p1', v); },
   get p2() { return this.data.p2; },
   set p2(v) { this.set('p2', v); },
   get current() { return this.data.current; },
   set current(v) { this.set('current', v); },
   get first() { return this.data.first; },
   set first(v) { this.set('first', v); },
   get next() { return this.data.next; },
   set next(v) { this.set('next', v); },
};

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
   Settings.isInitializing = true; //Ставим флаг инициализации
   selector.toIndex(0);

   let game = await Storage.CheckGameID();

   if (game.p1) {
      Settings.first = game.first;
      setGameDataNames(game);
      calculate(function () {
      });
   } else {
      modal.toggle();
   }

   View('playersSelect').innerHTML = '';
   View('p1input').value = Settings.p1;
   View('p2input').value = Settings.p2;

   let names = await Storage.PlayersList();
   View('playersSelect').innerHTML = '';
   names.forEach(function (el) {
      View('playersSelect').innerHTML += `<option value='${el.name}' class="selectplayer" data-player-name="${el.name}">${el.name}</option>\n`;
   });
   Settings.isInitializing = false; //Снимаем флаг инициализации
}

function setGameDataNames(data = {}) {
   if (data.p1) {
      Settings.p1 = data.p1;
      Settings.p2 = data.p2;
   }
   View('p1').innerHTML = Settings.p1;
   View('p2').innerHTML = Settings.p2;
}

const modal = {
   el: document.querySelector('.modal'),
   state: false,

   show() {
      View('p1input').value = Settings.p1;
      View('p2input').value = Settings.p2;
      this.el.classList.add('show');
      this.state = true;
   },

   hide() {
      this.el.classList.remove('show');
      this.state = false;
   },

   toggle() {
      this.state ? this.hide() : this.show();
   },

   isOnModal(x, y) {
      const rect = this.el.getBoundingClientRect();
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
      if (player === 'p1') {
         View('p1').classList.add('active');
         View('p2').classList.remove('active');
      } else {
         View('p2').classList.add('active');
         View('p1').classList.remove('active');
      }
   },
   cancelLastHit: async () => {
      View('fireworks').style.display = 'none';
      await Storage.CancelShot();
         calculate(function () {
            // console.log('we are calculate');
         });
   },
   clearX: function () {
      View('p1sX').innerHTML = View('p2sX').innerHTML = '';
   },
   new: async function () {
      Game.clearX();
      await Storage.NewGame();
      View('p1shots').innerHTML = View('p2shots').innerHTML = '';
      View('p1score').innerHTML = Settings.toFinish;
      View('p2score').innerHTML = Settings.toFinish;
      View('fireworks').style.display = 'none';
      await initGame();
   },
   end: (winner) => {
      Storage.EndGame();
      View('fireworks').style.display = 'flex';
      View('winnerName').innerHTML = `${winner} WON!`;
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
   View('p1shots').innerHTML = View('p2shots').innerHTML = View('p1score').innerHTML = View('p2score').innerHTML = '';
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
      let playerOne = Storage.games[Storage.games.length - 1].p1;

      function shotCheck(player, shot) {
         shot.status = true;
         switch (shot.shotn) {
            case 1: {
               shotsByPlayer[player].session = shot.sx;
               break;
            }
            case 2: {
               shotsByPlayer[player].session = shotsByPlayer[player].session + shot.sx;
               break;
            }
            case 3: {
               shotsByPlayer[player].session = shotsByPlayer[player].session + shot.sx;
               break;
            }
         }
         if (Settings.toFinish - shotsByPlayer[player].score - shotsByPlayer[player].session === 0) {
            function isItWon(shot) {
               if (Settings.x3and25 === 1) {
                  return shot.x > 1 || shot.sector === 25 || shot.sector === 50;
               } else {
                  return shot.x === 2 || shot.sector === 50;
               }
            }

            if (isItWon(shot)) {
               shotsByPlayer[player].score = shotsByPlayer[player].score + shotsByPlayer[player].session;
               shotsByPlayer[player].session = 0;
               console.log(shotsByPlayer[player].all[1]['player']);
               Game.end(shotsByPlayer[player].all[1]['player']);
               shot.status = true;
            } else {
               shotsByPlayer[player].session = 0;
               shot.status = false;
            }
         } else if (Settings.toFinish - shotsByPlayer[player].score - shotsByPlayer[player].session < 2) {
            shotsByPlayer[player].session = 0;
            shot.status = false;
         }
         if (shot.shotn === 3) {
            shotsByPlayer[player].score = shotsByPlayer[player].score + shotsByPlayer[player].session;
            shotsByPlayer[player].session = 0;
         }
         shotsByPlayer[player].all.push(shot);
         View(player === 'playerOne' ? 'p1temp' : 'p2temp').innerHTML = shotsByPlayer[player].session !== 0 ? shotsByPlayer[player].session : '';
      }

      shots.forEach((shotItem, index) => {
         shotItem.shotn = (index + 1) % 3 === 0 ? 3 : (index + 1) % 3;
         let currentPlayer = shotItem.player === playerOne ? 'playerOne' : 'playerTwo';
         shotCheck(currentPlayer, shotItem);
      });
      // console.log(shotsByPlayer);
   }


   whoseTurn();
   getPlayerPoints();
   getPlayerPoints('playerTwo');
   latestThrows();
   getMainInfo();

   callback('done');
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
