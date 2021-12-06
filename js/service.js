var scripts = [
	"js/db.js", 
	"js/stats.js",
	"js/interface.js",
];


const settings = {toFinish: 39, x3and25: 1, overshootSkip:0}; 



function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max)+1;
	return Math.floor(Math.random() * (max - min)) + min;
}

function rand20alt(){ return getRandomInt(1,20); }
function rand20(){	
	let x = 10000;
	let rr = Math.trunc((getRandomInt(10*x,31*x-1)-10*x)/x);
	if(rr == 0){
		getRandomInt(1,20);
	} else {
		return rr;
	}
	
}
function rand20h(){
	
	let tens = getRandomInt(0,1);
	if(tens == 0) return getRandomInt(1,10);
	else return Math.trunc(getRandomInt(111,209)/10);	
	
	// return Math.trunc(getRandomInt(10000,209999)/10000);
}
function rand3(){	return getRandomInt(2,3); }
function randDeck(){
	if(getRandomInt(1,60)>50){
		if(getRandomInt(1,15) < 10) { return 25; } 
		else { return 50; }
	} else if(getRandomInt(1,40) > 22) {
		return `${rand20()}x${rand3()}`
	} else {
		return `${rand20()}x1`
	}
}

function testRands(){
	let rands = {first: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],second: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], alt: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
	output.innerHTML = '';
	for(let i = 0;i<2000;i++){
		rands.first[rand20()-1]++;
		rands.second[rand20alt()-1]++;
		rands.alt[rand20h()-1]++;
	}
	for(let i = 0; i<20; i++){
		document.getElementsByClassName('testrand')[0].getElementsByClassName('rand-col')[i].innerHTML = `${i+1}<span>${rands.first[i]}</span>`;
		document.getElementsByClassName('testrand')[0].getElementsByClassName('rand-col')[i].style.fontSize = rands.first[i]/5 + 10 + 'pt';
		document.getElementsByClassName('testrand')[1].getElementsByClassName('rand-col')[i].innerHTML = `${i+1}<span>${rands.second[i]}</span>`;
		document.getElementsByClassName('testrand')[1].getElementsByClassName('rand-col')[i].style.fontSize = rands.second[i]/5 + 10 + 'pt';
		document.getElementsByClassName('testrand')[2].getElementsByClassName('rand-col')[i].innerHTML = `${i+1}<span>${rands.alt[i]}</span>`;
		document.getElementsByClassName('testrand')[2].getElementsByClassName('rand-col')[i].style.fontSize = rands.alt[i]/5 + 10 + 'pt';
	}	
	console.log(rands);
}




var ConsoleCSS = `
padding: 4px 25px 1px 0;
background: rgba(255, 199, 32, .8); color: #222;
border-width: 0 2px 3px 0; border-style: groove; 
border-color: rgba(0,0,0,0.44); 
border-radius: 0px 50px 0 0;`;
var init = 1;

var isEven = function(someNumber) {
  return (someNumber % 2 == 0) ? true : false;
};
var isThird = function(someNumber) {
  return (someNumber % 3 == 0) ? true : false;
};
var	isCorrect = function(sector, x, left){
	if(sector*x>left) return false;
	if(sector*x<left-1) return true;
	if(sector*x == left){
		if(x == 2 || sector == 50) return true;	
		else if((settings.x3and25 && x > 1) || (settings.x3and25 && sector == 50) || (settings.x3and25 && sector == 25)) return true;	//
		else return false;
	}
};

function inScope(name){	
	if(name == document.body.dataset.scope) return true;
	else return false;
}

function addScript(url){
	let script = document.createElement('script');
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
	console.info(`%c ${init++}. ${url} Added `, ConsoleCSS);
	/*script.onload = function(e){
		console.log(e);
	}*/
}

scripts.forEach(function(el){addScript(el)});

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

function toggleFullScreen() {
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
}


const timerView = document.getElementById('timer');
var timer = function(limit = 20){
	let timePassed = 0;
	let timeLeft = limit;
	let timerInterval = null;
	timerView.innerHTML = `${timeLeft}`;
	
	function onTimesUp() {
	  clearInterval(timerInterval);
	}

	function startTimer() {
	  timerInterval = setInterval(() => {
		timePassed = timePassed += 1;
		timeLeft = limit - timePassed;
		timerView.innerHTML = timeLeft;		
		if (timeLeft === 0) {
		  onTimesUp();
		}
	  }, 1000);
	}
	startTimer();
}
var Timer = {
	passed: 0,
	limit: 20,
	left: this.limit,
	interval: null,	
	onTimesUp: function() {clearInterval(this.interval)},
	startTimer: function(output) {
	  this.interval = setInterval(() => {
		this.passed++;
		this.left = this.limit - this.passed;
		output(this.left);
		if (this.left === 0) {
		  this.onTimesUp();
		}
	  }, 1000);
	},
};
/*
var t1 = Object.create(Timer);
t1.startTimer(function(t){document.getElementById('timer').innerHTML = t;})
*/