deck = function (output = VxBoard) {
   function copyUse(id, css, rotate, data = []) {
      let useElement = document.createElementNS("http://www.w3.org/2000/svg", 'use');
      useElement.setAttribute('class', css);
      useElement.setAttribute('href', `#${id}`);
      useElement.setAttribute('transform', `rotate(${rotate})`);
      if (data[0] >= 0) useElement.dataset.point = data[0];
      if (data[1]) useElement.dataset.x = data[1];
      output.append(useElement);
   }

   function createText(txt, angle, radius, scale = 1, fill = "#FFF") {
      let textElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      textElement.setAttribute('fill', fill);
      textElement.setAttribute('y', "0.7ex");
      textElement.setAttribute('transform', `translate(${mjsl.pointOnCircle(radius, angle, 0, true).x}, ${mjsl.pointOnCircle(radius, angle, 0, true).y}) scale(${scale})`);
      textElement.innerHTML = txt;
      output.append(textElement);
   }

   let circleParts = 24;
   for (let i = 0; i < circleParts; i++) {
      copyUse('milk', '', (10 + i * 360 / circleParts), [0, 1]);
   }

   copyUse('milkarea', 'alpha', 0, [0, 1]);
   for (let el in boardNums) {
      let angle = (360 / boardNums.length) * el - 90;
      copyUse('x1', isEven(el) ? 'white-sector' : 'black-sector', angle);
      copyUse('x2', isEven(el) ? 'green-sector' : 'red-sector', angle);
      copyUse('x3', isEven(el) ? 'green-sector' : 'red-sector', angle);
      // createText(boardNums[el], angle, 115, 1, isEven(el)?'#FFF':'#000');
   }

   for (let el in boardNums) {
      let angle = (360 / boardNums.length) * el - 90;
      createText(boardNums[el], angle, 115, 1, isEven(el) ? '#FFF' : '#000');
   }

   circleParts = 20;
   for (let i = 0; i < circleParts; i++) {
      copyUse('x2text', '', (5 + i * 360 / circleParts), [1, 2]);
      copyUse('x3text', '', (2 + i * 360 / circleParts), [1, 2]);
   }

   for (let el in boardNums) {
      let angle = (360 / boardNums.length) * el - 90;
      copyUse('x1', 'alpha', angle + 90, [boardNums[el], 1]);
      copyUse('x2', 'alpha', angle + 90, [boardNums[el], 2]);
      copyUse('x3', 'alpha', angle + 90, [boardNums[el], 3]);
   }

   copyUse('points25', 'green-sector', 30, [25, 1]);
   copyUse('bulleye', 'red-sector', 10, [50, 1]);

   circleParts = 6;
   for (let i = 0; i < circleParts; i++) {
      copyUse('twentyfive', '', (15 + i * 360 / circleParts), [25, 1]);
   }
   copyUse('points25', 'alpha', 30, [25, 1]);
   copyUse('bulleye', 'alpha', 10, [50, 1]);
}
