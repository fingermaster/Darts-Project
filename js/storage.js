const Storage = {
   maxGameId: 0,
   games: [],
   shots: [],
   LastGame: async () => {
      let lastGame = await DB.getLastGame();

      // Проверяем, что база вообще что-то вернула
      if (lastGame && lastGame['lastGame']) {
         Storage.maxGameId = lastGame['maxId'];
         Storage.games[0] = lastGame['lastGame'];
         await Storage.GetShots();
      } else {
         // Если база пуста, гарантируем, что массив останется чистым
         Storage.maxGameId = 0;
         Storage.games = [];
      }
   },

   GetShots: async () => {
      Storage.shots = await DB.read('shots', ['game', Storage.maxGameId]);
   },

   addShot: async (shotData) => {
      let id = await DB.addData('shots', shotData);
      shotData.id = id;
      // console.warn(`CALLBACK ID ${id}`);
      Storage.shots.push(shotData);
      return Storage.shots;
   },

   CancelShot: async () => {
      if (Storage.shots.length > 0) {
         const lastShot = Storage.shots[Storage.shots.length - 1];
         await DB.delete(lastShot.id, 'shots');
         Storage.shots.splice(Storage.shots.length - 1, 1);
      }
   },

   CheckGameID: async function () {
      // Если массив пуст ИЛИ первый элемент пустой (результат неудачного LastGame)
      if (Storage.games.length === 0 || !Storage.games[0]) {
         await Storage.NewGame();
         return Storage.games[0]; // Возвращаем созданную игру
      } else {
         const gameDB = Storage.games[Storage.games.length - 1];

         // БЕЗОПАСНАЯ ПРОВЕРКА: сначала проверяем наличие объекта
         if (gameDB && gameDB.id > 0) {
            Settings.current = gameDB.id;

            // Используем метод load, чтобы не зациклить сеттеры
            if (Object.keys(gameDB).includes('toFinish')) {
               Settings.load(gameDB); // Предполагаем, что вы внедрили метод load
            } else {
               Settings.load({ toFinish: 501, overshootSkip: 0, x3and25: 1 });
            }

            gameConsole(`Game ID ${gameDB.id} OK`);
            return gameDB;
         } else {
            // Если объект есть, но id кривой — создаем новую игру
            await Storage.NewGame();
            return Storage.games[Storage.games.length - 1];
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
      // console.trace("Откуда пришел вызов?");
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
      console.log(gameDB);
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
