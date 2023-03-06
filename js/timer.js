class Timer {
   passed = 0;
   limit = 10;
   stepMs = 1000;
   left = this.limit;
   interval = null;
   output = document.getElementById('timer');
   switcher = false;

   constructor(onTimesUpEvent, timeLimitSec = 10, stepMs = 1000) {
      if (typeof onTimesUpEvent === "function") {
         this.onTimesUp = onTimesUpEvent;
      }
      this.limit = timeLimitSec * 1000;
      this.stepMs = stepMs;
   }

   onTimesUp = (e) => {
      console.log(e)
   };

   switchTimer() {
      if (!this.switcher) {
         document.getElementById('pie').classList.remove('paused');
         this.startTimer();
      } else {
         document.getElementById('pie').classList.add('paused');
         clearInterval(this.interval);
      }
      this.switcher = !this.switcher;
   }

   clearTimer() {
      clearInterval(this.interval);
      this.left = this.limit;
      this.passed = 0;
      if (this.switcher) {
         let parent = document.getElementById('pie').parentNode;
         let clone = document.getElementById('pie').cloneNode(3);
         document.getElementById('pie').remove();
         parent.append(clone);
         this.startTimer();
      }
   }

   startTimer() {
      // this.switcher = true;
      document.getElementById('pie').classList.add('active');
      this.interval = setInterval(() => {
         this.passed = this.passed + this.stepMs;
         this.left = this.limit - this.passed;
         this.output.innerHTML = (this.left / 1000).toFixed(1);
         if (this.left === 0) {
            this.clearTimer();
            this.onTimesUp();
         }
      }, this.stepMs);
   }
}
