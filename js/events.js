// events.js
// Dependencies:
// - ui.js (View, UI)
// - game.js (Game, sendShot, modal)
// - storage.js (Storage)
// - settings.js (Settings)
// - selector.js (экземпляр selector)
// - timer.js (экземпляр timer)
// - utils.js (randomGenerator и вспомогательная математика)

const clickActions = {
   start: async () => {
      const p1 = View('p1input').value;
      const p2 = View('p2input').value;
      await Game.start(p1, p2);
   },
   newGame: async () => {
      await Game.new();
   },
   cancelHit: async () => {
      await Game.cancelLastHit();
   },
   modalToggle: async () => {
      await modal.toggle();
   },
   toFinish: async (btn) => {
      const value = parseInt(btn.dataset.value);
      Settings.toFinish = value;
      await Storage.SetSettings();
   },
   x3and25: async (btn) => {
      const value = parseInt(btn.dataset.value);
      Settings.x3and25 = value;
      await Storage.SetSettings();
   },
   overshoot: async (btn) => {
      const value = parseInt(btn.dataset.value);
      Settings.overshootSkip = value;
      await Storage.SetSettings();
   },
   randomAll: () => {
      randomGenerator.all();
   },
   randomSector: () => {
      randomGenerator.sector();
   },
};

const changeActions = {
   toFinishCustom: (input) => {
      const value = parseInt(input.value);
      Settings.toFinish = value;
   },
};

const keyActions = {
   Digit1: () => {
      Game.first = 'p1';
   },
   Digit2: () => {
      Game.first = 'p2';
   },
   Space: (event) => {
      event.preventDefault();
      sendShot(0, 1);
      timer.clearTimer();
   },
   Backspace: (event) => {
      event.preventDefault();
      Game.cancelLastHit();
      timer.clearTimer();
   },
   Enter: () => {
      let selected = selector.enter();
      sendShot(selected.sector, selected.x);
      timer.clearTimer();
   },
   NumpadEnter: () => {
      let selected = selector.enter();
      sendShot(selected.sector, selected.x);
      timer.clearTimer();
   },
   Pause: () => {
      timer.switchTimer();
   },
   NumpadDivide: () => {
      randomGenerator.all();
   },
   NumpadMultiply: () => {
      randomGenerator.sector();
   },
};

const handleArrows = (event) => {
   selector.keyDown(event);
};

const handleNumpadDigits = (event) => {
   event.preventDefault();
   let num = (event.code).match(/\d+/g);
   if (num !== null) {
      num = parseInt(num[0]);
      if (num === 0) {
         num = 10;
      }
      if (event.shiftKey) {
         num = num + 10;
      }
      selector.toSector(num);
   }
};

document.addEventListener('click', (event) => {
   if (event.target.tagName !== 'BUTTON' &&
         modal.state === true &&
         !modal.isOnModal(event.x, event.y)) {
      modal.toggle();
   }

   const btn = event.target.closest('[data-action]');
   const action = btn?.dataset.action;
   if (action && typeof clickActions[action] === 'function') {
      clickActions[action](btn);
   }

   const numContainer = event.target.closest('[data-num]');
   if (numContainer) {
      selector.toIndex(numContainer.dataset.num);
   }
});

document.addEventListener('change', (event) => {
   const el = event.target.closest('[data-action]');
   if (el && changeActions[el.dataset.action]) {
      changeActions[el.dataset.action](el);
   }
});

document.addEventListener('wheel', (event) => {
   event.deltaY > 0 ? selector.keyDown({code: 'ArrowLeft'}) : selector.keyDown({code: 'ArrowRight'});
});

document.addEventListener('keydown', (event) => {
   if(modal.state) return;

   const code = event.code;

   if (keyActions[code]) {
      keyActions[code](event);
   }
   else if (code.startsWith('Arrow')) {
      handleArrows(event);
   }
   else if (code.startsWith('Numpad')) {
      handleNumpadDigits(event);
   }
});
