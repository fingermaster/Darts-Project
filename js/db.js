const DB_CONFIG = {
	name: 'darts',
	version: 10
}
class IndexedDB {
	Open;
	DB;
	store = 'games';
	mode = 'readwrite';
	result;
	id;
	maxId = 0;

	constructor(Open, DB) {
		Open = this.Open = window.indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
		Open.onerror = (error) => { this.error(error)};
		Open.onsuccess = async () => {
			DB = this.DB = await Open.result;
			DB.onversionchange = () => {
				DB.close();
			};
			console.log('open')
		};
		Open.onupgradeneeded = (event) => { this.upgrade(event) };
		Open.onblocked = () => { this.blocked() }
	}
	error(error){
		console.log(error);
		return error;
	}
	setStore(name, mode = 'readwrite'){
		this.store = name;
		this.mode = mode;
		return true;
	}
	async addData(data) {
		new Promise((resolve, reject) => {
			const transaction = this.DB.transaction(this.store, this.mode);
			let store = transaction.objectStore(this.store);
			let request;
			if (Object.keys(data).includes('id')) {
				request = store.put(data)
			} else {
				request = store.add(data);
			}
			request.onsuccess = () => {
				this.result = request;
				this.id = request.result;
			}
			request.onerror = (error) => {
				reject(this.error(error))
			}

			transaction.oncomplete = () => {
				resolve();
			}
		});
	}
	async delete(id){
		const transaction = this.DB.transaction(this.store, this.mode);
		new Promise((resolve, reject) => {
			let store = transaction.objectStore(this.store);
			let request = store.delete(id);
			request.onsuccess = () => {
				this.result = request;
				resolve();
			}
			request.onerror = (error) => { reject(this.error(error)) }
		});
	}
	async read(index = false){
		const transaction = this.DB.transaction(this.store, this.mode);
		new Promise((resolve, reject) => {
			const save = (data) => {
				this.saveResult(data);
			}
			if (typeof index === "object") {
				let store, result;
				result = [];
				store = transaction.objectStore(this.store).index(index[0]);
				let singleKeyRange = IDBKeyRange.only(index[1]);
				store.openCursor(singleKeyRange).onsuccess = function (e) {
					const cursor = e.target.result;
					if (cursor) {
						result.push(cursor.value);
						cursor.continue();
					} else {
						// console.log('Entries all displayed');
						save(result);
					}
				}

			} else {
				let store, request;
				store = transaction.objectStore(this.store);
				request = store.getAll();
				request.onsuccess = async () => save(request.result);
				request.onerror = (error) => reject(this.error(error));
			}
			transaction.oncomplete = () => {
				resolve();
			}
		})
	}
	findMaxId(callback = (e) => console.log(e) ) {
		const transaction = this.DB.transaction(this.store, this.mode);
		transaction.oncomplete = () => {
			callback(this.maxId,  this.result);
		}
		let store = transaction.objectStore(this.store);
		let request = store.getAll();
		request.addEventListener("success", async (event) => {
			this.maxId = event.target.result[request.result.length - 1].id;
			this.result = event.target.result;
		});
		request.addEventListener("error", (error) => this.error(error));
	}
	info(){
		console.log(this.DB.transaction(this.store, this.mode).objectStore(this.store))
	}
	saveResult(data){
		this.result = data;
		return data;
	}

	upgrade(event){
		console.log('upgrade');
		let tx = this.DB.transaction;

		switch(this.DB.version) {
			case 0: {
				let games = tx.createObjectStore('data', {keyPath: 'id', autoIncrement: true });
				games.createIndex("p1", "p1", { unique: false });
				games.createIndex("p2", "p2", { unique: false });
				break;
			}
			case DB_CONFIG.version: {
				break;
			}
		}
	}
	blocked(){
		console.log('blocked');
	}
}
const DB = new IndexedDB;
