let player, players, Game;

// dom.js
(function() {
   const ElementID = [
      'gameInfo', 'toFinish', 'x3and25', 'overshootSkip', 'randInput',
      'randInput20', 'p1', 'p1progress', 'p1shots', 'p1score',
      'p1temp', 'p1sX', 'p2', 'p2progress', 'p2shots', 'p2score',
      'p2temp', 'p2sX', 'p1input', 'p2input', 'playersSelect',
      'fireworks', 'winnerName', 'latestThrows'
   ];

   const View = (id) => {
      if (ElementID.includes(id)) {
         return document.getElementById(id);
      } else {
         console.warn(`Attempted to access unknown element ID: ${id}`);
         return null;
      }
   };

   // !!! ТОТ САМЫЙ ПРОБРОС:
   window.View = View;

   // TODO: Когда весь проект станет модульным:
   // 1. Убрать обертку (function() { ... })();
   // 2. Удалить строку window.View = View;
   // 3. Добавить в начале: export { View };
})();

let checkValue = function (value) {
   return value === -1 ? 0 : value;
}

const Settings = {
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

   set(key, value) {
      if (this.data[key] === value) return;

      this.data[key] = value;

      if (['toFinish', 'x3and25', 'overshootSkip'].includes(key)) {
         UI.updateSettingsView(key, value);
      }

      UI.renderInfoBar(this.data);
      Storage.SetSettings(); // Сохраняем
   },

   get toFinish() { return this.data.toFinish; },
   set toFinish(v) { this.set('toFinish', v); },
   get x3and25() { return this.data.x3and25; },
   set x3and25(v) { this.set('x3and25', v); },
   get overshootSkip() { return this.data.overshootSkip; },
   set overshootSkip(v) { this.set('overshootSkip', v); },

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
   // console.warn('******************** initGame ********************');
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
   View('p1score').innerHTML = `${Settings.toFinish - shotsByPlayer.playerOne.score - shotsByPlayer.playerOne.session} <span>${shotsByPlayer.playerOne.score}</span>`;
   View('p2score').innerHTML = `${Settings.toFinish - shotsByPlayer.playerTwo.score - shotsByPlayer.playerTwo.session} <span>${shotsByPlayer.playerTwo.score}</span>`;
   View('p1progress').style.width = `${(shotsByPlayer.playerOne.score + shotsByPlayer.playerOne.session) * 100 / Settings.toFinish}%`;
   View('p2progress').style.width = `${(shotsByPlayer.playerTwo.score + shotsByPlayer.playerTwo.session) * 100 / Settings.toFinish}%`;

   showHint({
      playerOne: Settings.toFinish - shotsByPlayer.playerOne.score - shotsByPlayer.playerOne.session,
      playerTwo: Settings.toFinish - shotsByPlayer.playerTwo.score - shotsByPlayer.playerTwo.session,
   });
}

function getPlayerPoints() {
   getPoints('playerOne');
   getPoints('playerTwo');
   function getPoints(player) {
      View(player === 'playerOne' ? 'p1shots' : 'p2shots').innerHTML = '';
      shotsByPlayer[player === 'playerOne' ? 'playerOne' : 'playerTwo'].all.forEach(item => {
         let div = document.createElement('div');
         div.className = !item.status ? 'bad' : '';
         div.innerHTML = `${item.sector}${item.x > 1 ? 'x' + item.x : ''}`;

         View(player === 'playerOne' ? 'p1shots' : 'p2shots').append(div);
      })
   }
}

function showHint(score) {
   View('p1sX').innerHTML = '';
   View('p2sX').innerHTML = '';

   function hintShot(num) {
      function hintForPlayer(output) {
         if (num - Math.trunc(num / 2) * 2 === 0 && Math.trunc(num / 2) <= 20) {
            output.innerHTML = `${num / 2}X2`;
         }
         if (num === 50) {
            output.innerHTML += ` ${num}`;
         }
         if (Settings.x3and25) {
            if (num - Math.trunc(num / 3) * 3 === 0) {
               output.innerHTML += ` ${num / 3}X3`;
            }
            if (num === 25) {
               output.innerHTML += ` ${num}`;
            }
         }
      }

      if (num === score.playerOne) {
         hintForPlayer(View('p1sX'));
      }
      if (num === score.playerTwo) {
         hintForPlayer(View('p2sX'));
      }
   }

   board[Settings.x3and25].find(hintShot);
}

function latestThrows() {
   View('latestThrows').innerHTML = '';
   for (let i = Storage.shots.length - 1; i >= Storage.shots.length - 6; i--) {
      if (Storage.shots.at(i) !== undefined && Storage.shots[i] !== undefined) {
         let val = Storage.shots[i];
         let div = document.createElement('div');
         div.className = 'shot';
         let player = document.createElement('div');
         let shot = document.createElement('div');
         player.className = 'player';
         player.innerHTML = val['player'] ?? '';
         shot.className = 'value';
         shot.innerHTML = val.x !== undefined ? `${val.sector}${val.x !== 1 ? 'x' + val.x : ''}` : '';
         div.append(player, shot);
         View('latestThrows').append(div);
      }
   }
}
