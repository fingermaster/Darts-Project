var vx, player, players, game, tempID, DB;

const boardNums = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const board = {
	0:	[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,50],
	1:	[2,3,4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28,30,32,33,34,36,38,39,40,42,45,48,50,51,54,57,60]
};

const GameData = {
	p1:'',
	p2:'',
	current: 0,
	set beginned(bool){
		if(bool==true){
			turnPan.classList.add('ghost');
		} else { 
			turnPan.classList.remove('ghost');
		}
		beginStatus = bool;
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

if(inScope('darts')){
	players = Array();	
	
	function showRandDeck(){
		randInput.innerHTML = randDeck();
	}
	function showRand20(){
		randInput20.innerHTML = rand20();
	}

	function setGameDataNames(data = {}){
		if(data.p1){
			GameData.p1 = data.p1;
			GameData.p2 = data.p2;
		}
		p1.innerHTML = GameData.p1;
		p2.innerHTML = GameData.p2;
	}

	function gamefx(db){
		function createCopyUse(id, css, rotate, data=[]){
			let elCopy = document.createElementNS("http://www.w3.org/2000/svg", 'use');
			elCopy.setAttribute('class', css);
			elCopy.setAttribute('href', `#${id}`);
			elCopy.setAttribute('transform', `rotate(${rotate})`);
			if(data[0] >= 0) elCopy.dataset.point = data[0];
			if(data[1]) elCopy.dataset.x = data[1];
			vxBoard.append(elCopy);
		}
		function createText(txt, angle, radius, scale=1, fill="#FFF"){
			let tagTxt = document.createElementNS("http://www.w3.org/2000/svg", 'text');
			tagTxt.setAttribute('fill', fill);
			tagTxt.setAttribute('y', "0.7ex");
			tagTxt.setAttribute('transform', `translate(${coordOnCircle(radius, angle)}) scale(${scale})`);
			tagTxt.innerHTML = txt;			
			vxBoard.append(tagTxt);
		}		
		function coordOnCircle(radius, angle){			
			return `${Math.round(radius*Math.cos(angle*Math.PI/180))}, ${Math.round(radius*Math.sin(angle*Math.PI/180))}`;
		}


		var lastGame =  function(){
			MaxID("games", function(maxID){
				let tx = db.transaction("games", "readwrite"); 
				let games = tx.objectStore("games");				

				let r = games.get(maxID);
				r.onsuccess = function(){
					console.log(r.result);
				};
			});
		};
		
		window.onload = function(){
			let circleParts = 24;
			for(let i=0; i<circleParts; i++){
				createCopyUse('milk', '', (10+i*360/circleParts), [0,1]);
			}		
			createCopyUse('milkarea', 'alpha', 0, [0,1]);
			for(el in boardNums){				
				let angle = (360/boardNums.length)*el-90;				
				createCopyUse('x1', isEven(el)?'white-sector':'black-sector', angle);
				createCopyUse('x2', isEven(el)?'green-sector':'red-sector', angle);
				createCopyUse('x3', isEven(el)?'green-sector':'red-sector', angle);				
			}
			for(el in boardNums){
				let angle = (360/boardNums.length)*el-90;
				createText(boardNums[el], angle, 115, 1, isEven(el)?'#FFF':'#000');				
			}
			circleParts = 20;
			for(let i=0; i<circleParts; i++){
				createCopyUse('x2text', '', (5+i*360/circleParts), [1,2]);
				createCopyUse('x3text', '', (2+i*360/circleParts), [1,2]);
			}			
			
			for(el in boardNums){				
				let angle = (360/boardNums.length)*el-90;				
				createCopyUse('x1', 'alpha', angle+90, [boardNums[el],1]);
				createCopyUse('x2', 'alpha', angle+90, [boardNums[el],2]);
				createCopyUse('x3', 'alpha', angle+90, [boardNums[el],3]);
			}		
			
			createCopyUse('points25', 'green-sector', 30, [25,1]);
			createCopyUse('bulleye', 'red-sector', 10, [50,1]);
			
			circleParts = 6;
			for(let i=0; i<circleParts; i++){
				createCopyUse('twentyfive', '', (15+i*360/circleParts), [25,1]);				
			}						
			createCopyUse('points25', 'alpha', 30, [25,1]);
			createCopyUse('bulleye', 'alpha', 10, [50,1]);
			
			// textcircle
			player.list();
			
			/*setTimeout(spinLights,100);
			var loops = 5;
			
			function spinLights(interval = 20){
				let i = 0;
				let source = document.getElementsByClassName('alpha');
				
				
				function loop() {       
					setTimeout(function() {						
						let sec = source[i];
						if(source[i].dataset.x == 1){
							sec.classList.add('christ');
						}						
						setTimeout(function(){
							sec.classList.remove('christ')},4400);
						i++;                    
						if (i < source.length-2) loop(); 
						else if(loops!=0) {
							loops--;
							setTimeout(spinLights,source.length*interval-4400);
						}
					}, interval)
				}				
				loop();
			}*/
			
			

			
			DB.CheckGameID(function(game){				
				if(game.p1){
					GameData.first = game.first;
					setGameDataNames(game);
					calculate(function(){						
					});				
				}else{				
					document.getElementById('namesbtn').click();
				}				
			});			
		}
		
		document.onclick = function(e){
			/*console.log(e.target);*/
			if(e.target.id == 'start'){				
				DB.NewPlayer([p1input.value,p2input.value],function(){					
					GameData.p1 = p1input.value;
					GameData.p2 = p2input.value;
					var inputSettings = new FormData(document.forms.InputSettings);
					GameData.first = inputSettings.get('whostarts');
					setGameDataNames();
					game.newGame();
				});				
			}
			if(e.target.dataset.point){
				// console.log(`Shot from ${game.next}`);
				goData(game.next, {
					player: GameData[game.next],
					sector: parseInt(e.target.dataset.point),
					x:parseInt(e.target.dataset.x),
					sx: parseInt(e.target.dataset.point)*parseInt(e.target.dataset.x),
					shotn: GameData.shots[game.next]%3+1,
					yn: false,
					calc: true
				});
			}
		};

		vx = {
			playerActive: function(p){
				if(p == 'p1') {
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
				return GameData.next;
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
				return GameData.shots.turn;
			},
			set turn(shot){
				GameData.shots.turn = shot;
			},
			cancelLastHit: function(){
				document.getElementById("fireworks").style.display = 'none';
				console.info(`game.turn = %o, game.next = %o`, game.turn, game.next);
				shotDBDeleteLastHeat(function(isDeleted){
					if(isDeleted){
						let who = game.next;
						if(game.turn != 0){
							game.turn = game.turn - 1;
						} else {
							if(who == 'p1') who = 'p2';
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
			newGame: function(){
				game.clearX();
				DB.NewGame();
				game.turn = 0;				
				GameData.shots = {p1:0,p2:0,total:0,turn:0};
				p1shots.innerHTML = p2shots.innerHTML = '';
				p1score.innerHTML = settings.toFinish;
				p2score.innerHTML = settings.toFinish;
				document.getElementById("fireworks").style.display = 'none';
			},
			endGame: function(p, winnerlasthit){
				DB.EndGame();
				document.getElementById("fireworks").style.display = 'flex';
				document.getElementById("fireworksname").innerHTML = `${GameData[p]} WON!`;		
			},

		};


		player = {
			list: function(args = false){
				playersSelect.innerHTML = '';
				p1input.value = GameData.p1;
				p2input.value = GameData.p2;
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
				shot.game = parseInt(GameData.current);
				shot.date = new Date();				
				shotDBWrite(shot);
				
				if(settings.overshootSkip && GameData.score[player].temp+shot.sx > settings.toFinish-2){										
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
			let gameID = GameData.current;
			let request = db.transaction("shots", "readwrite").objectStore("shots").index("game");
			let singleKeyRange = IDBKeyRange.only(gameID);
			let p1name = GameData.p1;

			GameData.score = {p1: {score: 0, temp: 0}, p2: {score: 0, temp: 0}};
			
			GameData.shots.p1 = 0;
			GameData.shots.p2 = 0;
			GameData.shots.total = 0;
			
			let last3array = [];
			
			request.openCursor(singleKeyRange).onsuccess = function(e) {
				let lastThrow = {};
				let cursor = e.target.result;
				if (cursor) {					
					let key = cursor.key;
					let value = cursor.value;
					
					lastThrow = cursor;
					//console.log(value);
					//if(p1name === undefined) p1name = value.player;
					let gamer;
					let correct = nowScore = false;					
					
					if(p1name == value.player)	gamer = 'p1';  
					else gamer = 'p2';
					
					GameData.shots.total++;
					GameData.shots[gamer]++;
					
					if(value.shotn == 1) GameData.score[gamer].temp = GameData.score[gamer].score;
					if((isCorrect(value.sector, value.x, settings.toFinish-GameData.score[gamer].temp) && value.shotn == 3)||
					(isCorrect(value.sector, value.x, settings.toFinish-GameData.score[gamer].temp) && GameData.score[gamer].temp+value.sx == settings.toFinish)){
						correct = true;
						GameData.score[gamer].score = GameData.score[gamer].temp+value.sx;
						nowScore = true;
					}	
					if(isCorrect(value.sector, value.x, settings.toFinish-GameData.score[gamer].temp)){
						correct = true;
						GameData.score[gamer].temp = GameData.score[gamer].temp+value.sx;
					} else {
						if(GameData.score[gamer].temp + value.sx > settings.toFinish-GameData.score[gamer].temp) GameData.score[gamer].temp = GameData.score[gamer].score; 
					}
					if(value.shotn == 3) GameData.score[gamer].score = GameData.score[gamer].temp;
					let outputMultiplier = '';
					if(value.x>1) outputMultiplier = `x${value.x}`;
					
					document.getElementById(`${(p1name == value.player)?'p1':'p2'}shots`).innerHTML += 
					`<div class="shot ${(!correct)?'bad':''}">${(value.sector!=0)? value.sector+outputMultiplier:'0'}</div>`;
					document.getElementById(`${(p1name == value.player)?'p1':'p2'}shots`).innerHTML += `${(value.shotn == 3)?'<div class="scorecol">' + GameData.score[gamer].score + '</div>' :''}`;					
					
					if(p1name == value.player) {GameData.lastShot.p = 'p1'}  else {GameData.lastShot.p = 'p2'};
					GameData.lastShot.sector = value.sector;
					GameData.lastShot.x = value.x;
					last3array.push(`<span class="${(p1name == value.player)?'p1':'p2'}">${(value.sector!=0)? value.sector+outputMultiplier:'0'}</span>`);
					cursor.continue();
				} else {
					/*
					if(GameData.shots.total > 0 && isThird(GameData.shots.total)){
						console.log(`TOTAL: ${GameData.shots.total} ${GameData.lastShot.p} change`);
					}*/
					last3.innerHTML = '';
					if(last3array.length < 4){last3.style.display='none'}
					else{last3.style.display='flex'}
					for(let i=last3array.length-1;i>last3array.length-5;i--){
						last3.innerHTML += `<span>${last3array[i]}</span>`;
					}
					
					let second = 'p2'
					if(GameData.first == 'p2') second = 'p1'

					let diffMod = GameData.shots.total%6;
					switch(true){
						case diffMod < 3: 
							game.next = GameData.first;		
							// console.log(GameData.first);
							break;
						case diffMod >= 3: 
							
							// console.log(second);
							game.next = second;
							break;
					}
					
					
					if(diffMod == 6) vx.playerActive(GameData.first);
					if(diffMod == 3) vx.playerActive(second);
		
					document.getElementById('p1sX').innerHTML = document.getElementById('p2sX').innerHTML = '';
					let sc = {p1: settings.toFinish-GameData.score.p1.temp,p2: settings.toFinish-GameData.score.p2.temp};
					
					function getX(e){						
						if(e == sc.p1){
							if(e - Math.trunc(e/2)*2 === 0 && Math.trunc(e/2) <= 20) p1sX.innerHTML = `${e/2}X2`;
							if(settings.x3and25){
								if(e - Math.trunc(e/3)*3 === 0) p1sX.innerHTML += ` ${e/3}X3`;
								if(e == 50 || e == 25) p1sX.innerHTML += ` ${e}`;
							}
							if(e == 50) p1sX.innerHTML += ` ${e}`;
						}
						if(e == sc.p2){
							if(e - Math.trunc(e/2)*2 === 0 && Math.trunc(e/2) <= 20) p2sX.innerHTML = `${e/2}X2`;
							if(settings.x3and25){
								if(e - Math.trunc(e/3)*3 === 0) p2sX.innerHTML += ` ${e/3}X3`;
								if(e == 50 || e == 25) p2sX.innerHTML += ` ${e}`;
							}
							if(e == 50) p2sX.innerHTML += ` ${e}`;
						}
					};
					board[settings.x3and25].find(getX);
					
					if(GameData.score.p1.score == settings.toFinish || GameData.score.p2.score == settings.toFinish){
						game.endGame(GameData.lastShot.p, `${GameData.lastShot.sector}X${GameData.lastShot.sector}`);											
					}		
				
					p1score.innerHTML = `${settings.toFinish-GameData.score.p1.temp} <span>${settings.toFinish-GameData.score.p1.score}</span>`;
					p2score.innerHTML = `${settings.toFinish-GameData.score.p2.temp} <span>${settings.toFinish-GameData.score.p2.score}</span>`;
					document.getElementById("p1progress").style.width = `${GameData.score.p1.temp*100/settings.toFinish}%`;
					document.getElementById("p2progress").style.width = `${GameData.score.p2.temp*100/settings.toFinish}%`;
					

					callback('done');
				}
			};
		}		
		
		function shotDBWrite(shot){
			let tx = db.transaction("shots", "readwrite"); 
			let shots = tx.objectStore("shots");
			let rq = shots.add(shot);
			rq.onsuccess = function() { 
				console.info(`%c ${init++}.\t Shot #${rq.result} writed`, ConsoleCSS);
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
				
				if(parseInt(lastShot.game) == parseInt(GameData.current)) {
					let rq = shots.delete(parseInt(lastShot.id));

					rq.onsuccess = function() { 
						console.log(`Shot ID%o successfully canceling. Game %o DB Game`, parseInt(lastShot.id), parseInt(GameData.current),parseInt(lastShot.game));
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
						GameData.current = maxID;
						GameData.gameObj = game;
						if(game.begin){
							GameData.beginned = true; 
							GameData.beginTime = game.begin;
						}
						if(game.end){
							GameData.endTime = game.end;
						}
						console.info(`%c ${init++}. Game ID ${maxID} OK`, ConsoleCSS);
						callback(game);
					} else {
						console.trace(`Game ID is not defined`);
						callback(undefined);
					}				
				});				
			},		
			SetGameBegin: function(){
				if(!GameData.beginned){
					let request = db.transaction("shots", "readwrite").objectStore("shots").index("game");
					let singleKeyRange = IDBKeyRange.only(GameData.current);
					let gameShotsCounter = 0;
					let firstShotDate;
					
					request.openCursor(singleKeyRange).onsuccess = function(e) {
						let cursor = e.target.result;
						if (cursor) {
							//console.log(cursor);
							if(gameShotsCounter == 0) firstShotDate = cursor.value.date;
							gameShotsCounter++;
							cursor.continue();
						} else {
/*							console.info(`
							First Shot Date: %o
							Total Shots in Game: %o`, dateFormat(firstShotDate), gameShotsCounter);*/						
							if(gameShotsCounter == 1) {
								MaxID("games", function(maxID,game){
									let tx = db.transaction("games", "readwrite"); 
									let games = tx.objectStore("games");
									game.begin = firstShotDate;
									let rq = games.put(game);
									rq.onsuccess = function() { 
										GameData.beginned = true;
										console.info(`%c ${init++}.\t Game ${maxID} begin time ${dateFormat(firstShotDate)} `, ConsoleCSS);
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
			SetGameEnd: function(gameID = GameData.current){
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
									console.info(`%c ${init++}.\t Game ${maxID} ending time ${dateFormat(endShotDate)} `, ConsoleCSS);
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
					GameData.next = g.next;					
				});
			},
			SetNext: function(next){
				// console.log(next);
				MaxID("games", function(maxID,game){
					let tx = db.transaction("games", "readwrite"); 
					let games = tx.objectStore("games");
					GameData.next = next;
					game.next = next;
					let rq = games.put(game);
					rq.onsuccess = function(){
						console.info(`%c ${init++}.\t Game ${maxID} next player ${next} `, ConsoleCSS);
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
					GameData.first = next;
					GameData.next = next;
					game.next = next;
					game.first = next;
					let rq = games.put(game);
					rq.onsuccess = function(){
						console.info(`%c ${init++}.\t Game ${maxID} next player ${next} `, ConsoleCSS);
					};
					rq.onerror = function() {
						console.error("Error setting ending time", rq.error);
					};
				});
			},			
			SetHits: function(data, callback){
				let tx = db.transaction("service", "readwrite"); 
				let service = tx.objectStore("service");
				let newData = {
					game: GameData.current,
					first: GameData.first,
					p1shots: data.p1,
					p2shots: data.p2,
				};
				
				let rq = service.put(newData);
				rq.onsuccess = function(){
					console.info(`%c ${init++}.\t ${data.total} Hits: ${GameData.p1} - ${data.p1} ${GameData.p2} - ${data.p2} `, ConsoleCSS);
					// console.log(newData);
					callback(newData);						
				};
				rq.onerror = function() {
					console.error("Error setting ending time", rq.error);
				};
			},
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
			Hit: function(id){
				let r = db.transaction("service", "readwrite").objectStore("service").get(GameData.current);
				r.onsuccess = function(){
					console.log(r.result);
				};			
			},			
			NewGame: function(callback = function(e){console.log(e)}){
				let tx = db.transaction("games", "readwrite"); 
				let games = tx.objectStore("games");
				let gData = {
					begin:	'',
					end:	'',
					first:	GameData.first,
					p1:		GameData.p1,
					p2:		GameData.p2,
					winner:	'',
					hits:	0,
					lasthit:'',
					next:	GameData.first,
				};
				let rq = games.add(gData);
				rq.onsuccess = function() {
					console.info(`%c ${init++}.\t New game successfully started ${rq.result} `, ConsoleCSS);					
					GameData.current = rq.result;
					GameData.beginned = false;
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
						console.info(`%c ${init++}.\t Game Over ${rq.result} `, ConsoleCSS);
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
					let request = tx.objectStore("players").put({name: el});
				})

				tx.oncomplete = function(event) {
					callback(event);
				}
			},
		};
		
		
	}	
}
