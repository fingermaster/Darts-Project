let vx, player, modal, players, game, DB;
let shots = [];


let HTMLtoFinish = document.getElementById('toFinish');
let HTMLx3and25 = document.getElementById('x3and25');
let HTMLovershootSkip = document.getElementById('overshootSkip');

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
		}
	},
	toFinishValue: -1,
	x3and25Value: -1,
	overshootSkipValue: -1,
};

const VxBoard = document.getElementById('vxBoard');

const boardNums = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const board = {
	0:	[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,50],
	1:	[2,3,4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28,30,32,33,34,36,38,39,40,42,45,48,50,51,54,57,60]
};

const DATA = {
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
	first: '',
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
		if(shot !== undefined) {
			shots.splice(0, 0, shot);
		}
	},
	last: () => { return Array.from({length: 6}).map((_, index) => {
		return shots[index]??{};
	})},
	show: () => { return shots; },
	clear: () => { shots = []; }
}

gameFx = function (db){
	deck();

	// let lastGame =  function(){
	// 	MaxID("games", function(maxID){
	// 		let tx = db.transaction("games", "readwrite");
	// 		let games = tx.objectStore("games");
	//
	// 		let r = games.get(maxID);
	// 		r.onsuccess = function(){
	// 			console.log(r.result);
	// 		};
	// 	});
	// };
	let number = 1;
	let multiplier = 1;
	window.onload = function(){
		window.document.onkeydown = function(event){
			//event.preventDefault();

			console.log(KeyboardEvent)
			switch (event.keyCode){
				// case 13: {};
				case 13 || 32: {
					console.log(`Sector: ${number} X: ${multiplier}`);
					goData(game.next, {
						player: DATA[game.next],
						sector: number,
						x:		multiplier,
						sx: 	number*multiplier,
						shotn: 	DATA.shots[game.next]%3+1,
						yn: false,
						calc: true
					});
					multiplier = 1;
					break;}
				case 219:{ showRandDeck(); break; } 		//[ - Random Deck
				case 221:{ showRand20(); break; }			//] - Random 20
				case 8:{if(event.shiftKey) game.cancelLastHit(); break; }		//Backspace - cancel last hit

				case 17: { number = 0; multiplier = 1; break;} 	//Control Key set value as Zero
				case 189:{ number = 25; multiplier = 1; break;} 	//minus - 25
				case 187:{ number = 50; multiplier = 1; break;} 	//Equal - 50

				case 81:{ if(number > 0 && number<21) multiplier = 1; break; }
				case 87:{ if(number > 0 && number<21) multiplier = 2; break; }
				case 69:{ if(number > 0 && number<21) multiplier = 3; break; }

				case 48:{ number = 10; 	if(event.shiftKey) number = number+10; break;}
				case 49:{ number = 1; 	if(event.shiftKey) number = number+10; break;}
				case 50:{ number = 2; 	if(event.shiftKey) number = number+10; break;}
				case 51:{ number = 3; 	if(event.shiftKey) number = number+10; break;}
				case 52:{ number = 4; 	if(event.shiftKey) number = number+10; break;}
				case 53:{ number = 5; 	if(event.shiftKey) number = number+10; break;}
				case 54:{ number = 6; 	if(event.shiftKey) number = number+10; break;}
				case 55:{ number = 7; 	if(event.shiftKey) number = number+10; break;}
				case 56:{ number = 8; 	if(event.shiftKey) number = number+10; break;}
				case 57:{ number = 9; 	if(event.shiftKey) number = number+10; break;}

				case 37:{ game.first = 'p1'; break;}	//Left arrow - First player be first
				case 39:{ game.first = 'p2'; break;}	//Right arrow - Second player be first
				/**
				* 	ToDo: HotKeys
				*  	Create array with hold keys.
				* 		Add key wen keydown
				* 		When keyup check show all -> do code if needed -> delete
				**/

				case 96:	{ 	number = 10; 	if(event.shiftKey) number = number+10; break;}
				case 97:  	{ 	number = 1;  	if(event.shiftKey) number = number+10; break;}
				case 98:  	{	number = 2;  	if(event.shiftKey) number = number+10; break;}
				case 99:  	{ 	number = 3;  	if(event.shiftKey) number = number+10; break;}
				case 100: 	{ 	number = 4;  	if(event.shiftKey) number = number+10; break;}
				case 101: 	{ 	number = 5;  	if(event.shiftKey) number = number+10; break;}
				case 102: 	{ 	number = 6;  	if(event.shiftKey) number = number+10; break;}
				case 103: 	{ 	number = 7;  	if(event.shiftKey) number = number+10; break;}
				case 104: 	{ 	number = 8;  	if(event.shiftKey) number = number+10; break;}
				case 105: 	{ 	number = 9;  	if(event.shiftKey) number = number+10; break;}
				default: { }

			}
		}
		window.document.onkeyup = function (event){
			document.getElementById('selectedValueInfo')
				.classList.add('show');
			document.getElementById('selectedValueInfo')
				.innerHTML = `${number}X${multiplier}`;
		}

		player.list();

		DB.CheckGameID(function(game){
			console.log(game)
			if(game.p1){
				DATA.first = game.first;
				setGameDataNames(game);
				calculate(function(){
				});
			} else {
				modal.toggle();
				// document.getElementById('namesbtn').click();
			}
			InfoBar();
		});

	}



	document.onclick = function(e){
		if(e.target.tagName !== 'BUTTON' && modal.state === true && !modal.isOnModal(e.x, e.y)){
			modal.hide();
		}
		if(e.target.id === 'start'){
			DB.NewPlayer([p1input.value,p2input.value],function(){
				DATA.p1 = p1input.value ;
				DATA.p2 = p2input.value;
				let inputSettings = new FormData(document.forms.InputSettings);
				DATA.first = inputSettings.get('whostarts');
				setGameDataNames();
				game.new();
				modal.toggle();
			});
		}
		if(e.target.dataset.point){
			// console.log(`Shot from ${game.next}`);
			goData(game.next, {
				player: DATA[game.next],
				sector: parseInt(e.target.dataset.point),
				x:parseInt(e.target.dataset.x),
				sx: parseInt(e.target.dataset.point)*parseInt(e.target.dataset.x),
				shotn: DATA.shots[game.next]%3+1,
				yn: false,
				calc: true
			});
		}
	};

	modal = {
		show: function () {
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


	game = {
		get next(){
			DB.GetNext();
			return DATA.next;
		},
		set next(p){
			DB.SetNext(p);
			vx.playerActive(p);
			this.turn = 0;
		},
		set first(p){
			DB.SetNext(p);
			DB.SetFirst(p);
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
			console.info(`game.turn = %o, game.next = %o`, game.turn, game.next);
			shotDBDeleteLastHeat(function(isDeleted){
				if(isDeleted){
					let who = game.next;
					if(game.turn !== 0){
						game.turn = game.turn - 1;
					} else {
						if(who === 'p1') who = 'p2';
						else who = 'p1';
						game.next = who;
						game.turn = 2;
					}
					calculate(function(){
						// console.log('we are calculate');
					});
				} else {
					console.warn(`Sorry, bro`);
				}
			})

		},
		clearX: function(){
			document.getElementById('p1sX').innerHTML = document.getElementById('p2sX').innerHTML = '';
		},
		new: function(){
			game.clearX();
			DB.NewGame();
			game.turn = 0;
			DATA.shots = {p1:0,p2:0,total:0,turn:0};
			p1shots.innerHTML = p2shots.innerHTML = '';
			p1score.innerHTML = Settings.toFinish;
			p2score.innerHTML = Settings.toFinish;
			document.getElementById("fireworks").style.display = 'none';
		},
		// endGame: function(p, winnerlasthit){
		end: function(p){
			DB.EndGame();
			document.getElementById("fireworks").style.display = 'flex';
			document.getElementById("fireworksname").innerHTML = `${DATA[p]} WON!`;
		},

	};

	player = {
		list: function(args = false){
			playersSelect.innerHTML = '';
			p1input.value = DATA.p1;
			p2input.value = DATA.p2;
			DB.PlayersList(function(p){
				playersSelect.innerHTML = '';
				p.forEach(function(el){
					playersSelect.innerHTML += `<option value='${el.name}' class="selectplayer" data-player-name="${el.name}">${el.name}</option>\n`;
				});
			});
		}
	};

	function goData(player = 'p1', shot){
		if(shot) {
			shot.game = parseInt(DATA.current);
			shot.date = new Date();
			shotDBWrite(shot);

			if(Settings.overshootSkip && DATA.score[player].temp+shot.sx > Settings.toFinish-2){
				goZero();
				function goZero(){
					if(shot.shotn < 3){
						shot.date++;
						shot.shotn++;
						shot.sector = 0;
						shot.x = 1;
						shot.sx = 0;
						shotDBWrite(shot);
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
		let gameID = DATA.current;
		let request = db.transaction("shots", "readwrite").objectStore("shots").index("game");
		let singleKeyRange = IDBKeyRange.only(gameID);
		let p1name = DATA.p1;

		DATA.score = {p1: {score: 0, temp: 0}, p2: {score: 0, temp: 0}};

		DATA.shots.p1 = 0;
		DATA.shots.p2 = 0;
		DATA.shots.total = 0;

		Shots.clear();

		request.openCursor(singleKeyRange).onsuccess = function(e) {
			let cursor = e.target.result;
			Shots.add(cursor?.value);
			// console.log(Shots.show());
			// console.log(Shots.last());
			// let nowScore;
			if (cursor) {
				let value = cursor.value;
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
				cursor.continue();
			} else {
				let second = 'p2'
				if (DATA.first === 'p2') second = 'p1'

				let diffMod = DATA.shots.total % 6;
				switch (true) {
					case diffMod < 3:
						game.next = DATA.first;
						break;
					case diffMod >= 3:
						game.next = second;
						break;
				}


				if (diffMod === 6) vx.playerActive(DATA.first);
				if (diffMod === 3) vx.playerActive(second);

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
				board[Settings.x3and25].find(getX);

				if (DATA.score.p1.score === Settings.toFinish || DATA.score.p2.score === Settings.toFinish) {
					game.end(DATA.lastShot.p);
				}

				p1score.innerHTML = `${Settings.toFinish - DATA.score.p1.temp} <span>${Settings.toFinish - DATA.score.p1.score}</span>`;
				p2score.innerHTML = `${Settings.toFinish - DATA.score.p2.temp} <span>${Settings.toFinish - DATA.score.p2.score}</span>`;
				document.getElementById("p1progress").style.width = `${DATA.score.p1.temp * 100 / Settings.toFinish}%`;
				document.getElementById("p2progress").style.width = `${DATA.score.p2.temp * 100 / Settings.toFinish}%`;

				document.getElementById('service').innerHTML = syntaxHighlight(Shots.last());
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
		};
	}

	function shotDBWrite(shot){
		let tx = db.transaction("shots", "readwrite");
		let shots = tx.objectStore("shots");
		let rq = shots.add(shot);
		rq.onsuccess = function() {
			// console.info(`%c ${init++}.\t `, ConsoleCSS);
			gameConsole(`Shot #${rq.result} writed`);
			// console.log(shot);
			DB.SetGameBegin();
		};
		rq.onerror = function() {
			console.error("Shot %o writing error", rq.error);
		};
	}
	function shotDBMaxID(callback){
		let tx = db.transaction("shots", "readwrite");
		let shots = tx.objectStore("shots");
		//let rq = shots.getAll(shot);
		let rq = shots.openCursor();
		let maxID = {};
		rq.onsuccess = function() {
			let cursor = rq.result;
			if (cursor) {
				// let key = cursor.key;
				// let value = cursor.value;
				maxID =  cursor.value;
				cursor.continue();
			} else {
				callback(maxID);
			}
		};
	}
	function shotDBDeleteLastHeat(callback){
		shotDBMaxID(function(lastShot){
			let tx = db.transaction("shots", "readwrite");
			let shots = tx.objectStore("shots");

			if(parseInt(lastShot.game) === parseInt(DATA.current)) {
				let rq = shots.delete(parseInt(lastShot.id));

				rq.onsuccess = function() {
					console.log(`Shot ID%o successfully canceling. Game %o DB Game`, parseInt(lastShot.id), parseInt(DATA.current),parseInt(lastShot.game));
					callback(true);
				};
				rq.onerror = function() {
					console.trace("IndexedDB Error canceling last shot %o", rq.error);
					callback(false);
				};
			} else {
				console.warn(`No more shots in this game`);
				callback(false);
			}

		});
	}
	function MaxID(table, callback){
		let tx = db.transaction(table, "readwrite");
		let tbl = tx.objectStore(table);
		let rq = tbl.openCursor();
		let maxID = 0;
		let value = {};
		rq.onsuccess = function() {
			let cursor = rq.result;
			if (cursor) {
				let key = cursor.key;
				value = cursor.value;
				maxID = key;
				cursor.continue();
			} else {
				callback(maxID,value);
			}
		};
	}

	DB = {
		CheckGameID: function(callback){
			MaxID("games", function(maxID,game){
				if(maxID>0){
					DATA.current = maxID;
					DATA.gameObj = game;
					console.log(game);
					if(Object.keys(game).includes('toFinish')){
						Settings.toFinish = game.toFinish;
						Settings.overshootSkip = game.overshootSkip;
						Settings.x3and25 = game.x3and25;
					} else {
						Settings.toFinish = 501;
						Settings.overshootSkip = 0;
						Settings.x3and25 = 1;
					}
					if(game.begin){
						DATA.beginned = true;
						DATA.beginTime = game.begin;
					}
					if(game.end){
						DATA.endTime = game.end;
					}
					// console.info(`%c ${init++}. Game ID ${maxID} OK`, ConsoleCSS);
					gameConsole(`Game ID ${maxID} OK`);
					callback(game);
				} else {
					console.trace(`Game ID is not defined`);
					callback(undefined);
				}
			});
		},
		SetGameBegin: function(){
			if(!DATA.beginned){
				let request = db.transaction("shots", "readwrite").objectStore("shots").index("game");
				let singleKeyRange = IDBKeyRange.only(DATA.current);
				let gameShotsCounter = 0;
				let firstShotDate;

				request.openCursor(singleKeyRange).onsuccess = function(e) {
					let cursor = e.target.result;
					if (cursor) {
						//console.log(cursor);
						if(gameShotsCounter === 0) firstShotDate = cursor.value.date;
						gameShotsCounter++;
						cursor.continue();
					} else {
/*							console.info(`
						First Shot Date: %o
						Total Shots in Game: %o`, dateFormat(firstShotDate), gameShotsCounter);*/
						if(gameShotsCounter === 1) {
							MaxID("games", function(maxID,game){
								let tx = db.transaction("games", "readwrite");
								let games = tx.objectStore("games");
								game.begin = firstShotDate;
								let rq = games.put(game);
								rq.onsuccess = function() {
									DATA.beginned = true;
									// console.info(`%c ${init++}.\t Game ${maxID} begin time ${dateFormat(firstShotDate)} `, ConsoleCSS);
									gameConsole(`Game ${maxID} begin time ${dateFormat(firstShotDate)}`);
								};
								rq.onerror = function() {
									console.error("Error setting begin time", rq.error);
								};
							});
						}
					}
				};
			}
		},
		SetGameEnd: function(gameID = DATA.current){
			let request = db.transaction("shots", "readwrite").objectStore("shots").index("game");
			let singleKeyRange = IDBKeyRange.only(gameID);
			let gameShotsCounter = 0;
			let endShotDate;

			request.openCursor(singleKeyRange).onsuccess = function(e) {
				let cursor = e.target.result;
				if (cursor) {
					endShotDate = cursor.value.date;
					gameShotsCounter++;
					cursor.continue();
				} else {
					// console.info(`
					// Last Shot Date: %o
					// Total Shots in Game: %o`, dateFormat(endShotDate), gameShotsCounter);
					if(gameShotsCounter > 0) {
						MaxID("games", function(maxID,game){
							let tx = db.transaction("games", "readwrite");
							let games = tx.objectStore("games");
							game.end = endShotDate;
							let rq = games.put(game);
							rq.onsuccess = function() {
								// console.info(`%c ${init++}.\t Game ${maxID} ending time ${dateFormat(endShotDate)} `, ConsoleCSS);
								gameConsole(`Game ${maxID} ending time ${dateFormat(endShotDate)}`);
							};
							rq.onerror = function() {
								console.error("Error setting ending time", rq.error);
							};
						});
					}
				}
			};
		},
		GetNext: function(){
			MaxID("games", function(maxID,g){
				DATA.next = g.next;
			});
		},
		SetNext: function(next){
			// console.log(next);
			MaxID("games", function(maxID,game){
				let tx = db.transaction("games", "readwrite");
				let games = tx.objectStore("games");
				DATA.next = next;
				game.next = next;
				let rq = games.put(game);
				rq.onsuccess = function(){
					// console.info(`%c ${init++}.\t Game ${maxID} next player ${next} `, ConsoleCSS);
					gameConsole(`Game ${maxID} next player ${next}`);
				};
				rq.onerror = function() {
					console.error("Error setting ending time", rq.error);
				};
			});
		},
		SetFirst: function(next){
			console.log(next);
			MaxID("games", function(maxID,game){
				let tx = db.transaction("games", "readwrite");
				let games = tx.objectStore("games");
				DATA.first = next;
				DATA.next = next;
				game.next = next;
				game.first = next;
				let rq = games.put(game);
				rq.onsuccess = function(){
					// console.info(`%c ${init++}.\t Game ${maxID} next player ${next} `, ConsoleCSS);
					gameConsole(`Game ${maxID} next player ${next}`);
				};
				rq.onerror = function() {
					console.error("Error setting ending time", rq.error);
				};
			});
		},
		SetSettings: function(){
			MaxID("games", function(maxID,game){
				let tx = db.transaction("games", "readwrite");
				let games = tx.objectStore("games");
				game.x3and25 = Settings.x3and25;
				game.overshootSkip = Settings.overshootSkip;
				game.toFinish = Settings.toFinish;
				let rq = games.put(game);
				rq.onsuccess = function(){
					// console.info(`%c ${init++}.\t Game ${maxID} next player ${next} `, ConsoleCSS);
					gameConsole(`Game ${maxID} to finish: ${Settings.toFinish} finish mode: ${Settings.x3and25} overshot: ${Settings.overshootSkip}`);
				};
				rq.onerror = function() {
					console.error("Error setting ending time", rq.error);
				};
			});
		},
		// SetHits: function(data, callback){
		// 	let tx = db.transaction("service", "readwrite");
		// 	let service = tx.objectStore("service");
		// 	let newData = {
		// 		game: GameData.current,
		// 		first: GameData.first,
		// 		p1shots: data.p1,
		// 		p2shots: data.p2,
		// 	};
		//
		// 	let rq = service.put(newData);
		// 	rq.onsuccess = function(){
		// 		// console.info(`%c ${init++}.\t ${data.total} Hits: ${GameData.p1} - ${data.p1} ${GameData.p2} - ${data.p2} `, ConsoleCSS);
		// 		gameConsole(`${data.total} Hits: ${GameData.p1} - ${data.p1} ${GameData.p2} - ${data.p2}`);
		// 		// console.log(newData);
		// 		callback(newData);
		// 	};
		// 	rq.onerror = function() {
		// 		console.error("Error setting ending time", rq.error);
		// 	};
		// },
		// Hit: function(data, callback){
			// let request = db.transaction("service", "readwrite").objectStore("service").index("game");
			// let singleKeyRange = IDBKeyRange.only(GameData.current);

			// request.openCursor(singleKeyRange).onsuccess = function(e) {
				// let cursor = e.target.result;
				// if (cursor) {
					// console.log(cursor);
				// }
				// else{
					// console.log(`End Serv`);
				// }
			// }
		// },
		// Hit: function(id){
		// 	let r = db.transaction("service", "readwrite").objectStore("service").get(GameData.current);
		// 	r.onsuccess = function(){
		// 		console.log(r.result);
		// 	};
		// },
		NewGame: function(callback = function(e){console.log(e)}){
			let tx = db.transaction("games", "readwrite");
			let games = tx.objectStore("games");
			let gData = {
				begin:	'',
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
			let rq = games.add(gData);
			rq.onsuccess = function() {
				// console.info(`%c ${init++}.\t New game successfully started ${rq.result} `, ConsoleCSS);
				gameConsole(`New game successfully started ${rq.result}`);
				DATA.current = rq.result;
				DATA.beginned = false;
				callback();
			};
			rq.onerror = function() {
				console.error("Creating game %o failed", rq.error);
			};
		},
		EndGame: function(){
			MaxID("games", function(maxID,game){
				let tx = db.transaction("games", "readwrite");
				let games = tx.objectStore("games");
				let rq = games.put(game);
				rq.onsuccess = function() {
					// console.info(`%c ${init++}.\t Game Over ${rq.result} `, ConsoleCSS);
					gameConsole(`Game Over ${rq.result}`);
				};
				rq.onerror = function() {
					console.error("Ending game %o failed", rq.error);
				};
			});
			DB.SetGameEnd();
		},
		PlayersList: function(plistFx = function(e){console.log(e)}){
			let tx = db.transaction("players", "readwrite");
			let plrs = tx.objectStore("players");

			let res = plrs.getAll();
			res.onsuccess = function(){
				//console.log(res.result);
				players = res.result;
				plistFx(res.result);
				//return;
			}
			res.onerror = function() {
				console.log(`pardon moi mesie Developer - %o`, rq.error);
			};

		},
		/*NewPlayer: function(data){
			let tx = db.transaction("players", "readwrite");
			let plrs = tx.objectStore("players");
			let rq = plrs.put({name: data});
			rq.onsuccess = function() {
				console.info(`%c ${init++}.\t Player ${np} added `, ConsoleCSS);
			};
			rq.onerror = function() {
				console.log("New player creating error", rq.error);
			};
		},*/
		NewPlayer: function(datas, callback = function(e){console.log(e)}) {
			const tx = db.transaction(["players"], "readwrite");

			datas.forEach(function(el){
				// let request =
					tx.objectStore("players").put({name: el});
			})

			tx.oncomplete = function(event) {
				callback(event);
			}
		},
	};
}

