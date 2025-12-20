const Storage = {
   maxGameId: 0,
   games: [],
   shots: [],
   LastGame: async () => {
      let lastGame = await DB.getLastGame();
      Storage.maxGameId = lastGame['maxId'];
      Storage.games[0] = lastGame['lastGame'];
      await Storage.GetShots();
   },

   GetShots: async () => {
      Storage.shots = await DB.read('shots', ['game', Storage.maxGameId]);
   },

   addShot: async (shotData, callback = () => {}) => {
      let id = await DB.addData('shots', shotData);
      shotData.id = id;
      // console.warn(`CALLBACK ID ${id}`);
      Storage.shots.push(shotData);
      callback(Storage.shots);
   },

   CancelShot: async () => {
      if (Storage.shots.length > 0) {
         const lastShot = Storage.shots[Storage.shots.length - 1];
         await DB.delete(lastShot.id, 'shots');
         Storage.shots.splice(Storage.shots.length - 1, 1);
      }
   },

   CheckGameID: async function () {
      if (Storage.games.length === 0) {
         await Storage.NewGame();
      } else {
         const gameDB = Storage.games[Storage.games.length - 1];
         if (gameDB.id > 0) {
            Settings.current = gameDB.id;
            console.log(gameDB);
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
            return gameDB;
         } else {
            console.trace(`Game ID is not defined`);
            return undefined;
         }
      }
   },

   SetGameEnd: async () => {
      console.log(`%cSetGameEnd`, ConsoleCSS);
      let gameDB = Storage.games[Storage.games.length - 1];
      gameDB.end = new Date();
      await DB.addData('games', gameDB);
   },

   GetNext: () => {
      console.log(`%cGetNext`, ConsoleCSS);
      Settings.next = Storage.games[Storage.games.length - 1].next;
   },

   SetNext: async (next) => {
      console.log(`%cSetNext`, ConsoleCSS);
      let gameDB = Storage.games[Storage.games.length - 1];
      Settings.next = next;
      gameDB.next = next;
      await DB.addData('games', gameDB);
   },

   SetFirst: async (next) => {
      console.log(`%cSetFirst`, ConsoleCSS);
      let gameDB = Storage.games[Storage.games.length - 1];
      Settings.first = next;
      Settings.next = next;
      gameDB.next = next;
      gameDB.first = next;
      await DB.addData('games', gameDB);
   },

   SetSettings: async () => {
      console.log(`%cSetSettings`, ConsoleCSS);
      let gameDB = Storage.games[Storage.games.length - 1];
      gameDB.x3and25 = Settings.x3and25;
      gameDB.overshootSkip = Settings.overshootSkip;
      gameDB.toFinish = Settings.toFinish;
      await DB.addData('games', gameDB);
   },

   NewGame: async () => {
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
      let gameId = await DB.addData('games', gameData);
      console.log(gameId);
      Storage.maxGameId = gameId;
      gameData.id = gameId;
      Storage.shots = [];
      Storage.games.push(gameData);
   },

   EndGame: async function () {
      await Storage.SetGameEnd();
   },

   PlayersList: async () => {
      players = await DB.read('players', false);
      return players;
   },

   NewPlayer: async function (data) {
      data.forEach((row) => {
         if (row.length > 0) {
            DB.addData('players', {name: row});
         }
      });
      players = await this.PlayersList();
      return players;
   },
};

Storage.LastGame();
