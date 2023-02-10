const Storage = {
    maxGameId: 0,
    games: [],
    shots: [],
    MaxID: () => {
        console.log(`%cMaxID`, InfoConsoleCSS);
        DB.setStore('games');
        setTimeout(async () => {
            DB.findMaxId((maxGameId, games)=>{
                Storage.maxGameId = maxGameId;
                Storage.games = games;
                Storage.GetShots();
            });}, 0);
    },
    GetShots: () => {
        console.log(`%cGetShots`, InfoConsoleCSS);
        DB.setStore('shots');
        DB.read(['game', Storage.maxGameId]).then();
        setTimeout(async () => {

            Storage.shots = DB.result;
            console.log(Storage.shots);

        }, 10);
    },
    NewShot: (shot) => {
        DB.setStore('shots');
        DB.addData(shot).then();
        Storage.shots.push(shot);
    },
    CancelShot: (callback) => {
        DB.setStore('shots');
        if(Storage.shots.length > 0) {
            DB.delete(Storage.shots[Storage.shots.length - 1].id).then();
            Storage.shots.splice(Storage.shots.length - 1, 1);
        }
        setTimeout(callback, 0)
    },
    CheckGameID: function(callback){
        console.log(`%cCheckGameID`, InfoConsoleCSS);
        const gameDB = Storage.games[Storage.games.length-1];
        if(gameDB.id>0) {
            DATA.current = gameDB.id;
            DATA.gameObj = gameDB;
            console.log(gameDB);
            if(Object.keys(gameDB).includes('toFinish')){
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

    },
    SetGameEnd: () => {
        console.log(`%cSetGameEnd`, InfoConsoleCSS);
        DB.setStore("games");
        let gameDB = Storage.games[Storage.games.length-1];
        gameDB.end = new Date();
        // gameDB.hits = shots.length;
        DB.addData(gameDB).then();
    },
    GetNext: () => {
        // console.trace();
        console.log(`%cGetNext`, InfoConsoleCSS);
        DATA.next = Storage.games[Storage.games.length-1].next;
    },
    SetNext: (next) => {
        // console.trace();
        console.log(`%cSetNext`, InfoConsoleCSS);
        DB.setStore("games");
        let gameDB = Storage.games[Storage.games.length-1];
        DATA.next = next;
        gameDB.next = next;
        DB.addData(gameDB).then();
    },
    SetFirst: (next) => {
        console.log(`%cSetFirst`, InfoConsoleCSS);
        DB.setStore("games");
        let gameDB = Storage.games[Storage.games.length-1];
        DATA.first = next;
        DATA.next = next;
        gameDB.next = next;
        gameDB.first = next;
        DB.addData(gameDB).then();
    },
    SetSettings: () => {
        // console.trace();
        console.log(`%cSetSettings`, InfoConsoleCSS);
        DB.setStore("games");
        let gameDB = Storage.games[Storage.games.length-1];
        gameDB.x3and25 = Settings.x3and25;
        gameDB.overshootSkip = Settings.overshootSkip;
        gameDB.toFinish = Settings.toFinish;
        DB.addData(gameDB).then();
    },
    NewGame: () => {
        console.log(`%cNewGame`, InfoConsoleCSS);
        let gData = {
            begin:	new Date(),
            end:	'',
            first:	DATA.first,
            p1:		DATA.p1,
            p2:		DATA.p2,
            winner:	'',
            hits:	0,
            lasthit:'',
            next:	DATA.first,
            toFinish: Settings.toFinish,
            overshootSkip: Settings.overshootSkip,
            x3and25: Settings.x3and25,
        };
        DB.setStore("games");
        DB.addData(gData).then();
        Storage.MaxID();
        setTimeout(async () => {
            return Storage.games;
        }, 0);
    },
    EndGame: function(){
        console.log(`%cEndGame`, InfoConsoleCSS);
        Storage.SetGameEnd();
    },
    PlayersList: (callback) => {
        console.log(`%cPlayersList`, InfoConsoleCSS);
        DB.setStore("players");
        DB.read().then();
        setTimeout(() => {
            players = DB.result;
            console.log(players);
            callback(players);
        }, 0);
    },
    NewPlayer: function(data, callback = function(e){console.log(e)}) {
        console.log(`%cNewPlayer`, InfoConsoleCSS);
        DB.setStore("players");
        data.forEach(row =>  {
            if(row.length > 0) DB.addData({name: row}).then();
        });
        DB.read().then();
        setTimeout(() => {
            players = DB.result;
            callback(players);
        }, 0);
    },
};

Storage.MaxID();
