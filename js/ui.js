const UI = {
   updateSettingsView: (key, value) => {
      const container = View(key);
      if (!container) return;

      Array.from(container.children).forEach((child, index) => {
         // Для кнопок (индексы или data-value)
         const btnValue = parseInt(child.dataset.value);
         if (btnValue === value || index === value) {
            child.classList.add('active');
         } else {
            child.classList.remove('active');
         }
      });
   },

   renderInfoBar: (settings) => {
      View('gameInfo').innerHTML = `
        <div class="name">#${settings.current} ${settings.toFinish}</div>
        <div>
            <div class="players">${settings.p1} vs ${settings.p2}</div>
            ( finish mode: ${settings.x3and25 === 1 ? 'x3 and 25' : 'without x3 and 25'}; 
              overshot: ${settings.overshootSkip === 1 ? 'skip' : 'don\'t skip'} )
        </div>`;
   },

   updatePlayerNames: (p1, p2) => {
      View('p1').textContent = p1;
      View('p2').textContent = p2;
   }
};
