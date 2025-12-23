const Settings = {
   isInitializing: false,
   data: {
      toFinish: 501,
      x3and25: 1,
      overshootSkip: 0,
      p1: 'Player One',
      p2: 'Player Two',
      current: 1,
      first: 'p1',
      next: 'p1',
   },

   load(dbData) {
      // 1. Обновляем данные в объекте напрямую, минуя сеттеры
      Object.assign(this.data, {
         toFinish: dbData.toFinish ?? 501,
         x3and25: dbData.x3and25 ?? 1,
         overshootSkip: dbData.overshootSkip ?? 0,
         p1: dbData.p1 ?? 'Player One',
         p2: dbData.p2 ?? 'Player Two',
         current: dbData.id ?? 1,
         first: dbData.first ?? 'p1',
         next: dbData.next ?? 'p1'
      });

      // 2. Обновляем интерфейс, так как автоматика сеттеров была пропущена
      UI.renderInfoBar(this.data);
      UI.updateSettingsView('toFinish', this.data.toFinish);
      UI.updateSettingsView('x3and25', this.data.x3and25);
      UI.updateSettingsView('overshootSkip', this.data.overshootSkip);

      console.log("Settings loaded from DB successfully");
   },

   set(key, value) {
      if (this.data[key] === value) return;

      this.data[key] = value;

      if (['toFinish', 'x3and25', 'overshootSkip'].includes(key)) {
         UI.updateSettingsView(key, value);
      }

      UI.renderInfoBar(this.data);
      //Если идёт инициализация, то в базу не записываем.
      if(!this.isInitializing) {
         Storage.SetSettings();
      }
   },

   get toFinish() { return this.data.toFinish; },
   set toFinish(v) { this.set('toFinish', v); },
   get x3and25() { return this.data.x3and25; },
   set x3and25(v) { this.set('x3and25', v); },
   get overshootSkip() { return this.data.overshootSkip; },
   set overshootSkip(v) { this.set('overshootSkip', v); },
   get p1() { return this.data.p1; },
   set p1(v) { this.set('p1', v); },
   get p2() { return this.data.p2; },
   set p2(v) { this.set('p2', v); },
   get current() { return this.data.current; },
   set current(v) { this.set('current', v); },
   get first() { return this.data.first; },
   set first(v) { this.set('first', v); },
   get next() { return this.data.next; },
   set next(v) { this.set('next', v); },
};
