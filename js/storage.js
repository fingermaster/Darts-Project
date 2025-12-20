// import('db');
//{IndexedDB} from "db.js";
// const DB = new IndexedDB;
// import {DB} from "/js/db.js";

const Storage = {
   maxGameId: 0,
   games: [],
   shots: [],
   MaxID: () => {
      // console.log(`%cMaxID`, InfoConsoleCSS);
      DB.findMaxId((maxGameId, games) => {
         Storage.maxGameId = maxGameId;
         Storage.games = games;
         Storage.GetShots();
      });
   },
   GetShots: () => {
      // console.log(`%cGetShots`, InfoConsoleCSS);
      DB.read('shots', ['game', Storage.maxGameId], (shots) => {
         Storage.shots = shots;
      });
   },
   addShot: (shotData, callback = () => {}) => {
      DB.addData('shots', shotData, (id) => {
         shotData.id = id;
         console.warn(`CALLBACK ID ${id}`);
         Storage.shots.push(shotData);
         callback(Storage.shots);
      });

   },
   CancelShot: (callback) => {
      if (Storage.shots.length > 0) {
         console.log(Storage.shots);
         console.log(Storage.shots[Storage.shots.length - 1]);
         console.log(Storage.shots[Storage.shots.length - 1].id);
         DB.delete(Storage.shots[Storage.shots.length - 1].id, 'shots', () => {
            Storage.shots.splice(Storage.shots.length - 1, 1);
            callback();
         });
      }
   },
   CheckGameID: function (callback) {
      // console.log(`%cCheckGameID`, InfoConsoleCSS);
      if (Storage.games.length === 0) {
         Storage.NewGame();
      } else {
         const gameDB = Storage.games[Storage.games.length - 1];
         if (gameDB.id > 0) {
            Settings.current = gameDB.id;
            // console.log(gameDB);
            if (Object.keys(gameDB).includes('toFinish')) {
               Settings.toFinish = gameDB.toFinish;
               Settings.overshootSkip = gameDB.overshootSkip;
               Settings.x3and25 = gameDB.x3and25;
            } else {
               Settings.toFinish = 501;
               Settings.overshootSkip = 0;
               Settings.x3and25 = 1;
            }
            gameConsole(`Game ID ${gameDB.id} OK`);
            callback(gameDB);
         } else {
            // console.trace(`Game ID is not defined`);
            callback(undefined);
         }
      }

   },
   SetGameEnd: () => {
      // console.log(`%cSetGameEnd`, InfoConsoleCSS);
      let gameDB = Storage.games[Storage.games.length - 1];
      gameDB.end = new Date();
      DB.addData('games', gameDB);
   },
   GetNext: () => {
      // console.log(`%cGetNext`, InfoConsoleCSS);
      Settings.next = Storage.games[Storage.games.length - 1].next;
   },
   SetNext: (next) => {
      // console.log(`%cSetNext`, InfoConsoleCSS);
      let gameDB = Storage.games[Storage.games.length - 1];
      Settings.next = next;
      gameDB.next = next;
      DB.addData('games', gameDB);
   },
   SetFirst: (next) => {
      // console.log(`%cSetFirst`, InfoConsoleCSS);
      let gameDB = Storage.games[Storage.games.length - 1];
      Settings.first = next;
      Settings.next = next;
      gameDB.next = next;
      gameDB.first = next;
      DB.addData('games', gameDB);
   },
   SetSettings: () => {
      // console.log(`%cSetSettings`, InfoConsoleCSS);
      let gameDB = Storage.games[Storage.games.length - 1];
      gameDB.x3and25 = Settings.x3and25;
      gameDB.overshootSkip = Settings.overshootSkip;
      gameDB.toFinish = Settings.toFinish;
      DB.addData('games', gameDB);
   },
   NewGame: () => {
      // console.log(`%cNewGame`, InfoConsoleCSS);
      let gameData = {
         begin: new Date(),
         end: '',
         first: Settings.first,
         p1: Settings.p1,
         p2: Settings.p2,
         winner: '',
         next: Settings.first,
         toFinish: Settings.toFinish,
         overshootSkip: Settings.overshootSkip,
         x3and25: Settings.x3and25,
      };
      DB.addData('games', gameData, (gameId) => {
         Storage.maxGameId = gameId;
         gameData.id = gameId;
         Storage.games.push(gameData);
      });
      Storage.MaxID();
   },
   EndGame: function () {
      // console.log(`%cEndGame`, InfoConsoleCSS);
      Storage.SetGameEnd();
   },
   PlayersList: (callback) => {
      // console.log(`%cPlayersList`, InfoConsoleCSS);
      DB.read('players', false, (p) => {
         players = p;
         callback(p);
      });
   },
   NewPlayer: function (data, callback = function (e) {
      console.log(e)
   }) {
      // console.log(`%cNewPlayer`, InfoConsoleCSS);
      data.forEach((row) => {
         if (row.length > 0) {
            DB.addData('players', {name: row});
         }
      });
      DB.read('players', false, (p) => {
         players = p;
         callback(p);
      });
   },
};

Storage.MaxID();


/*
* Временный полукостыль от Google
* */
Storage.init = () => {
   return new Promise((resolve) => {
      Storage.MaxID(() => resolve());
   });
};
