const dbName = "darts";
const dbVersion = 10;
let db, qr, tx;


if(window.indexedDB){
	qr = indexedDB.open(dbName, dbVersion);
	qr.onerror = function() {
		console.error("Error", qr.error);
	};
	qr.onsuccess = function() {
		console.log(`%c ${init++}. IndexedDB  OK `, ConsoleCSS);
		db = qr.result;

		function storageAvailable() {
			try {
				let x = 'localStorage_test__';
				localStorage.setItem(x, x);
				localStorage.removeItem(x);
				console.info(`%c ${init++}. LocalStorage  OK `, ConsoleCSS);
				return true;
			} catch(e) {
				console.error(`localStorage Error: %o`, e);
				return false;
			}
		}
		if(storageAvailable()) gamefx(db);

		db.onversionchange = function() {
			db.close();
			alert("New version of the IndexedDB aviable. Requires page reload")
		};
	};

	qr.onupgradeneeded = function(e) {
		db = qr.result || e.currentTarget.result;
		tx = e.currentTarget.transaction;

		if (!db.objectStoreNames.contains('games')) {
			let games = db.createObjectStore('games', {keyPath: 'id', autoIncrement: true });
			games.createIndex("p1", "p1", { unique: false });
			games.createIndex("p2", "p2", { unique: false });
		} else {
			/*	let games = tx.objectStore('games');
                games.createIndex("p1", "p1", { unique: false });
                games.createIndex("p2", "p2", { unique: false });	*/
		}

		if (!db.objectStoreNames.contains('service')) {
			let service = db.createObjectStore('service', {keyPath: 'game', unique: true });
		} else {
			/*	let service = tx.objectStore('service');
                service.createIndex("p1", "p1", { unique: false });
                service.createIndex("p2", "p2", { unique: false });	*/
		}

		if (!db.objectStoreNames.contains('players')) {
			db.createObjectStore('players', {keyPath: 'name', unique: true});
		} else {
			/*let players = tx.objectStore('players');
			players.createIndex("name", "name", { unique: true });*/
		}
		// objectStore.createIndex("year", "year", { unique: false });

		if (!db.objectStoreNames.contains('shots')) {
			let shots = db.createObjectStore('shots', {keyPath: 'id', autoIncrement: true });
			shots.createIndex("player", "player", { unique: false });
			shots.createIndex("game", "game", { unique: false });
			shots.createIndex("date", "date", { unique: true });
		} else {
			//let shots = tx.objectStore('shots');
			//shots.createIndex("player", "player", { unique: false });
			//shots.createIndex("game", "game", { unique: false });
			//shots.createIndex("date", "date", { unique: true });
		}

		switch(db.version) {
			case 0: break;
			case 1: break;
		}
	};

	qr.onblocked = function() {
		console.log('qr.onblocked');
	};
}


