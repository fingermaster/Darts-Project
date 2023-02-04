if(inScope('stats')){
	let storage, vx, player, players, game, tempID, DB;
	storage = localStorage;
	players = Array();


	//let p1Points, p2Points = 501;
	//let p1LinePoints, p2LinePoints = 501;
	/*function pointsLeft(player, shot, n){
		if(isCorrect(n)) player++;
		if()
	}
	let left = 501;

	shot[21] =  {s: 20, x: 1, left: 25, lineleft: 25};
	shot[22] =  {s: 20, x: 3, left: 301};
*/






	/*
	if(scorepl + shotDB.sx < 500 && shotDB.calc){
		scorepl = scorepl + shotDB.sx;
	} else if (scorepl + shotDB.sx == 501 && shotDB.yn){
		scorepl = scorepl + shotDB.sx;
		document.getElementById(player+'shot'+i).classList.add('end');
		game.endGame(player, i+1, `${shotDB.sector}x${shotDB.x}`);
	} else {
		if(shotDB.shotn == 1){
			shotDB.calc = false;
			document.getElementById(player+'shot'+i).classList.add('bad');
		}
		if(shotDB.shotn == 2){
			if(parsed[i-1].calc == true) {
				scorepl = scorepl - parsed[i-1].sx;
				parsed[i-1].calc = false;
				document.getElementById(player+'shot'+(i-1)).classList.add('bad');
			}
			shotDB.calc = false;
			document.getElementById(player+'shot'+i).classList.add('bad');
		}
		if(shotDB.shotn == 3){
			if(parsed[i-1].calc == true) {
				scorepl = scorepl - parsed[i-1].sx;
				parsed[i-1].calc = false;
				document.getElementById(player+'shot'+(i-1)).classList.add('bad');
			}
			if(parsed[i-2].calc == true) {
				scorepl = scorepl - parsed[i-2].sx;
				parsed[i-2].calc = false;
				document.getElementById(player+'shot'+(i-2)).classList.add('bad');
			}
			shotDB.calc = false;
			document.getElementById(player+'shot'+i).classList.add('bad');
		}
	}
	*/




	function gamefx(db){
		function MaxID(table, callback){
			let tx = db.transaction(table, "readwrite");
			let tbl = tx.objectStore(table);
			let rq = tbl.openCursor();
			let maxID = 0;
			rq.onsuccess = function() {
				let cursor = rq.result;
				if (cursor) {
					let key = cursor.key;
					let value = cursor.value;
					maxID = key;
					cursor.continue();
				} else {
					callback(maxID);
				}
			};
		}

		DB = {
			fxStoreNames: function(){
				console.log(db.objectStoreNames);
			},

			fxShotsList: function (){
				let tx = db.transaction("shots", "readwrite");
				let dbshots = tx.objectStore("shots");
				let request = dbshots.openCursor();

				request.onsuccess = function() {
					let cursor = request.result;
					if (cursor) {
						let key = cursor.key;
						let value = cursor.value;
						console.log(key, " ",value);
						cursor.continue();
					} else {
						console.log("end");
						countRequest();
					}
				};

				function countRequest(){
					let countRequest = dbshots.count();
					countRequest.onsuccess = function() {
						console.log(countRequest.result);
					}
				}

			},

			fxLastShot: function(){
				MaxID("shots", function(maxID){
					let tx = db.transaction("shots", "readwrite");
					let shots = tx.objectStore("shots");

					let r = shots.get(maxID);
					r.onsuccess = function(){
						console.log(r.result);
					};
				});
			},

			fxShot: function(id){
				let tx = db.transaction("shots", "readwrite");
				let shots = tx.objectStore("shots");

				let r = shots.get(id);
				r.onsuccess = function(){
					console.log(r.result);
				};
			},

			fxShotGame: function(game){
				let request = db.transaction("shots", "readwrite").objectStore("shots").index("game");
				let singleKeyRange = IDBKeyRange.only(game);
				let p1name = undefined;

				//this block wanna go to generation table. And 100% needs edit
				//let p1score = p2score = p1temp = p2temp = 0;
				let score = {p1: {score: 0, temp: 0}, p2: {score: 0, temp: 0}};

				request.openCursor(singleKeyRange).onsuccess = function(e) {
					let cursor = e.target.result;
					if (cursor) {
						let key = cursor.key;
						let value = cursor.value;
						//console.log(value);
						if(p1name === undefined) p1name = value.player;
						let gaming = '';
						let correct = nowScore = false;

						if(p1name === value.player)	gaming = 'p1';
						else gaming = 'p2';

						if(value.shotn === 1) score[gaming].temp = score[gaming].score;
						if((isCorrect(value.sector, value.x, 501-score[gaming].temp) && value.shotn === 3)	||  (isCorrect(value.sector, value.x, 501-score[gaming].temp) && score[gaming].temp+value.sx === 501)){
							correct = true;
							score[gaming].score = score[gaming].temp+value.sx;
							nowScore = true;
							console.log(`${score.p1.score} ${score.p2.score}`);
						}
						if(isCorrect(value.sector, value.x, 501-score[gaming].temp)){
							correct = true;
							score[gaming].temp = score[gaming].temp+value.sx;
						} else {
							if(score[gaming].temp + value.sx > 501-score[gaming].temp) score[gaming].temp = score[gaming].score;
						}
						if(value.shotn === 3) score[gaming].score = score[gaming].temp;
						let outputMultiplier = '';
						if(value.x>1) outputMultiplier = `x${value.x}`;

						if (p1name === value.player) {
							document.getElementById(`game_${game}_${'p1'}`).innerHTML += `<div class="shot ${(!correct) ? 'red' : ''}">${(value.sector !== 0) ? value.sector + outputMultiplier : '0'}</div>`;
						} else {
							document.getElementById(`game_${game}_${'p2'}`).innerHTML += `<div class="shot ${(!correct) ? 'red' : ''}">${(value.sector !== 0) ? value.sector + outputMultiplier : '0'}</div>`;
						}
						document.getElementById(`score_${game}_${(p1name === value.player)?'p1':'p2'}`).innerHTML += `${(nowScore)?'<div class="score">' + score[gaming].score + '</div>' :''}`;
						cursor.continue();
					} else {
						console.log("end");
					}
				};
			},

			fxShotPlayer: function(player){
				let request = db.transaction("shots", "readwrite").objectStore("shots").index("player");
				let singleKeyRange = IDBKeyRange.only(player);

				request.openCursor(singleKeyRange).onsuccess = function(e) {
					let cursor = e.target.result;
					if (cursor) {
						let key = cursor.key;
						let value = cursor.value;
						console.log(key, " ", value);
						cursor.continue();
					} else {
						console.log("end");
					}
				};
			},

			fxGamesList: function (){
				let tx = db.transaction("games", "readwrite");
				let games = tx.objectStore("games");
				//let request = games.openCursor();

				let crqst = games.count();
				crqst.onsuccess = function() {
					console.log(crqst.result);
				}

				let res = games.getAll();
				res.onsuccess = function(){
					// output.innerHTML = `${res.rusult.begin} ${res.rusult.end} ${res.rusult.p1} ${res.rusult.p2} ${res.rusult.winner}`;
					/*res.rusult.forEach((game) => {
						output.innerHTML = `${game.begin}`;
					});		*/
				//	console.log(res.rusult.length);
					let gamess = res.result;
					console.log(gamess.length);
					gamess.forEach((game) => {
						let begin = new Date(game.begin);
						let end = new Date(game.end);
						let duration = end.getTime()-begin.getTime();
						if(game.begin && game.winner){
							output.innerHTML += `
								<div class="game">
									<div class="gridline" onclick="DB.fxShotGame(${game.id})">
										<div>${game.id}</div>
										<div class="startend">
											${begin.getFullYear()}-${begin.getMonth()}-${begin.getDate()} ${begin.getHours()}:${begin.getMinutes()}<br>
											${end.getFullYear()}-${end.getMonth()}-${end.getDate()} ${end.getHours()}:${end.getMinutes()}
										</div>
										<div> ${msToTime(duration)} </div>
										
										<div class="p1"> ${game.p1} </div>
										<div class="p2"> ${game.p2} </div>
										
										
										<div class="winner"> ${game.winner} </div>
										<div class="hits"> ${game.hits} </div>
										<div class="lasthit"> ${game.lasthit} </div>							
									</div>
									<div class="detail" id="game${game.id}">
										<div class="shots" id="game_${game.id}_p1"></div><div class="scores" id="score_${game.id}_p1"></div><div class="scores" id="score_${game.id}_p2"></div>
										<div class="shots" id="game_${game.id}_p2"></div>
									</div>
								</div>								
							`;
						}
					});
					//console.log(res.result);
				};

			},

			fxLastGame: function(){
				MaxID("games", function(maxID){
					let tx = db.transaction("games", "readwrite");
					let games = tx.objectStore("games");

					let r = games.get(maxID);
					r.onsuccess = function(){
						console.log(r.result);
					};
				});
			},


			fxGame: function(id){
				let tx = db.transaction("games", "readwrite");
				let games = tx.objectStore("games");

				let r = games.get(id);
				r.onsuccess = function(){
					console.log(r.result);
				};
			},

			fxPlayersList: function (){
				let tx = db.transaction("players", "readwrite");
				let players = tx.objectStore("players");

				let res = players.getAll();
				res.onsuccess = function(){
					console.log(res.result);
				};

			},
		};
	}
	window.onload = function(){
		//DB.fxGamesList();
	}
}
