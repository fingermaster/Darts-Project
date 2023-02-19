const DB_CONFIG = {
	name: 'd',
	version: 1
}
class IndexedDB {
	Open;
	DB;
	dbState = '...';
	result;
	id;
	maxId = 0;

	constructor(Open, DB) {
		Open = this.Open = window.indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
		Open.onerror = (error) => { this.error(error)};
		Open.onsuccess = async () => {
			DB = this.DB = Open.result;
			this.dbState = 'success';
			DB.onversionchange = () => {
				DB.close();
			};
		};
		Open.onupgradeneeded = (event) => { this.upgrade(event) };
		Open.onblocked = () => { this.blocked() }
	}
	error(error){
		console.log(error);
		return error;
	}
	on(callback = () => {}, state = 'success'){
		let lastState = this.dbState;
		let interval = setInterval(() => {
			if(lastState !== this.dbState) {
				console.log(`State changed. ${lastState} -> ${this.dbState}`);
				lastState = this.dbState;
			}
			if(lastState === state){
				callback();
				clearInterval(interval);
			}
		}, 1);
	}
	state(stateLink, callback = () => {}, onState = 'done'){
		let lastState = stateLink.readyState;
		let interval = setInterval(() => {
			if(lastState !== stateLink.readyState) {
				// console.log(`State changed. ${lastState} -> ${stateLink.readyState}`);
				lastState = stateLink.readyState;
				callback(stateLink.readyState);
			}
			if(lastState === onState){
				clearInterval(interval);
			}
		}, 1);
	}
	addData(requestStore = 'shots', data = {}, callback = () => {}) {
		console.warn(requestStore);
		const transaction = this.DB.transaction(requestStore, 'readwrite');
		let store = transaction.objectStore(requestStore);
		let request;
		if (Object.keys(data).includes('id')) {
			request = store.put(data)
		} else {
			request = store.add(data);
		}
		this.state(request, (state) => {
			if(state === 'done') {
				this.result = request;
				// console.warn(`Data adding result: ${request.result}`);
				this.id = request.result;
				callback(request.result);
			}
		});
		transaction.oncomplete = () => {}
	}
	delete(id, requestStore = 'shots', callback = ()=>{}){
		const transaction = this.DB.transaction(requestStore, 'readwrite');
		let store = transaction.objectStore(requestStore);
		let request = store.delete(id);
		this.state(request, (state) => {
			if(state === 'done') {
				this.result = request;
				callback();
			}
		});
	}
	read(requestStore = 'games', index = false, callback = (data) => {console.log(data);}){
		const transaction = this.DB.transaction(requestStore, 'readwrite');
		const save = (data) => {
			callback(data);
		}
		if (typeof index === "object") {
			let store, result;
			result = [];
			store = transaction.objectStore(requestStore).index(index[0]);
			let singleKeyRange = IDBKeyRange.only(index[1]);
			store.openCursor(singleKeyRange).onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					result.push(cursor.value);
					cursor.continue();
				} else {
					save(result);
				}
			}
		} else {
			let store, request;
			store = transaction.objectStore(requestStore);
			request = store.getAll();
			request.onsuccess = async () => save(request.result);
			request.onerror = (error) => reject(this.error(error));
		}
		transaction.oncomplete = () => {}
	}
	findMaxId(callback = (e) => console.log(e) ) {
		this.on(()=>{
			const transaction = this.DB.transaction('games', 'readwrite');
			transaction.oncomplete = () => {}
			let store = transaction.objectStore('games');
			let request = store.getAll();
			request.addEventListener("success", async (event) => {
				this.maxId = event.target.result.length === 0 ? 0 : event.target.result[request.result.length - 1].id;
				this.result = event.target.result;
				callback(this.maxId, this.result);
			});
			request.addEventListener("error", (error) => this.error(error));
		});
	}

	upgrade(event){
		console.log(event);
		console.log(`Upgrade v${event.oldVersion} to v${event.newVersion}`);
		let db = event.currentTarget.result;
		let tx = event.currentTarget.transaction;

		switch(event.oldVersion) {
			case 0: {
				let games = db.createObjectStore('games', {keyPath: 'id', autoIncrement: true});
				games.createIndex("p1", "p1", {unique: false});
				games.createIndex("p2", "p2", {unique: false});

				// let players =
					db.createObjectStore('players', {keyPath: 'name', unique: true});

				let shots = db.createObjectStore('shots', {keyPath: 'id', autoIncrement: true });
				shots.createIndex("player", "player", { unique: false });
				shots.createIndex("game", "game", { unique: false });
				shots.createIndex("date", "date", { unique: true });

				break;
			}
			case 1: {
				if (!tx.objectStoreNames.contains('games')) {
					let games = tx.createObjectStore('games', {keyPath: 'id', autoIncrement: true});
					games.createIndex("p1", "p1", {unique: false});
					games.createIndex("p2", "p2", {unique: false});
				}

				if (!tx.objectStoreNames.contains('players')) {
					tx.createObjectStore('players', {keyPath: 'name', unique: true});
				}
				if (!tx.objectStoreNames.contains('shots')) {
					let shots = tx.createObjectStore('shots', {keyPath: 'id', autoIncrement: true });
					shots.createIndex("player", "player", { unique: false });
					shots.createIndex("game", "game", { unique: false });
				}
				break;
			}
		}
	}
	blocked(){
		console.log('blocked');
	}
}
const DB = new IndexedDB;
