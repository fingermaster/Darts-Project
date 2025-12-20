let player, modal, players, Game;


// dom.js
(function() {
   // Этот массив теперь ПРИВАТНЫЙ, недоступен из консоли или других скриптов
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
   // Мы явно "публикуем" только функцию View в глобальную область видимости (window).
   window.View = View;

   // TODO: Когда весь проект станет модульным:
   // 1. Убрать обертку (function() { ... })();
   // 2. Удалить строку window.View = View;
   // 3. Добавить в начале: export { View };
})();

let checkValue = function (value) {
   return value === -1 ? 0 : value;
}

const InfoBar = () => {
   View('gameInfo').innerHTML = `
        <div class="name">#${Settings.current} ${Settings.toFinish}</div>
        <div>
            <div class="players">${Settings.p1} vs ${Settings.p2}</div>
            (   finish mode: ${Settings.x3and25 === 1 ? 'x3 and 25' : 'without x3 and 25'}; 
                overshot: ${Settings.overshootSkip === 1 ? 'skip' : 'don\'t skip'}   )
        </div>`;
}

const Settings = {
   get toFinish() {
      return this.toFinishValue;
   },
   set toFinish(num) {
      if (this.toFinishValue !== num) {
         for (let i = 0; i < View('toFinish').children.length; i++) {
            View('toFinish').children[i].classList.remove('active')
         }
         switch (num) {
            case 301:
               View('toFinish').children[0].classList.add('active');
               break;
            case 501:
               View('toFinish').children[1].classList.add('active');
               break;
            default: {
               View('toFinish').children[2].classList.add('active');
               console.log('default')
               break;
            }
         }
         this.toFinishValue = num;
         InfoBar();
         this.updateInDB();
      }
   },
   get x3and25() {
      return this.x3and25Value;
   },
   set x3and25(num) {
      if (this.x3and25Value !== num) {
         View('x3and25').children[checkValue(this.x3and25Value)].classList.remove('active');
         View('x3and25').children[num].classList.add('active');
         this.x3and25Value = num;
         InfoBar();
         this.updateInDB();
      }
   },
   get overshootSkip() {
      return this.overshootSkipValue;
   },
   set overshootSkip(num) {
      if (this.overshootSkipValue !== num) {
         View('overshootSkip').children[checkValue(this.overshootSkipValue)].classList.remove('active');
         View('overshootSkip').children[num].classList.add('active');
         this.overshootSkipValue = num;
         InfoBar();
         this.updateInDB();
      }
   },
   updateInDB: () => Storage.SetSettings(),
   toFinishValue: 501,
   x3and25Value: 1,
   overshootSkipValue: 0,
   p1: 'Player One',
   p2: 'Player Two',
   current: 1,
   first: 'p1',
   next: 'p1',
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

const initGame = () => {
   // console.warn('******************** initGame ********************');
   selector.toIndex(0);
   const timer = new Timer(() => {
      sendShot(0, 1);
   }, 10, 100);

   function sendShot(sector, x) {
      console.warn(Game.next);
      let shotData = {
         player: Settings[Game.next],
         sector: sector,
         x: x,
         sx: sector * x,
      };
      shotData.game = parseInt(Settings.current);
      shotData.date = new Date();
      Storage.addShot(shotData, () => {
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
      });

      selector.toIndex(0);
   }

   window.document.onkeydown = (event) => {
      let selected;
      if(typeof event.code !== "string") return;
      switch (event.code) {
         case 'Digit1':
            Game.first = 'p1';
            break;
         case 'Digit2':
            Game.first = 'p2';
            break;
         case 'Space':
            event.preventDefault();
            sendShot(0, 1);
            timer.clearTimer();
            break;
         case 'Backspace':
            event.preventDefault();
            Game.cancelLastHit();
            timer.clearTimer();
            break;
         case 'Enter':
            selected = selector.enter();
            sendShot(selected.sector, selected.x);
            timer.clearTimer();
            break;
         case 'NumpadEnter':
            selected = selector.enter();
            sendShot(selected.sector, selected.x);
            timer.clearTimer();
            break;
         case 'Pause':
            timer.switchTimer();
            break;
         case 'NumpadDivide':
            randomGenerator.all();
            break;
         case 'NumpadMultiply':
            randomGenerator.sector();
            break;
         default:
            if (event.code.includes('Arrow')) {
               selector.keyDown(event);
            }
            if (event.code.includes('Numpad')) {
               event.preventDefault();
               let num = (event.code).match(/\d+/g);
               if (num !== null) {
                  num = parseInt(num[0]);
                  if (num === 0) {
                     num = 10;
                  }
                  if (event.shiftKey) {
                     num = num + 10;
                  }
                  selector.toSector(num);
               }
               // selector.keyDown(event);
            }
            break;
      }
   }
   onwheel = (event) => {
      event.deltaY > 0 ? selector.keyDown({code: 'ArrowLeft'}) : selector.keyDown({code: 'ArrowRight'});
   };



   Storage.CheckGameID((game) => {
      // console.log(game);
      if (game.p1) {
         Settings.first = game.first;
         setGameDataNames(game);
         calculate(function () {
         });
      } else {
         modal.toggle();
      }
      InfoBar();
   });


   View('playersSelect').innerHTML = '';
   View('p1input').value = Settings.p1;
   View('p2input').value = Settings.p2;
   Storage.PlayersList((names) => {
      View('playersSelect').innerHTML = '';
      names.forEach(function (el) {
         View('playersSelect').innerHTML += `<option value='${el.name}' class="selectplayer" data-player-name="${el.name}">${el.name}</option>\n`;
      });
   });
}


document.onclick = (clickEvent) => {
   if (clickEvent.target.tagName !== 'BUTTON' &&
         modal.state === true &&
         !modal.isOnModal(clickEvent.x, clickEvent.y)) {
      modal.hide();
   }
   if (clickEvent.target.id === 'start') {
      Storage.NewPlayer([View('p1input').value, View('p2input').value], () => {
         Settings.p1 = View('p1input').value;
         Settings.p2 = View('p2input').value;
         Game.first = 'p1';
         setGameDataNames();
         Game.new();
         modal.toggle();
      });
   }
   if (clickEvent.target.parentNode.dataset.num) {
      selector.toIndex(clickEvent.target.parentNode.dataset.num);
   }
};

function setGameDataNames(data = {}) {
   if (data.p1) {
      Settings.p1 = data.p1;
      Settings.p2 = data.p2;
   }
   View('p1').innerHTML = Settings.p1;
   View('p2').innerHTML = Settings.p2;
}

modal = {
   show: function () {
      View('p1input').value = Settings.p1;
      View('p2input').value = Settings.p2;
      document.getElementsByClassName('modal').item(0).classList.add('show');
      modal.state = true;
   },
   hide: function () {
      document.getElementsByClassName('modal').item(0).classList.remove('show');
      modal.state = false;
   },
   toggle: function () {
      if (document.getElementsByClassName('modal').item(0).classList.contains('show')) {
         this.hide();
      } else {
         this.show();
      }
   },
   isOnModal: function (x, y) {
      let mSize = document.getElementsByClassName('modal').item(0).getBoundingClientRect();
      return x > mSize.left &&
            x < (mSize.left + mSize.width) &&
            y > mSize.top &&
            y < (mSize.top + mSize.height);
   },
   state: false
}

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
   cancelLastHit: function () {
      View('fireworks').style.display = 'none';
      Storage.CancelShot(() => {
         calculate(function () {
            // console.log('we are calculate');
         });
      })

   },
   clearX: function () {
      View('p1sX').innerHTML = View('p2sX').innerHTML = '';
   },
   new: function () {
      Game.clearX();
      Storage.NewGame();
      View('p1shots').innerHTML = View('p2shots').innerHTML = '';
      View('p1score').innerHTML = Settings.toFinish;
      View('p2score').innerHTML = Settings.toFinish;
      View('fireworks').style.display = 'none';
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
