const ElementID = [
   'gameInfo', 'toFinish', 'x3and25', 'overshootSkip', 'randInput',
   'randInput20', 'p1', 'p1progress', 'p1shots', 'p1score',
   'p1temp', 'p1sX', 'p2', 'p2progress', 'p2shots', 'p2score',
   'p2temp', 'p2sX', 'p1input', 'p2input', 'playersSelect',
   'fireworks', 'winnerName'
];

export const View = (id) => {
   if (ElementID.includes(id)) {
      return document.getElementById(id);
   } else {
      console.warn(`Attempted to access unknown element ID: ${id}`);
      return null;
   }
};

export const UI = {
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

   drawHint: (p1Html, p2Html) => {
      View('p1sX').innerHTML = p1Html;
      View('p2sX').innerHTML = p2Html;
   },

   toggleActivePlayer: (player) => {
      View('p1').classList.toggle('active', player === 'p1');
      View('p2').classList.toggle('active', player === 'p2');
   },

   clearHints: () => {
      View('p1sX').innerHTML = View('p2sX').innerHTML = '';
   },

   resetBoard: (toFinish) => {
      View('p1shots').innerHTML = View('p2shots').innerHTML = '';
      View('p1score').innerHTML = toFinish;
      View('p2score').innerHTML = toFinish;
      View('fireworks').style.display = 'none';
   },

   showWinScreen: (winner) => {
      View('fireworks').style.display = 'flex';
      View('winnerName').innerHTML = `${winner} WON!`;
   },

   hideWinScreen: () => {
      View('fireworks').style.display = 'none';
   },

   updateTempScore: (playerKey, sessionValue) => {
      const id = playerKey === 'playerOne' ? 'p1temp' : 'p2temp';
      View(id).innerHTML = sessionValue !== 0 ? sessionValue : '';
   },
   clearGameDisplay: () => {
      View('p1shots').innerHTML = '';
      View('p2shots').innerHTML = '';
      View('p1score').innerHTML = '';
      View('p2score').innerHTML = '';
      View('p1temp').innerHTML = '';
      View('p2temp').innerHTML = '';
   },

   drawPlayerHeaders: (p1, p2) => {
      View('p1').innerHTML = p1;
      View('p2').innerHTML = p2;
   },

   setupPlayerForm: (p1, p2, playersList) => {
      View('p1input').value = p1;
      View('p2input').value = p2;

      const select = View('playersSelect');
      select.innerHTML = '';
      playersList.forEach(el => {
         const option = document.createElement('option');
         option.value = el.name;
         option.className = 'selectplayer';
         option.dataset.playerName = el.name;
         option.textContent = el.name;
         select.append(option);
      });
   },

   toggleModal(state, data) {
      const modalEl = document.querySelector('.modal');
      if (state) {
         if (data) this.setupPlayerForm(data.p1, data.p2, data.names);
         modalEl.classList.add('show');
      } else {
         modalEl.classList.remove('show');
      }
   },

   getModalBounds() {
      return document.querySelector('.modal').getBoundingClientRect();
   }
};
