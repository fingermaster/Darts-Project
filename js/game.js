let vx, player, modal, players, Game;
// let shots = [];

let HTMLtoFinish = document.getElementById('toFinish');
let HTMLx3and25 = document.getElementById('x3and25');
let HTMLovershootSkip = document.getElementById('overshootSkip');
let randInput = document.getElementById('randInput');
let randInput20 = document.getElementById('randInput20');
let p1 = document.getElementById('p1');
let p1shots = document.getElementById('p1shots');
let p1score = document.getElementById('p1score');
let p1sX = document.getElementById('p1sX');
let p2 = document.getElementById('p2');
let p2shots = document.getElementById('p2shots');
let p2score = document.getElementById('p2score');
let p2sX = document.getElementById('p2sX');
let p1input = document.getElementById('p1input');
let p2input = document.getElementById('p2input');
let playersSelect = document.getElementById('playersSelect');

let checkValue = function(value){
    return value === -1 ? 0 : value;
}

const Settings = {
    get toFinish() {
        return this.toFinishValue;
    },
    set toFinish(num) {
        if(this.toFinishValue !== num) {
            for(let i = 0; i < HTMLtoFinish.children.length; i++){
                HTMLtoFinish.children[i].classList.remove('active')
            }
            switch (num){
                case 301: HTMLtoFinish.children[0].classList.add('active'); break;
                case 501: HTMLtoFinish.children[1].classList.add('active'); break;
                default: {
                    HTMLtoFinish.children[2].classList.add('active');
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
        if(this.x3and25Value !== num) {
            HTMLx3and25.children[checkValue(this.x3and25Value)].classList.remove('active');
            HTMLx3and25.children[num].classList.add('active');
            this.x3and25Value = num;
            InfoBar();
            this.updateInDB();
        }
    },
    get overshootSkip(){
        return this.overshootSkipValue;
    },
    set overshootSkip(num) {
        if(this.overshootSkipValue !== num) {
            HTMLovershootSkip.children[checkValue(this.overshootSkipValue)].classList.remove('active');
            HTMLovershootSkip.children[num].classList.add('active');
            this.overshootSkipValue = num;
            InfoBar();
            this.updateInDB();
        }
    },
    updateInDB: () => DbObject.SetSettings(),
    toFinishValue: 501,
    x3and25Value: 1,
    overshootSkipValue: 0,
};

const VxBoard = document.getElementById('vxBoard');

const boardNums = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const board = {
    0:	[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,50],
    1:	[2,3,4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28,30,32,33,34,36,38,39,40,42,45,48,50,51,54,57,60]
};

const DATA = {
    maxId: 0,
    p1:'',
    p2:'',
    current: 0,
    set beginned(bool){
        this.beginStatus = bool;
    },
    get beginned(){
        return this.beginStatus;
    },
    next: 'p1',
    beginTime: '',
    endTime: '',
    lastShot: {p:'',sector:0,x:1},
    gameObj: {},
    first: 'p1',
    shots: {p1:0,p2:0,total:0,turn:0},
    score: {p1: {score: 0, temp: 0}, p2: {score: 0, temp: 0}},
    beginStatus: false,
};

players = Array();

function showRandDeck(){
    randInput.innerHTML = randDeck();
}
function showRand20(){
    randInput20.innerHTML = rand20();
}

const InfoBar = function (){
    document.getElementById('gameInfo').innerHTML = `
			<div class="name">#${DATA.gameObj.id} ${Settings.toFinish}</div>
			<div>
				<div class="players">${DATA.p1} vs ${DATA.p2}</div>
				(finish mode: ${Settings.x3and25 === 1 ? 'x3 and 25' : 'without x3 and 25' }; overshot: ${Settings.overshootSkip === 1 ? 'skip' : 'don\'t skip'})
			</div>`;
}

function setGameDataNames(data = {}){
    if(data.p1){
        DATA.p1 = data.p1;
        DATA.p2 = data.p2;
    }
    p1.innerHTML = DATA.p1;
    p2.innerHTML = DATA.p2;
}

const Shots = {
    add: function (shot){
        // console.log(shot);
        if(shot !== undefined) {
            shots.splice(0, 0, shot);
        }
    },
    last: () => { return Array.from({length: 6}).map((_, index) => {
        return shots[index]??{};
    })},
    clear: () => { shots = []; }
}

let selector = new Selector();


let initGame = () => {
    selector.toIndex(0);

    function sendData(sector, x) {
        const next = Game.next;
        let shotData = {
            player: DATA[next],
            sector: sector,
            x: x,
            sx: sector * x,
            shotn: DATA.shots[next] % 3 + 1,
            yn: false,
            calc: true
        };
        goData(next, shotData);
        selector.toIndex(0);
    }

    window.document.onkeydown = function (event) {
        console.log(event.code);
        switch (event.code) {
            case 'Digit1':
                Game.first = 'p1';
                break;
            case 'Digit2':
                Game.first = 'p2';
                break;
            case 'Space':
                event.preventDefault();
                sendData(0, 1)
                break;
            case 'Backspace':
                event.preventDefault();
                Game.cancelLastHit();
                break;
            case 'Enter':
                let selected = selector.enter();
                sendData(selected.sector, selected.x);
                break;
            default:
                if (event.code.includes('Arrow')) {
                    selector.keyDown(event);
                }
                if (event.code.includes('Numpad')) {
                    event.preventDefault();
                    let num = (event.code).match(/\d+/g);
                    if(num !== null) {
                        num = parseInt(num[0]);
                        if(num === 0) {
                            num = 10;
                        }
                        if(event.shiftKey) {
                            num = num + 10;
                        }
                        selector.toSector(num);
                    }
                    // selector.keyDown(event);
                }
                break;
        }
    }
    window.document.onkeyup = function (event) {
        if (event.code.includes('Arrow')) {
            selector.keyUp(event);
        }
    }

    player.list();

    DbObject.CheckGameID(function (game) {
        console.log(game)
        if (game.p1) {
            DATA.first = game.first;
            setGameDataNames(game);
            calculate(function () {
            });
        } else {
            modal.toggle();
        }
        InfoBar();
    });
}
setTimeout(()=>{
    initGame()
}, 100);


document.onclick = function(e){
    if(e.target.tagName !== 'BUTTON' && modal.state === true && !modal.isOnModal(e.x, e.y)){
        modal.hide();
    }
    if(e.target.id === 'start'){
        DbObject.NewPlayer([p1input.value, p2input.value],function(){
            DATA.p1 = p1input.value ;
            DATA.p2 = p2input.value;
            // let inputSettings = new FormData(document.forms.InputSettings);
            Game.first = 'p1';
            setGameDataNames();
            Game.new();
            modal.toggle();
        });
    }
    if(e.target.parentNode.dataset.num){
        selector.toIndex(e.target.parentNode.dataset.num);
        // console.info(e.target.parentNode.dataset.num)
    }
    if(e.target.dataset.point){
        // console.log(`Shot from ${game.next}`);
        goData(Game.next, {
            player: DATA[Game.next],
            sector: parseInt(e.target.dataset.point),
            x:parseInt(e.target.dataset.x),
            sx: parseInt(e.target.dataset.point)*parseInt(e.target.dataset.x),
            shotn: DATA.shots[Game.next]%3+1,
            yn: false,
            calc: true
        });
    }
};

modal = {
    show: function () {
        document.getElementById('p1input').value = DATA.p1;
        document.getElementById('p2input').value = DATA.p2;
        document.getElementsByClassName('modal').item(0).classList.add('show');
        modal.state = true;
    },
    hide: function () {
        document.getElementsByClassName('modal').item(0).classList.remove('show');
        modal.state = false;
    },
    toggle: function () {
        if(document.getElementsByClassName('modal').item(0).classList.contains('show')) {
            this.hide();
        } else {
            this.show();
        }
    },
    isOnModal: function (x,y) {
        let mSize = document.getElementsByClassName('modal').item(0).getBoundingClientRect();
        if (x < mSize.left) return false;
        if (x > (mSize.left + mSize.width)) return false;
        if (y < mSize.top) return false;
        if (y > (mSize.top + mSize.height)) return false;
        return true;
    },
    state: false
}


vx = {
    playerActive: function(p){
        if(p === 'p1') {
            document.getElementById('p1').classList.add('active');
            document.getElementById('p2').classList.remove('active');
        } else {
            document.getElementById('p2').classList.add('active');
            document.getElementById('p1').classList.remove('active');
        }
    },
};


Game = {
    get next(){
        DbObject.GetNext();
        return DATA.next;
    },
    set next(p){
        DbObject.SetNext(p);
        vx.playerActive(p);
        this.turn = 0;
    },
    set first(p){
        console.log('SET FIRST!!!!')
        DbObject.SetNext(p);
        DbObject.SetFirst(p);
        vx.playerActive(p);
        this.turn = 0;
    },
    get turn(){
        return DATA.shots.turn;
    },
    set turn(shot){
        DATA.shots.turn = shot;
    },
    cancelLastHit: function(){
        document.getElementById("fireworks").style.display = 'none';
        console.info(`game.turn = %o, game.next = %o`, Game.turn, Game.next);
        DbObject.CancelShot(() => {
            let who = Game.next;
            console.log(who);
            if(Game.turn !== 0){
                Game.turn = Game.turn - 1;
            } else {
                if(who === 'p1') who = 'p2';
                else who = 'p1';
                Game.next = who;
                Game.turn = 2;
            }
            calculate(function(){
                // console.log('we are calculate');
            });
        })

    },
    clearX: function(){
        document.getElementById('p1sX').innerHTML = document.getElementById('p2sX').innerHTML = '';
    },
    new: function(){
        Game.clearX();
        DbObject.NewGame();
        Game.turn = 0;
        DATA.shots = {p1:0,p2:0,total:0,turn:0};
        p1shots.innerHTML = p2shots.innerHTML = '';
        p1score.innerHTML = Settings.toFinish;
        p2score.innerHTML = Settings.toFinish;
        document.getElementById("fireworks").style.display = 'none';
    },
    end: function(p){
        DbObject.EndGame();
        document.getElementById("fireworks").style.display = 'flex';
        document.getElementById("fireworksname").innerHTML = `${DATA[p]} WON!`;
    },
};

player = {
    list: () => {
        playersSelect.innerHTML = '';
        p1input.value = DATA.p1;
        p2input.value = DATA.p2;
        DbObject.PlayersList(() => {
            playersSelect.innerHTML = '';
            players.forEach(function(el){
                playersSelect.innerHTML += `<option value='${el.name}' class="selectplayer" data-player-name="${el.name}">${el.name}</option>\n`;
            });
        });
    }
};

function goData(player = 'p1', shot){
    if(shot) {
        shot.game = parseInt(DATA.current);
        shot.date = new Date();
        DbObject.NewShot(shot);

        if(Settings.overshootSkip && DATA.score[player].temp+shot.sx > Settings.toFinish-2){
            goZero();
            function goZero(){
                if(shot.shotn < 3){
                    shot.date++;
                    shot.shotn++;
                    shot.sector = 0;
                    shot.x = 1;
                    shot.sx = 0;
                    DbObject.NewShot(shot);
                    goZero();
                }
            }
        }
    }
    calculate(function(){
        // console.log(`looks like calculated`);
    });
}

function clearData(){
    p1shots.innerHTML = p2shots.innerHTML = p1score.innerHTML = p2score.innerHTML = '';
}

function calculate(callback){
    clearData();
    let shots = DbObject.shots;
    let p1name = DATA.p1;

    DATA.score = {p1: {score: 0, temp: 0}, p2: {score: 0, temp: 0}};

    DATA.shots.p1 = 0;
    DATA.shots.p2 = 0;
    DATA.shots.total = 0;

    Shots.clear();

    shots.forEach((shot) => {
        Shots.add(shot);

        let value = shot;
        let gamer;
        let correct = false;

        if (p1name === value.player) gamer = 'p1';
        else gamer = 'p2';

        DATA.shots.total++;
        DATA.shots[gamer]++;

        if (value.shotn === 1) {
            DATA.score[gamer].temp = DATA.score[gamer].score;
        }
        if ((isCorrect(value.sector, value.x, Settings.toFinish - DATA.score[gamer].temp) && value.shotn === 3) ||
            (isCorrect(value.sector, value.x, Settings.toFinish - DATA.score[gamer].temp) && DATA.score[gamer].temp + value.sx === Settings.toFinish)) {
            correct = true;
            DATA.score[gamer].score = DATA.score[gamer].temp + value.sx;
            // nowScore = true;
        }
        if (isCorrect(value.sector, value.x, Settings.toFinish - DATA.score[gamer].temp)) {
            correct = true;
            DATA.score[gamer].temp = DATA.score[gamer].temp + value.sx;
        } else {
            if (DATA.score[gamer].temp + value.sx > Settings.toFinish - DATA.score[gamer].temp) DATA.score[gamer].temp = DATA.score[gamer].score;
        }
        if (value.shotn === 3) DATA.score[gamer].score = DATA.score[gamer].temp;
        let outputMultiplier = '';
        if (value.x > 1) outputMultiplier = `x${value.x}`;

        document.getElementById(`${(p1name === value.player) ? 'p1' : 'p2'}shots`).innerHTML +=
            `<div class="shot ${(!correct) ? 'bad' : ''}">${(value.sector !== 0) ? value.sector + outputMultiplier : '0'}</div>`;
        document.getElementById(`${(p1name === value.player) ? 'p1' : 'p2'}shots`).innerHTML += `${(value.shotn === 3) ? '<div class="scorecol">' + DATA.score[gamer].score + '</div>' : ''}`;

        if (p1name === value.player) {
            DATA.lastShot.p = 'p1'
        } else {
            DATA.lastShot.p = 'p2'
        }
        DATA.lastShot.sector = value.sector;
        DATA.lastShot.x = value.x;
    });

    let second = 'p2'
    if (DATA.first === 'p2') second = 'p1'

    let diffMod = DATA.shots.total % 6;
    console.log(`%c${diffMod}`, `font-size: 60px`);
    switch (true) {
        case diffMod < 3:
            if(diffMod === 0) {
                Game.next = DATA.first;
            }
            vx.playerActive(DATA.first);
            break;
        case diffMod >= 3:
            if(diffMod === 3) {
                Game.next = second;
            }
            vx.playerActive(second);
            break;
    }

    document.getElementById('p1sX').innerHTML = document.getElementById('p2sX').innerHTML = '';
    let sc = {
        p1: Settings.toFinish - DATA.score.p1.temp,
        p2: Settings.toFinish - DATA.score.p2.temp
    };

    function getX(e) {
        if (e === sc.p1) {
            if (e - Math.trunc(e / 2) * 2 === 0 && Math.trunc(e / 2) <= 20) p1sX.innerHTML = `${e / 2}X2`;
            if (Settings.x3and25) {
                if (e - Math.trunc(e / 3) * 3 === 0) p1sX.innerHTML += ` ${e / 3}X3`;
                if (e === 50 || e === 25) p1sX.innerHTML += ` ${e}`;
            }
            if (e === 50) p1sX.innerHTML += ` ${e}`;
        }
        if (e === sc.p2) {
            if (e - Math.trunc(e / 2) * 2 === 0 && Math.trunc(e / 2) <= 20) p2sX.innerHTML = `${e / 2}X2`;
            if (Settings.x3and25) {
                if (e - Math.trunc(e / 3) * 3 === 0) p2sX.innerHTML += ` ${e / 3}X3`;
                if (e === 50 || e === 25) p2sX.innerHTML += ` ${e}`;
            }
            if (e === 50) p2sX.innerHTML += ` ${e}`;
        }
    }
    console.log(Settings.x3and25)
    board[Settings.x3and25].find(getX);

    if (DATA.score.p1.score === Settings.toFinish || DATA.score.p2.score === Settings.toFinish) {
        console.log('END NAHOOY')
        Game.end(DATA.lastShot.p);
    }

    p1score.innerHTML = `${Settings.toFinish - DATA.score.p1.temp} <span>${Settings.toFinish - DATA.score.p1.score}</span>`;
    p2score.innerHTML = `${Settings.toFinish - DATA.score.p2.temp} <span>${Settings.toFinish - DATA.score.p2.score}</span>`;
    document.getElementById("p1progress").style.width = `${DATA.score.p1.temp * 100 / Settings.toFinish}%`;
    document.getElementById("p2progress").style.width = `${DATA.score.p2.temp * 100 / Settings.toFinish}%`;

    // document.getElementById('service').innerHTML = syntaxHighlight(Shots.last());
    document.getElementById('last3').innerHTML = '';
    Shots.last().forEach(val => {
        let div = document.createElement('div');
        div.className = 'shot';
        let player =  document.createElement('div');
        let shot =  document.createElement('div');
        player.className = 'player';
        player.innerHTML = val.player ?? '';
        shot.className = 'value';
        shot.innerHTML = val.x !== undefined ? `${val.sector}${val.x !== 1 ? 'x'+val.x : ''}` : '';
        div.append(player, shot);
        // div.append(shot);
        document.getElementById('last3').append(div);
    })
    callback('done');
}

const DbObject = {
    maxGameId: 0,
    games: [],
    shots: [],
    MaxID: () => {
        console.log(`%cMaxID`, InfoConsoleCSS);
        DB.setStore('games');
        setTimeout(async () => {
            DB.findMaxId((maxGameId, games)=>{
                DbObject.maxGameId = maxGameId;
                DbObject.games = games;
                DbObject.GetShots();
            });}, 0);
    },
    GetShots: () => {
        console.log(`%cGetShots`, InfoConsoleCSS);
        DB.setStore('shots');
        DB.read(['game', DbObject.maxGameId]).then();
        setTimeout(async () => {

                DbObject.shots = DB.result;
                console.log(DbObject.shots);

        }, 10);
    },
    NewShot: (shot) => {
        DB.setStore('shots');
        DB.addData(shot).then();
        DbObject.shots.push(shot);
    },
    CancelShot: (callback) => {
        DB.setStore('shots');
        if(DbObject.shots.length > 0) {
            DB.delete(DbObject.shots[DbObject.shots.length - 1].id).then();
            DbObject.shots.splice(DbObject.shots.length - 1, 1);
        }
        setTimeout(callback, 0)
    },
    CheckGameID: function(callback){
        console.log(`%cCheckGameID`, InfoConsoleCSS);
        const gameDB = DbObject.games[DbObject.games.length-1];
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
            if(gameDB.begin){
                DATA.beginned = true;
                DATA.beginTime = gameDB.begin;
            }
            if(gameDB.end){
                DATA.endTime = gameDB.end;
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
        let gameDB = DbObject.games[DbObject.games.length-1];
        gameDB.end = new Date();
        gameDB.hits = shots.length;
        DB.addData(gameDB).then();
    },
    GetNext: () => {
        // console.trace();
        console.log(`%cGetNext`, InfoConsoleCSS);
        DATA.next = DbObject.games[DbObject.games.length-1].next;
    },
    SetNext: (next) => {
        // console.trace();
        console.log(`%cSetNext`, InfoConsoleCSS);
        DB.setStore("games");
        let gameDB = DbObject.games[DbObject.games.length-1];
        DATA.next = next;
        gameDB.next = next;
        DB.addData(gameDB).then();
    },
    SetFirst: (next) => {
        console.log(`%cSetFirst`, InfoConsoleCSS);
        DB.setStore("games");
        let gameDB = DbObject.games[DbObject.games.length-1];
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
        let gameDB = DbObject.games[DbObject.games.length-1];
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
        DbObject.MaxID();
        setTimeout(async () => {
            return DbObject.games;
        }, 0);
    },
    EndGame: function(){
        console.log(`%cEndGame`, InfoConsoleCSS);
        DbObject.SetGameEnd();
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


// DbObject.initDB();
DbObject.MaxID();
