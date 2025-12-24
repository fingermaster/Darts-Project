import { pointOnCircle } from "./utils.js";

const CONFIG = {
   output: 'selector',
   radius: 400,
   cssVariables: {
      '--angle': '90deg',
      '--circle': '800px',
      '--sector': 'calc(var(--circle) / 20)',
      '--sector-item': 'calc(var(--circle) / 20)',
      '--border-radius': '35px',
      '--transition': '350ms',
      '--selector-width': '80px',
      '--selector-height': '320px',
   },
   boardNums: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5],
}

export class Selector {
   OUTPUT;
   sector;
   offset = {
      x: CONFIG.radius - 20,
      y: CONFIG.radius - 20,
   };
   total = CONFIG.boardNums.length;
   position = {
      up: function () {
         this.now === 0 ? this.now = 4 : this.now--
      },
      down: function () {
         this.now === 4 ? this.now = 0 : this.now++
      },
      now: 1,
      index: 0,
      sector: CONFIG.boardNums[0]
   };

   constructor() {
      this._initial().finally(() => {
      });
   }

   async _initial() {
      this.OUTPUT = document.createElementNS("http://www.w3.org/1999/xhtml", 'div');
      this.OUTPUT.id = 'selectorCircle';
      await document.getElementById(CONFIG.output).appendChild(this.OUTPUT);
      await this.setCssProperty();
      this.drawDeck();
   }

   setCssProperty() {
      Object.entries(CONFIG.cssVariables).forEach(([key, value]) => {
         document.documentElement.style.setProperty(key, value);
      });
   }

   sectorElement(text, step, multiplier, className) {
      let div = document.createElement('div');
      switch (typeof className) {
         case "object":
            className.forEach(name => {
               div.classList.add(name);
            })
            break;
         case "string":
            div.classList.add(className);
            break
      }
      div.setAttribute('style', `
      position: absolute; 
      left: ${pointOnCircle(CONFIG.radius / multiplier, (360 / this.total) * step, 180, true, this.offset).x}px; 
      top: ${pointOnCircle(CONFIG.radius / multiplier, (360 / this.total) * step, 180, true, this.offset).y}px;`);
      div.innerText = text;
      return div;
   }

   drawDeck() {
      for (let i = 0; i < this.total; i++) {
         let wrapper = document.createElement('div');
         wrapper.classList.add('sector');
         wrapper.dataset.num = i;
         wrapper.append(this.sectorElement('x2', i, 0.8, 'x2'));
         wrapper.append(this.sectorElement(CONFIG.boardNums[i], i, 0.9, 'num'));
         wrapper.append(this.sectorElement('x3', i, 1.05, 'x3'));
         wrapper.append(this.sectorElement('25', i, 1.35, 'twentyFive'));
         wrapper.append(this.sectorElement('50', i, 1.6, 'fifty'));
         this.OUTPUT.append(wrapper);
      }
   }

   toPosition(position) {
      this.position.now = position;
      this.updateActive();
   }

   keyDown(event) {
      const actions = {
         'ArrowLeft': () => {
            this.position.index = (this.position.index <= 0) ? 19 : this.position.index - 1;
            this.toIndex(this.position.index, true, 1);
         },
         'ArrowRight': () => {
            this.position.index = (this.position.index >= 19) ? 0 : this.position.index + 1;
            this.toIndex(this.position.index, true, -1);
         },
         'ArrowUp': () => {
            this.position.up();
            this.updateActive();
         },
         'ArrowDown': () => {
            this.position.down();
            this.updateActive();
         }
      };

      actions[event.code]?.();
   }


   toIndex(index, byStep = false, direction = 1) {
      let angle = byStep ?
            parseInt(document.documentElement.style.getPropertyValue('--angle')) + (360 / this.total) * direction :
            90 - (360 / this.total) * parseInt(index);
      document.documentElement.style.setProperty("--angle", angle + 'deg');
      this.position.now = 1;
      this.position.index = parseInt(index);
      this.position.sector = CONFIG.boardNums[parseInt(index)];
      this.updateActive();
   }

   toSector(sector) {
      this.toIndex(CONFIG.boardNums.indexOf(sector));
   }

   updateActive() {
      // Находим единственный элемент с классом active и удаляем его (если он есть)
      this.OUTPUT.querySelector('.active')?.classList.remove('active');

      // Находим новый нужный элемент по индексам и добавляем класс
      const sector = this.OUTPUT.childNodes[this.position.index];
      const item = sector?.childNodes[this.position.now];

      item?.classList.add('active');
   }

   enter() {
      const multiplierMap = [
         { x: 2, sector: this.position.sector }, // 0 (x2)
         { x: 1, sector: this.position.sector }, // 1 (num)
         { x: 3, sector: this.position.sector }, // 2 (x3)
         { x: 1, sector: 25 },                   // 3 (25)
         { x: 1, sector: 50 }                    // 4 (50)
      ];

      return multiplierMap[this.position.now] || { x: 1, sector: 0 };
   }
}
