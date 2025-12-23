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
   },

   // Заменяет манипуляции в getMainInfo
   drawMainInfo: (p1Data, p2Data) => {
      View('p1score').innerHTML = p1Data.scoreHtml;
      View('p2score').innerHTML = p2Data.scoreHtml;
      View('p1progress').style.width = p1Data.width;
      View('p2progress').style.width = p2Data.width;
   },

   // Заменяет манипуляции в getPlayerPoints
   drawPlayerPoints: (playerKey, items) => {
      const container = View(playerKey === 'playerOne' ? 'p1shots' : 'p2shots');
      container.innerHTML = '';
      items.forEach(item => {
         let div = document.createElement('div');
         div.className = !item.status ? 'bad' : '';
         div.innerHTML = `${item.sector}${item.x > 1 ? 'x' + item.x : ''}`;
         container.append(div);
      });
   },

   // Заменяет манипуляции в showHint
   drawHint: (p1Html, p2Html) => {
      View('p1sX').innerHTML = p1Html;
      View('p2sX').innerHTML = p2Html;
   },

   // Заменяет манипуляции в latestThrows
   drawLatestThrows: (shotsHtml) => {
      const container = View('latestThrows');
      container.innerHTML = '';
      shotsHtml.forEach(html => {
         let div = document.createElement('div');
         div.className = 'shot';
         div.innerHTML = html; // Здесь уже собранный внутренний HTML
         container.append(div);
      });
   }
};


(function() {
   const ElementID = [
      'gameInfo', 'toFinish', 'x3and25', 'overshootSkip', 'randInput',
      'randInput20', 'p1', 'p1progress', 'p1shots', 'p1score',
      'p1temp', 'p1sX', 'p2', 'p2progress', 'p2shots', 'p2score',
      'p2temp', 'p2sX', 'p1input', 'p2input', 'playersSelect',
      'fireworks', 'winnerName', 'latestThrows'
   ];

   const View = (id) => {
      if (ElementID.includes(id)) {
         return document.getElementById(id);
      } else {
         console.warn(`Attempted to access unknown element ID: ${id}`);
         return null;
      }
   };

   // !!! ТОТ САМЫЙ ПРОБРОС:
   window.View = View;

   // TODO: Когда весь проект станет модульным:
   // 1. Убрать обертку (function() { ... })();
   // 2. Удалить строку window.View = View;
   // 3. Добавить в начале: export { View };
})();
