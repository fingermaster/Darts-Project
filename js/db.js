const DB_CONFIG = {
   name: 'd',
   version: 1
}

class IndexedDB {
   DB;

   constructor() {
      this.openDB()
            .then((data) => { console.log(`DATA: ${data}:`, data)})
            .catch((error) => { console.error("DB Constructor Error:", error)});
   }

   openDB(){
      return new Promise((resolve, reject) => {
         if(this.DB === undefined){
            const Open = window.indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

            Open.onerror = (error) => {
               this.error(error);
               reject(error);
            };
            Open.onsuccess = () => {
               this.DB = Open.result;
               // this.dbState = 'success';
               resolve(this.DB);
               this.DB.onversionchange = () => {
                  this.DB.close();
               };
            };
            Open.onupgradeneeded = (event) => {
               this.upgrade(event)
            };
            Open.onblocked = () => {
               this.blocked();
               reject("DB connection blocked");
            };
         } else {
            resolve(this.DB);
         }
      });
   }

   error(error) {
      console.error(error);
      return error;
   }

   async addData(requestStore = 'shots', data = {}) {
      await this.openDB();
      return new Promise((resolve, reject) => {
         const transaction = this.DB.transaction(requestStore, 'readwrite');
         let store = transaction.objectStore(requestStore);
         let request;
         if (Object.keys(data).includes('id')) {
            request = store.put(data)
         } else {
            request = store.add(data);
         }

         request.onsuccess = () => {
            console.warn(`Data adding result: ${request.result}`);
            resolve(request.result);
         };
         request.onerror = (error) => reject(error);
      });
   }

   async delete(id, requestStore = 'shots') {
      await this.openDB();
      return new Promise((resolve, reject) => {
         const transaction = this.DB.transaction(requestStore, 'readwrite');
         const store = transaction.objectStore(requestStore);
         const request = store.delete(id);

         request.onsuccess = () => {
            resolve();
         };
         request.onerror = (error) => reject(error);
      });
   }

   async read(requestStore = 'games', index = false) {
      await this.openDB();
      return new Promise((resolve, reject) => {
         const transaction = this.DB.transaction(requestStore, 'readonly');
         const save = (data) => {
            resolve(data);
         }
         if (typeof index === "object") {
            // Эта логика поиска по индексу требует доработки,
            // так как "index" используется и как имя индекса, и как значение
            // Но пока оставим как есть
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
            request.onsuccess = () => save(request.result);
            request.onerror = (error) => {
               this.error(error);
               reject(error);
            }
         }
         transaction.onerror = (error) => reject(error);
      });
   }

   async getLastGame() {
      await this.openDB();
      return await new Promise((resolve, reject) => {
         const store = this.DB.transaction('games', 'readonly').objectStore('games');
         const request = store.openCursor(null, 'prev');

         request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
               resolve({ maxId: cursor.value.id, lastGame: cursor.value });
            } else {
               resolve({ maxId: 0, lastGame: null });
            }
         };
         request.onerror = (error) => reject(error);
      });
   }

   upgrade(event) {
      console.log(event);
      console.log(`Upgrade v${event.oldVersion} to v${event.newVersion}`);
      let db = event.currentTarget.result;
      let tx = event.currentTarget.transaction;

      switch (event.oldVersion) {
         case 0: {
            let games = db.createObjectStore('games', {keyPath: 'id', autoIncrement: true});
            games.createIndex("p1", "p1", {unique: false});
            games.createIndex("p2", "p2", {unique: false});

            // let players =
            db.createObjectStore('players', {keyPath: 'name', unique: true});

            let shots = db.createObjectStore('shots', {keyPath: 'id', autoIncrement: true});
            shots.createIndex("player", "player", {unique: false});
            shots.createIndex("game", "game", {unique: false});
            shots.createIndex("date", "date", {unique: true});

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
               let shots = tx.createObjectStore('shots', {keyPath: 'id', autoIncrement: true});
               shots.createIndex("player", "player", {unique: false});
               shots.createIndex("game", "game", {unique: false});
            }
            break;
         }
      }
   }

   blocked() {
      console.log('blocked');
   }
}

const DB = new IndexedDB;
