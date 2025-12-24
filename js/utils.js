/**
 * @param radius number -  circle radius
 * @param angle number -  angle for calc
 * @param base?  0 -- (number) if necessary this param can change start angle
 * @param centerByZero?  false -- If the flag is set to 'true', then the center of the circle will be x: 0, y: 0
 * If 'false', then x: radius; y: radius
 * @param offset? {{x: 0, y: 0}} - offset params
 * @returns coords on circle by radius and angle {{x: number, y: number}}
 */
export const pointOnCircle = (radius, angle, base = 0, centerByZero = false, offset = {x:0, y:0}) => {
   angle = base + angle;
   return {
      x: offset.x + (centerByZero?0:radius) + Math.round(radius*Math.cos(angle*Math.PI/180)),
      y: offset.y + (centerByZero?0:radius) + Math.round(radius*Math.sin(angle*Math.PI/180))
   }
};

export const getRandomInt = (min, max) => {
   min = Math.ceil(min);
   max = Math.floor(max) + 1;
   return Math.floor(Math.random() * (max - min)) + min;
};

export const rand20 = () => {
   return getRandomInt(1, 20);
};

export const rand3 = () => {
   return getRandomInt(2, 3);
};

export const randDeck = () => {
   const res = {sector: 20, multiplier: 1};
   if (getRandomInt(1, 60) > 50) {
      if (getRandomInt(1, 15) < 10) {
         res.multiplier = 3;
      } else {
         res.multiplier = 4;
      }
   } else if (getRandomInt(1, 40) > 22) {
      res.multiplier = rand3();
      res.sector = rand20();
   } else {
      res.sector = rand20();
   }
   return res;
};

export const isEven = (someNumber) => {
   return (someNumber % 2 === 0);
};

export const ConsoleCSS = `padding: 4px 25px 1px 0; background: rgba(255, 199, 32, .5); color: #222; border-width: 0 2px 3px 0; border-style: groove; border-color: rgba(0,0,0,0.44); border-radius: 0px 50px 0 0;`;

export const BadConsoleCSS = `padding: 4px 25px 1px 0; background: rgba(255, 50, 32, .1); color: #F00; border-width: 0 2px 3px 0; border-style: groove; border-color: rgba(0,0,0,0.44); border-radius: 0px 50px 0 0;`;

let init = 1;
export const gameConsole = function (message, error = false) {
   console.info(`%c ${init++}. ${message} `, !error ? ConsoleCSS : BadConsoleCSS);
}
