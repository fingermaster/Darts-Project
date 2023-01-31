const CONFIG = {
    output: 'selector',
    radius: 400,
    cssVariables: `--angle: 90deg; --circle: 800px; --sector: calc(var(--circle) / 20); --sector-item: calc(var(--circle) / 20); --border-radius: 35px; --transition: 350ms; --selector-width: 80px; --selector-height: 220px;`,
    boardNums: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5],
}

class Selector {
    OUTPUT;
    sector;
    level = 1;
    step = 360/CONFIG.boardNums.length;
    offset = {
        x: CONFIG.radius - 20,
        y: CONFIG.radius - 20,
    };
    total = CONFIG.boardNums.length;


    constructor() {
        this._initial().finally(()=>{
        });
    }

    async _initial() {
        this.OUTPUT = document.createElementNS("http://www.w3.org/1999/xhtml", 'div');
        this.OUTPUT.id = 'selectorCircle';
        await document.getElementById(CONFIG.output).appendChild(this.OUTPUT);
        await this.setCssProperty();
        this.drawDeck();
    }

    async setCssProperty(){
        let props = CONFIG.cssVariables.split(/;\s*/);
        props.forEach(prop => {
            if(prop.length > 0){
                let newProp = prop.split(':');
                document.documentElement.style.setProperty(newProp[0],newProp[1]);
            }
        })
        // console.log(props);
    }

    sectorElement(text, step, multiplier, className){
        let div = document.createElement('div');
        switch (typeof className) {
            case "object":
                className.forEach(name => {div.classList.add(name);})
                break;
            case "string":
                div.classList.add(className);
                break
        }
        div.setAttribute('style', `position: absolute; left: ${mjsl.pointOnCircle(CONFIG.radius/multiplier, (360/this.total)*step, 180, true, this.offset).x}px; top: ${mjsl.pointOnCircle(CONFIG.radius/multiplier, (360/this.total)*step, 180, true, this.offset).y}px;`);
        div.innerText = text;
        return div;
    }

    drawDeck(){
        for (let i = 0; i < this.total; i++) {
            let wrapper = document.createElement('div');
            wrapper.classList.add('sector');
            wrapper.dataset.num = i;
            wrapper.append(this.sectorElement('x2', i, 1, 'x2'));
            wrapper.append(this.sectorElement(CONFIG.boardNums[i], i, 1.11, 'num'));
            wrapper.append(this.sectorElement('x3', i, 1.24, 'x3'));
            wrapper.append(this.sectorElement('25', i, 1.5, 'twentyFive'));
            wrapper.append(this.sectorElement('50', i, 1.7, 'fifty'));

            document.getElementById('selectorCircle').append(wrapper);
        }
    }
    position = {
        up: function (){
            this.now === 0 ? this.now = 4 : this.now--
        },
        down: function (){
            this.now === 4 ? this.now = 0 : this.now++
        },
        now: 1,
        index: 0,
        sector: CONFIG.boardNums[0]
    };

    keyDown(event){
        // console.log(event);
        let angleValue = parseInt(document.documentElement.style.getPropertyValue('--angle'));
        let angleStep = 360/this.total;
        switch (event.code) {
            case 'ArrowRight': {
                document.documentElement.style.setProperty("--angle", (angleValue-angleStep)+'deg');
                this.position.now = 1;
                break;
            }
            case 'ArrowLeft': {
                document.documentElement.style.setProperty("--angle", (angleValue+angleStep)+'deg');
                this.position.now = 1;
                break;
            }
        }
    }

    toIndex(index){
        let angleStep = 90-(360/this.total)*parseInt(index);
        document.documentElement.style.setProperty("--angle", (angleStep)+'deg');
        this.position.now = 1;
        this.position.index = parseInt(index);
        this.position.sector = CONFIG.boardNums[parseInt(index)];
        this.updateActive();
    }

    toSector(sector){
        this.toIndex(CONFIG.boardNums.indexOf(sector));
    }

    updateActive(){
        console.log(this.position.index);
        document.getElementById('selectorCircle').childNodes.forEach(el => {el.childNodes.forEach(subEl => {subEl.classList.remove('active')})})
        document.getElementById('selectorCircle').childNodes[this.position.index].childNodes[this.position.now].classList.add('active');
    }

    keyUp(event){
        let angleValue = parseInt(document.documentElement.style.getPropertyValue('--angle'))-90;
        let indexBoard = this.total - Math.abs(angleValue/this.step%this.total < 0 ? this.total + angleValue/this.step%this.total : angleValue/this.step%this.total);
        this.position.index = indexBoard === this.total ? 0 : indexBoard;
        this.position.sector = CONFIG.boardNums[this.position.index];
        switch (event.code) {
            case 'ArrowUp': {
                this.position.up();
                break;
            }
            case 'ArrowDown': {
                this.position.down();
                break;
            }
        }
        this.updateActive();
    }

    enter(){
        let output = {x: 1, sector: 20}
        switch (this.position.now){
            case 0: {
                output.x = 2;
                output.sector = this.position.sector;
                break
            }
            case 1: {
                output.x = 1;
                output.sector = this.position.sector;
                break
            }
            case 2: {
                output.x = 3;
                output.sector = this.position.sector;
                break
            }
            case 3: {
                output.x = 1;
                output.sector = 25;
                break
            }
            case 4: {
                output.x = 1;
                output.sector = 50;
                break
            }
        }
        return output;
    }
    space(){
        return {x: 1, sector: 0};
    }
}
