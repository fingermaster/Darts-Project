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

document.onclick = async (clickEvent) => {
   if (clickEvent.target.tagName !== 'BUTTON' &&
         modal.state === true &&
         !modal.isOnModal(clickEvent.x, clickEvent.y)) {
      modal.hide();
   }
   if (clickEvent.target.id === 'start') {
      await Storage.NewPlayer([View('p1input').value, View('p2input').value]);
      Settings.p1 = View('p1input').value;
      Settings.p2 = View('p2input').value;
      Game.first = 'p1';
      setGameDataNames();
      await Game.new();
      modal.toggle();
   }
   if (clickEvent.target.parentNode.dataset.num) {
      selector.toIndex(clickEvent.target.parentNode.dataset.num);
   }
};
