window.document.onkeydown = (event) => {
   if(modal.state) return;

   let selected;
   if(typeof event.code !== "string") return;
   switch (event.code) {
      case 'Digit1':
         Game.first = 'p1';
         break;
      case 'Digit2':
         Game.first = 'p2';
         break;
      case 'Space':
         event.preventDefault();
         sendShot(0, 1);
         timer.clearTimer();
         break;
      case 'Backspace':
         event.preventDefault();
         Game.cancelLastHit();
         timer.clearTimer();
         break;
      case 'Enter':
         selected = selector.enter();
         sendShot(selected.sector, selected.x);
         timer.clearTimer();
         break;
      case 'NumpadEnter':
         selected = selector.enter();
         sendShot(selected.sector, selected.x);
         timer.clearTimer();
         break;
      case 'Pause':
         timer.switchTimer();
         break;
      case 'NumpadDivide':
         randomGenerator.all();
         break;
      case 'NumpadMultiply':
         randomGenerator.sector();
         break;
      default:
         if (event.code.includes('Arrow')) {
            selector.keyDown(event);
         }
         if (event.code.includes('Numpad')) {
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
            // selector.keyDown(event);
         }
         break;
   }
}
onwheel = (event) => {
   event.deltaY > 0 ? selector.keyDown({code: 'ArrowLeft'}) : selector.keyDown({code: 'ArrowRight'});
};

//словарь действий
const clickActions = {
   start: async () => {
      await Storage.NewPlayer([View('p1input').value, View('p2input').value]);
      Settings.p1 = View('p1input').value;
      Settings.p2 = View('p2input').value;
      Game.first = 'p1';
      setGameDataNames();
      await Game.new();
      modal.toggle();
   },
   newGame: () => {
      Game.new();
   },
   cancelHit: () => {
      Game.cancelLastHit();
   },
   modalToggle: () => {
      modal.toggle();
   },
   toFinish: (btn) => {
      const value = parseInt(btn.dataset.value);
      Settings.toFinish = value;
      console.log(value);
   },
   x3and25: (btn) => {
      const value = parseInt(btn.dataset.value);
      console.log(typeof value);
      Settings.x3and25 = value;
   },
   overshoot: (btn) => {
      const value = parseInt(btn.dataset.value);
      Settings.overshootSkip = value;
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
      console.log(value);
   },
};

document.addEventListener('click', (event) => {
   if (event.target.tagName !== 'BUTTON' &&
         modal.state === true &&
         !modal.isOnModal(event.x, event.y)) {
      modal.hide();
   }

   const btn = event.target.closest('[data-action]');
   const action = btn?.dataset.action;
   if (action && typeof clickActions[action] === 'function') {
      clickActions[action](btn);   //вызываем действие из словаря
   }

   //Переходим на нужный сектор
   if (event.target.parentNode.dataset.num) {
      selector.toIndex(event.target.parentNode.dataset.num);
   }
});

document.addEventListener('change', (event) => {
   const el = event.target.closest('[data-action]');
   if (el && changeActions[el.dataset.action]) {
      changeActions[el.dataset.action](el);
   }
});

