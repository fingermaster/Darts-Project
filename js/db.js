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
            { name: 'date', key: 'date', options: { unique: false } }
         ]
      }
   }
};

class IndexedDB {
   DB;
   #initPromise; // Приватное поле для хранения единого промиса инициализации

   constructor() {
      // Инициализируем один раз и сохраняем сам промис
      this.#initPromise = this.openDB();

      this.#initPromise
            .then(() => console.log("DB Initialized"))
            .catch((error) => console.error("DB Constructor Error:", error));
   }

   openDB() {
      // Если метод вызван повторно, пока база открывается — возвращаем текущий промис
      if (this.#initPromise) return this.#initPromise;

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

   // Вспомогательный метод для ожидания готовности базы (чтобы не дублировать код)
   async #ensureDB() {
      return await this.#initPromise;
   }

   async addData(requestStore = 'shots', data = {}) {
      const db = await this.#ensureDB();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction(requestStore, 'readwrite');
         const store = transaction.objectStore(requestStore);

         // Нам не нужно проверять ключи.
         // .put() сам найдет первичный ключ (id или name) в объекте data.
         const request = store.put(data);

         request.onsuccess = () => resolve(request.result);
         request.onerror = (error) => reject(error);
      });
   }

   async delete(id, requestStore = 'shots') {
      const db = await this.#ensureDB();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction(requestStore, 'readwrite');
         const store = transaction.objectStore(requestStore);
         const request = store.delete(id);

         request.onsuccess = () => resolve();
         request.onerror = (error) => reject(error);
      });
   }

   async read(requestStore = 'games', index = false) {
      const db = await this.#ensureDB();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction(requestStore, 'readonly');

         if (typeof index === "object") {
            const result = [];
            const store = transaction.objectStore(requestStore).index(index[0]);
            const range = IDBKeyRange.only(index[1]);

            store.openCursor(range).onsuccess = (event) => {
               const cursor = event.target.result;
               if (cursor) {
                  result.push(cursor.value);
                  cursor.continue();
               } else {
                  resolve(result);
               }
            };
         } else {
            const store = transaction.objectStore(requestStore);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (error) => reject(error);
         }
         transaction.onerror = (error) => reject(error);
      });
   }

   async getLastGame() {
      const db = await this.#ensureDB();
      return new Promise((resolve, reject) => {
         const store = db.transaction('games', 'readonly').objectStore('games');
         const request = store.openCursor(null, 'prev');

         request.onsuccess = (e) => {
            const cursor = e.target.result;
            resolve(cursor ? { maxId: cursor.value.id, lastGame: cursor.value } : { maxId: 0, lastGame: null });
         };
         request.onerror = (error) => reject(error);
      });
   }

   upgrade(event) {
      const db = event.target.result;
      const tx = event.currentTarget.transaction;

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

export const DB = new IndexedDB();
