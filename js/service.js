const output = document.getElementById('output');
const testrand = document.getElementsByClassName('testrand');

const Scripts = [
	"./myJsLib.js",
	"./js/db.js",
	"./js/deck.js",
	"./js/selector.js",
	"./js/timer.js",
	"./js/storage.js",
	"./js/game.js",

	// "./js/interface.js",
	// "./js/stats.js",
];

const ConsoleCSS = `padding: 4px 25px 1px 0; background: rgba(255, 199, 32, .5); color: #222; border-width: 0 2px 3px 0; border-style: groove; border-color: rgba(0,0,0,0.44); border-radius: 0px 50px 0 0;`;
const BadConsoleCSS = `padding: 4px 25px 1px 0; background: rgba(255, 50, 32, .1); color: #F00; border-width: 0 2px 3px 0; border-style: groove; border-color: rgba(0,0,0,0.44); border-radius: 0px 50px 0 0;`;
const InfoConsoleCSS = `padding: 10px 20px; background: rgba(100, 190, 32, .1); color: #000; border-width: 1px; border-style: dashed; border-color: #000; border-radius:  10px; font-size: 16px`;
let init = 1;

const gameConsole = function (message, error = false) {
	console.info(`%c ${init++}. ${message} `, !error ? ConsoleCSS : BadConsoleCSS);
}

function addScript(url){
	let httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', url, false);
	try {
		httpRequest.send();
		if (httpRequest.status === 200) {
			let script = document.createElement('script');
			script.src = url;
			document.getElementsByTagName('head')[0].appendChild(script);
		} else {
			throw (`"${httpRequest.responseURL}" - ${httpRequest.statusText} ${httpRequest.status}`);
		}
		gameConsole(`"${httpRequest.responseURL}" - ${httpRequest.statusText} ${httpRequest.status}`);
	} catch(error) {
		gameConsole(error, true);
	}
}
Scripts.forEach(script => {
	addScript(script);
});



function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max)+1;
	return Math.floor(Math.random() * (max - min)) + min;
}

function rand20(){ return getRandomInt(1,20); }
function rand20alt(){
	let x = 10000;
	let rr = Math.trunc((getRandomInt(10*x,31*x-1)-10*x)/x);
	if(rr === 0){
		getRandomInt(1,20);
	} else {
		return rr;
	}
}

function rand20h(){
	let tens = getRandomInt(0,1);
	if(tens === 0) return getRandomInt(1,10);
	else return Math.trunc(getRandomInt(111,209)/10);
}

function rand3(){	return getRandomInt(2,3); }

function randDeck(){
	const res = {sector: 20, multipler: 1};
	if(getRandomInt(1,60)>50){
		if(getRandomInt(1,15) < 10) { res.multipler = 3; }
		else { res.multipler = 4; }
	} else if(getRandomInt(1,40) > 22) {
		res.multipler = rand3();
		res.sector = rand20();
	} else {
		res.sector = rand20();
	}
	return res;
}

function testRands(){
	let rands = {
		first: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		second: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		alt: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	};
	output.innerHTML = '';
	for(let i = 0;i<2000;i++){
		rands.first[rand20()-1]++;
		rands.second[rand20alt()-1]++;
		rands.alt[rand20h()-1]++;
	}
	for(let i = 0; i<20; i++){
		testrand[0].getElementsByClassName('rand-col')[i].innerHTML = `${i+1}<span>${rands.first[i]}</span>`;
		testrand[0].getElementsByClassName('rand-col')[i].style.fontSize = rands.first[i]/5 + 10 + 'pt';
		testrand[1].getElementsByClassName('rand-col')[i].innerHTML = `${i+1}<span>${rands.second[i]}</span>`;
		testrand[1].getElementsByClassName('rand-col')[i].style.fontSize = rands.second[i]/5 + 10 + 'pt';
		testrand[2].getElementsByClassName('rand-col')[i].innerHTML = `${i+1}<span>${rands.alt[i]}</span>`;
		testrand[2].getElementsByClassName('rand-col')[i].style.fontSize = rands.alt[i]/5 + 10 + 'pt';
	}
	console.log(rands);
}

const isEven = function (someNumber) {
	return (someNumber % 2 === 0);
};

/*const isThird = function (someNumber) {
	return (someNumber % 3 === 0);
};*/

const isCorrect = function (sector, x, left) {
	if (sector * x > left) return false;
	if (sector * x < left - 1) return true;
	if (sector * x === left) {
		if (x === 2 || sector === 50) return true;
		else return (Settings.x3and25 && x > 1) || (Settings.x3and25 && sector === 50) || (Settings.x3and25 && sector === 25);
	}
};

function inScope(name){
	return name === document.body.dataset.scope;
}



function msToTime(ms) {
	let sec, min, hrs, days;
	sec = (ms / 1000).toFixed(0);
	min = (ms / (1000 * 60)).toFixed(0);
	hrs = (ms / (1000 * 60 * 60)).toFixed(0);
	days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);

	if(sec>60) sec = sec-min*60;

	return ` ${min} min ${sec} sec`;
}

function dateFormat(fulldate){
	return `${fulldate.getFullYear()}-${fulldate.getMonth()}-${fulldate.getDate()} ${fulldate.getHours()}:${fulldate.getMinutes()}`;
}

/*function toggleFullScreen() {
	const full = {
		off:"M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z",
		on:"M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"}
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
		fullico.setAttribute('d',full.on);
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
			fullico.setAttribute('d',full.off);
		}
	}
}*/

function syntaxHighlight(json) {
	if (typeof json != 'string') {
		json = JSON.stringify(json, undefined, 2);
	}
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'key';
			} else {
				cls = 'string';
			}
		} else if (/true|false/.test(match)) {
			cls = 'boolean';
		} else if (/null/.test(match)) {
			cls = 'null';
		}
		return '<span class="' + cls + '">' + match + '</span>';
	});
}



