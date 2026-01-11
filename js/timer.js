export class Timer {
   #interval = null;
   #lineId = 'line';

   constructor(onTimesUpEvent, timeLimitSec = 10, stepMs = 1000) {
      this.onTimesUp = typeof onTimesUpEvent === "function" ? onTimesUpEvent : () => {};
      this.limit = timeLimitSec * 1000;
      this.stepMs = stepMs;
      this.passed = 0;
      this.left = this.limit;
      this.switcher = false;
   }

   #getLine() {
      return document.getElementById(this.#lineId);
   }

   switchTimer() {
      const pie = this.#getLine();
      if (!this.switcher) {
         pie?.classList.remove('paused');
         this.startTimer();
      } else {
         pie?.classList.add('paused');
         clearInterval(this.#interval);
      }
      this.switcher = !this.switcher;
   }

   clearTimer() {
      clearInterval(this.#interval);
      this.left = this.limit;
      this.passed = 0;

      if (this.switcher) {
         const line = this.#getLine();
         if (line) {
            const parent = line.parentNode;
            const clone = line.cloneNode(true);
            line.remove();
            parent.append(clone);
         }
         this.startTimer();
      }
   }

   startTimer() {
      clearInterval(this.#interval); // Защита от наслоения интервалов
      this.#getLine()?.classList.add('active');

      this.#interval = setInterval(() => {
         this.passed += this.stepMs;
         this.left = Math.max(0, this.limit - this.passed);

         if (this.left <= 0) {
            this.clearTimer();
            this.onTimesUp();
         }
      }, this.stepMs);
   }
}
