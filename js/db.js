const DB_SCHEMA = {
   name: 'd',
   version: 1,
   stores: {
      games: {
         options: { keyPath: 'id', autoIncrement: true },
         indexes: [
            { name: 'p1', key: 'p1' },
            { name: 'p2', key: 'p2' }
         ]
      },
      players: {
         options: { keyPath: 'name' }
      },
      shots: {
         options: { keyPath: 'id', autoIncrement: true },
         indexes: [
            { name: 'player', key: 'player' },
            { name: 'game', key: 'game' },
            { name: 'date', key: 'date', options: { unique: true } }
         ]
      }
   }
};

class IndexedDB {
   DB;

   constructor() {
      this.openDB()
            .then((data) => console.log("DB Initialized"))
            .catch((error) => console.error("DB Constructor Error:", error));
   }

   openDB() {
      return new Promise((resolve, reject) => {
         if (this.DB) return resolve(this.DB);

         const request = window.indexedDB.open(DB_SCHEMA.name, DB_SCHEMA.version);

         request.onsuccess = () => {
            this.DB = request.result;
            this.DB.onversionchange = () => this.DB.close();
            resolve(this.DB);
         };

         request.onupgradeneeded = (event) => this.upgrade(event);
         request.onerror = (e) => reject(e);
         request.onblocked = () => console.warn("DB connection blocked");
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
      const db = event.target.result;
      const tx = event.currentTarget.transaction;

      // Теперь мы просто берем структуру из DB_SCHEMA
      for (const [storeName, config] of Object.entries(DB_SCHEMA.stores)) {
         let store;

         if (!db.objectStoreNames.contains(storeName)) {
            store = db.createObjectStore(storeName, config.options);
         } else {
            store = tx.objectStore(storeName);
         }

         if (config.indexes) {
            config.indexes.forEach(idx => {
               if (!store.indexNames.contains(idx.name)) {
                  store.createIndex(idx.name, idx.key, idx.options || { unique: false });
               }
            });
         }
      }
   }
}

const DB = new IndexedDB;
