/**
 * Генерирует оригинальную SVG доску для дартса с зоной Milk.
 */
export function generateDartsBoard(containerElement, boardNums = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]) {

   const styles = `
        <style>
            .white-sector { fill: #f9f9f9; stroke: #444; stroke-width: 0.2; }
            .black-sector { fill: #333; stroke: #444; stroke-width: 0.2; }
            .red-sector { fill: #e3292e; stroke: #222; stroke-width: 0.3; }
            .green-sector { fill: #309143; stroke: #222; stroke-width: 0.3; }
            .alpha { fill: transparent; cursor: pointer; pointer-events: all; }
            .alpha:hover { fill: rgba(255,255,255,0.1); }
            text { font-family: Arial, sans-serif; font-weight: bold; user-select: none; pointer-events: none; }
            .milk-text { fill: rgba(255,255,255,0.5); font-size: 14px; text-transform: uppercase; }
        </style>
    `;

   const defs = `
        <defs>
            <path id="x1" d="M -5,-30 A 40,40 0 0 1 5,-30 L 21,-133 A 133,133 0 0 0 -21,-133 Z" />
            <path id="x2" d="M -21,-133 A 133,133 0 0 1 21,-133 L 24,-152 A 152,152 0 0 0 -24,-152 Z" />
            <path id="x3" d="M -12,-76 A 76,76 0 0 1 12,-76 L 15,-95 A 95,95 0 0 0 -15,-95 Z" />
            <circle id="p25" cx="0" cy="0" r="32" />
            <circle id="p50" cx="0" cy="0" r="12" />
            <!-- Путь для текста Milk по кругу -->
            <path id="milkCircle" d="M -165,0 A 165,165 0 1 1 165,0 A 165,165 0 1 1 -165,0" />
        </defs>
    `;

   let content = "";
   const isEven = (n) => n % 2 === 0;

   // Зона Milk (Прозрачный круг для промахов)
   content += `<circle cx="0" cy="0" r="180" class="alpha" data-point="0" data-x="1" />`;

   // Текст Milk (повторяется 4 раза по кругу)
   for (let i = 0; i < 4; i++) {
      content += `
            <text class="milk-text">
                <textPath href="#milkCircle" startOffset="${i * 25 + 12}%">Milk</textPath>
            </text>`;
   }

   boardNums.forEach((num, i) => {
      const angle = (360 / boardNums.length) * i - 90;
      const mainClass = isEven(i) ? 'white-sector' : 'black-sector';
      const altClass = isEven(i) ? 'green-sector' : 'red-sector';

      content += `<use href="#x1" class="${mainClass}" transform="rotate(${angle})" />`;
      content += `<use href="#x2" class="${altClass}" transform="rotate(${angle})" />`;
      content += `<use href="#x3" class="${altClass}" transform="rotate(${angle})" />`;
   });

   // 3. Центр
   content += `<use href="#p25" class="green-sector" />`;
   content += `<use href="#p50" class="red-sector" />`;


   boardNums.forEach((num, i) => {
      const angle = (360 / boardNums.length) * i - 90;
      const rad = angle * Math.PI / 180;
      const x = 115 * Math.cos(rad); // Числа внутри секторов как в оригинале
      const y = 115 * Math.sin(rad);
      content += `<text x="${x}" y="${y}" fill="${isEven(i) ? '#333' : '#eee'}" font-size="14" text-anchor="middle" dominant-baseline="middle">${num}</text>`;
   });


   boardNums.forEach((num, i) => {
      const angle = (360 / boardNums.length) * i - 90;
      content += `<use href="#x1" class="alpha" transform="rotate(${angle})" data-point="${num}" data-x="1" />`;
      content += `<use href="#x2" class="alpha" transform="rotate(${angle})" data-point="${num}" data-x="2" />`;
      content += `<use href="#x3" class="alpha" transform="rotate(${angle})" data-point="${num}" data-x="3" />`;
   });
   content += `<use href="#p25" class="alpha" data-point="25" data-x="1" />`;
   content += `<use href="#p50" class="alpha" data-point="50" data-x="1" />`;

   const fullSvg = `
        <svg viewBox="-200 -200 400 400" xmlns="www.w3.org" style="width:100%; height:100%; display:block; background: transparent;">
            ${styles}
            ${defs}
            <g id="dartboard-ui">${content}</g>
        </svg>
    `;

   containerElement.innerHTML = fullSvg;
   return containerElement.querySelector('svg');
}
