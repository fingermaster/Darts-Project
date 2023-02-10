let player, modal, players, Game;

const ElementID = [
    'gameInfo',
    'HTMLtoFinish',
    'HTMLx3and25',
    'HTMLovershootSkip',
    'randInput',
    'randInput20',
    'p1',
    'p1progress',
    'p1shots',
    'p1score',
    'p1temp',
    'p1sX',
    'p2',
    'p2progress',
    'p2shots',
    'p2score',
    'p2temp',
    'p2sX',
    'p1input',
    'p2input',
    'playersSelect',
    'fireworks',
    'fireworksname',
    'last3'];
const View = (id) => {
    if(ElementID.includes(id)) {
        return document.getElementById(id)
    } else {
        return null;
    }
}

let checkValue = function(value){
    return value === -1 ? 0 : value;
}

const Settings = {
    get toFinish() {
        return this.toFinishValue;
    },
    set toFinish(num) {
        if(this.toFinishValue !== num) {
            for(let i = 0; i < View('HTMLtoFinish').children.length; i++){
                View('HTMLtoFinish').children[i].classList.remove('active')
            }
            switch (num){
                case 301: View('HTMLtoFinish').children[0].classList.add('active'); break;
                case 501: View('HTMLtoFinish').children[1].classList.add('active'); break;
                default: {
                    View('HTMLtoFinish').children[2].classList.add('active');
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
            View('HTMLx3and25').children[checkValue(this.x3and25Value)].classList.remove('active');
            View('HTMLx3and25').children[num].classList.add('active');
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
            View('HTMLovershootSkip').children[checkValue(this.overshootSkipValue)].classList.remove('active');
            View('HTMLovershootSkip').children[num].classList.add('active');
            this.overshootSkipValue = num;
            InfoBar();
            this.updateInDB();
        }
    },
    updateInDB: () => Storage.SetSettings(),
    toFinishValue: 501,
    x3and25Value: 1,
    overshootSkipValue: 0,
};

const boardNums = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const board = {
    0:	[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,50],
    1:	[2,3,4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28,30,32,33,34,36,38,39,40,42,45,48,50,51,54,57,60]
};

const DATA = {
    p1:'',
    p2:'',
    current: 0,
    next: 'p1',
    lastShot: {p:'',sector:0,x:1},
    gameObj: {},
    first: 'p1',
    shots: {p1:0,p2:0,total:0,turn:0},
    score: {p1: {score: 0, temp: 0}, p2: {score: 0, temp: 0}},
};

players = Array();


let selector = new Selector();

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

const InfoBar = function (){
    View('gameInfo').innerHTML = `
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
    View('p1').innerHTML = DATA.p1;
    View('p2').innerHTML = DATA.p2;
}


let initGame = () => {
    selector.toIndex(0);
    const timer = new Timer(() => {
        sendData(0,1);
    }, 10, 100);

    function sendData(sector, x) {
        const next = Game.next;
        let shotData = {
            player: DATA[next],
            sector: sector,
            x: x,
            sx: sector * x,
        };
        goData(next, shotData);
        selector.toIndex(0);
    }

    let holdKeys = [];

    window.document.onkeydown = (event) => {
        console.log(event.code);
        if(!holdKeys.includes(event.code) && !event.repeat){
            holdKeys.push(event.code);
        }
        let selected;
        switch (event.code) {
            case 'Digit1':
                Game.first = 'p1';
                break;
            case 'Digit2':
                Game.first = 'p2';
                break;
            case 'Space':
                event.preventDefault();
                sendData(0, 1);
                timer.clearTimer();
                break;
            case 'Backspace':
                event.preventDefault();
                Game.cancelLastHit();
                timer.clearTimer();
                break;
            case 'Enter':
                selected = selector.enter();
                sendData(selected.sector, selected.x);
                timer.clearTimer();
                break;
            case 'NumpadEnter':
                selected = selector.enter();
                sendData(selected.sector, selected.x);
                timer.clearTimer();
                break;
            case 'Pause':
                timer.switchTimer();
                break;
            case 'NumpadDivide': randomGenerator.all(); break;
            case 'NumpadMultiply': randomGenerator.sector(); break;
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
    document.addEventListener('keyup', (event) => {
        if (event.code.includes('Arrow')) {
            // selector.keyUp(event);
        }
        holdKeys.pop();
    });
    onwheel = (event) => {
        event.deltaY > 0 ? selector.keyDown({code: 'ArrowLeft'}) : selector.keyDown({code: 'ArrowRight'}) ;
    };

    player.list();

    Storage.CheckGameID((game) => {
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


document.onclick = (clickEvent) => {
    if(clickEvent.target.tagName !== 'BUTTON' &&
        modal.state === true &&
        !modal.isOnModal(clickEvent.x, clickEvent.y)){
        modal.hide();
    }
    if(clickEvent.target.id === 'start'){
        Storage.NewPlayer([View('p1input').value, View('p2input').value], () => {
            DATA.p1 = View('p1input').value ;
            DATA.p2 = View('p2input').value;
            Game.first = 'p1';
            setGameDataNames();
            Game.new();
            modal.toggle();
        });
    }
    if(clickEvent.target.parentNode.dataset.num){
        selector.toIndex(clickEvent.target.parentNode.dataset.num);
    }
};

modal = {
    show: function () {
        View('p1input').value = DATA.p1;
        View('p2input').value = DATA.p2;
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

Game = {
    get next(){
        Storage.GetNext();
        return DATA.next;
    },
    set next(player){
        Storage.SetNext(player);
        Game.setActivePlayer(player);
        this.turn = 0;
    },
    set first(player){
        Storage.SetNext(player);
        Storage.SetFirst(player);
        Game.setActivePlayer(player);
        this.turn = 0;
    },
    get turn(){
        return DATA.shots.turn;
    },
    set turn(shot){
        DATA.shots.turn = shot;
    },
    setActivePlayer: (player) => {
        if(player === 'p1') {
            View('p1').classList.add('active');
            View('p2').classList.remove('active');
        } else {
            View('p2').classList.add('active');
            View('p1').classList.remove('active');
        }
    },
    cancelLastHit: function(){
        View('fireworks').style.display = 'none';
        console.info(`game.turn = %o, game.next = %o`, Game.turn, Game.next);
        Storage.CancelShot(() => {
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
        View('p1sX').innerHTML = View('p2sX').innerHTML = '';
    },
    new: function(){
        Game.clearX();
        Storage.NewGame();
        Game.turn = 0;
        DATA.shots = {p1:0,p2:0,total:0,turn:0};
        View('p1shots').innerHTML = View('p2shots').innerHTML = '';
        View('p1score').innerHTML = Settings.toFinish;
        View('p2score').innerHTML = Settings.toFinish;
        View('fireworks').style.display = 'none';
    },
    end: (winner) => {
        Storage.EndGame();
        View('fireworks').style.display = 'flex';
        View('fireworksname').innerHTML = `${winner} WON!`;
    },
};

player = {
    list: () => {
        View('playersSelect').innerHTML = '';
        View('p1input').value = DATA.p1;
        View('p2input').value = DATA.p2;
        Storage.PlayersList(() => {
            View('playersSelect').innerHTML = '';
            players.forEach(function(el){
                View('playersSelect').innerHTML += `<option value='${el.name}' class="selectplayer" data-player-name="${el.name}">${el.name}</option>\n`;
            });
        });
    }
};

function goData(player = 'p1', shot){
    if(shot) {
        shot.game = parseInt(DATA.current);
        shot.date = new Date();
        Storage.NewShot(shot);

        if(Settings.overshootSkip && DATA.score[player].temp+shot.sx > Settings.toFinish-2){
            goZero();
            function goZero(){
                if(shot.shotn < 3){
                    shot.date++;
                    shot.shotn++;
                    shot.sector = 0;
                    shot.x = 1;
                    shot.sx = 0;
                    Storage.NewShot(shot);
                    goZero();
                }
            }
        }
    }
    calculate(function(){
        // console.log(`looks like calculated`);
    });
}
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
function clearData(){
    View('p1shots').innerHTML = View('p2shots').innerHTML = View('p1score').innerHTML = View('p2score').innerHTML = '';
    shotsByPlayer.playerOne.all = [];
    shotsByPlayer.playerTwo.all = [];
    shotsByPlayer.playerOne.score = 0;
    shotsByPlayer.playerTwo.score = 0;
    shotsByPlayer.playerOne.session = 0;
    shotsByPlayer.playerTwo.session = 0;
}

function calculate(callback){
    clearData();
    let shots = Storage.shots;

    if(shots.length>0){
        let playerOne = Storage.games[Storage.games.length-1].p1;
        function shotCheck(player, shot){
            shot.status = true;
            switch (shot.shotn){
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
            View(player === 'playerOne' ? 'p1temp' : 'p2temp').innerHTML = Settings.toFinish - shotsByPlayer[player].session - shotsByPlayer[player].score;
            if(Settings.toFinish - shotsByPlayer[player].score - shotsByPlayer[player].session === 0){
                function isItWon(shot){
                    if(Settings.x3and25 === 1) {
                        return shot.x > 1 || shot.sector === 25 || shot.sector === 50;
                    } else {
                        return shot.x === 2 || shot.sector === 50;
                    }
                }
                if(isItWon(shot)){
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
            if(shot.shotn === 3) {
                shotsByPlayer[player].score = shotsByPlayer[player].score + shotsByPlayer[player].session;
            }
            shotsByPlayer[player].all.push(shot);
        }

        shots.forEach((shot, index) => {
            shot.shotn = (index+1)%3 === 0 ? 3 : (index+1)%3;
            let currentPlayer = shot.player === playerOne ? 'playerOne' : 'playerTwo';
            shotCheck(currentPlayer, shot);
        });
        console.log(shotsByPlayer);
    }

    let second = 'p2'
    if (DATA.first === 'p2') second = 'p1'

    // let diffMod = DATA.shots.total % 6;
    let diffMod = shots.length % 6;
    // console.log(`%c${diffMod}`, `font-size: 60px`);
    switch (true) {
        case diffMod < 3:
            if(diffMod === 0) {
                Game.next = DATA.first;
            }
            Game.setActivePlayer(DATA.first);
            break;
        case diffMod >= 3:
            if(diffMod === 3) {
                Game.next = second;
            }
            Game.setActivePlayer(second);
            break;
    }

    View('p1sX').innerHTML = View('p2sX').innerHTML = ''
    let sc = {
        p1: Settings.toFinish - shotsByPlayer.playerOne.score,
        p2: Settings.toFinish - shotsByPlayer.playerTwo.score,
    };

    function getPoints(player = 'playerOne') {
        View(player === 'playerOne' ? 'p1shots' : 'p2shots').innerHTML = '';
        shotsByPlayer[player  === 'playerOne' ? 'playerOne' : 'playerTwo'].all.forEach(item => {
            let div = document.createElement('div');
            div.className = !item.status ? 'bad' : '';
            div.innerHTML = `${item.sector}${item.x > 1 ? 'x' + item.x : ''}`;

            View(player === 'playerOne' ? 'p1shots' : 'p2shots').append(div);
        })
    }
    getPoints();
    getPoints('playerTwo');

    function getX(e) {
        if (e === sc.p1) {
            if (e - Math.trunc(e / 2) * 2 === 0 && Math.trunc(e / 2) <= 20) View('p1sX').innerHTML = `${e / 2}X2`;
            if (Settings.x3and25) {
                if (e - Math.trunc(e / 3) * 3 === 0) View('p1sX').innerHTML += ` ${e / 3}X3`;
                if (e === 50 || e === 25) View('p1sX').innerHTML += ` ${e}`;
            }
            if (e === 50) View('p1sX').innerHTML += ` ${e}`;
        }
        if (e === sc.p2) {
            if (e - Math.trunc(e / 2) * 2 === 0 && Math.trunc(e / 2) <= 20) View('p2sX').innerHTML = `${e / 2}X2`;
            if (Settings.x3and25) {
                if (e - Math.trunc(e / 3) * 3 === 0) View('p2sX').innerHTML += ` ${e / 3}X3`;
                if (e === 50 || e === 25) View('p2sX').innerHTML += ` ${e}`;
            }
            if (e === 50) View('p2sX').innerHTML += ` ${e}`;
        }
    }
    console.log(Settings.x3and25)
    board[Settings.x3and25].find(getX);

    View('p1score').innerHTML = `${sc.p1} <span>+${shotsByPlayer.playerOne.score}</span>`;
    View('p2score').innerHTML = `${sc.p2} <span>+${shotsByPlayer.playerTwo.score}</span>`;
    View('p1progress').style.width = `${shotsByPlayer.playerOne.score * 100 / Settings.toFinish}%`;
    View('p2progress').style.width = `${shotsByPlayer.playerTwo.score * 100 / Settings.toFinish}%`;

    View('last3').innerHTML = '';
    for(let i=shots.length - 1; i>=shots.length-6; i--){
        let val = shots[i];
        let div = document.createElement('div');
        div.className = 'shot';
        let player =  document.createElement('div');
        let shot =  document.createElement('div');
        player.className = 'player';
        player.innerHTML = val.player ?? '';
        shot.className = 'value';
        shot.innerHTML = val.x !== undefined ? `${val.sector}${val.x !== 1 ? 'x'+val.x : ''}` : '';
        div.append(player, shot);
        View('last3').append(div);
    }

    callback('done');
}

