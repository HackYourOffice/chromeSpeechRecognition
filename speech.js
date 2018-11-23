let recognized = false;
let continousListenOn = false;

function httpGetAsyncJson(theUrl, callback) {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      const jsonData = JSON.parse(xmlHttp.responseText);
      callback(jsonData);
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous

  xmlHttp.send();
}

function httpGetAsyncText(theUrl, callback) {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(xmlHttp.responseText);
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous

  xmlHttp.send();
}

class Command {

  constructor(name, doFn, hitFn) {
    this.name = name;
    this.hitFn = hitFn;
    this.doFn = doFn;
  }

  hit(text) {
    if (typeof this.hitFn === 'function') {
      return this.hitFn(text);
    }
    return text === this.name;
  }

  do() {
    this.doFn();
  }
}

window.commandList = [];


const output = document.getElementById('output');
const ask = document.getElementById('ask');
const start = document.getElementById('start');
const messages = [];

console.log('test');
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const say = (text, lang = 'de') => {

  console.debug(`say: ${text}`);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang; //Sprache auf Deutsch festlegen
  speechSynthesis.speak(utterance);
};

const sayRoomTemperature = (roomName) => {
  // chrome CORS plugin needed
  httpGetAsyncJson(`http://openhab-test.synyx.coffee:8080/rest/items/${roomName}_Temperature_Current`, (event) => {
    console.log(event.state);
    const temperature = event.state;
    const room = event.name.split('_')[0];
    say(`Es sind ${temperature} Grad`);
  });
};

const recognize = () => {
  console.log('start recognition');

  const recognition = new SpeechRecognition();
  recognition.lang = 'de'; //Sprache auf Deutsch festlegen

  recognition.onresult = function (event) {
    if (event.results.length > 0) {
      const msg = event.results[0][0].transcript;
      messages.push(msg);

      output.innerText = JSON.stringify(messages);

      console.log('finished');
      console.log(msg); //erstes Ergebnis ausgeben

      window.commandList.forEach(cmd => {
        if (cmd.hit(msg)) {
          cmd.do();
        }
      });
    }
  };


  recognition.onaudiostart = function(event) {
    console.log('onaudiostart ', event);
  };

  recognition.onaudioend = function(event) {
    console.log('onaudioend ', event);

    setTimeout(() => {
      if (continousListenOn) {
        recognized = false;
        continousListen();
      }
    }, 1000);
  };

  recognition.start();
};

ask.addEventListener('click', () => {
  continousListenOn = false;
  recognize();
});

const continousListen = () => {
  const grammar = '#JSGF V1.0; grammar keyword; public <keyword> = hallo | test ;';
  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'de'; //Sprache auf Deutsch festlegen
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onaudiostart = () => console.log('onaudiostart');
  recognition.onaudioend = () => console.log('onaudio');
  recognition.onspeechstart = () => console.log('onspeechstart');
  recognition.onspeechend = () => console.log('onspeechend');
  recognition.onsoundstart = () => console.log('onsoundstart');
  recognition.onsoundend = () => console.log('onsoundend');
  recognition.onstart = () => console.log('onstart');
  recognition.onend = () => {
    console.log('onend');

    if (!recognized) {
      setTimeout(continousListen, 1);
    }

  };
  recognition.onerror = (e) => console.log('onerror ', e);
  recognition.onresult = (e) => {
    const result = e.results[0][0];
    console.log('onresult ', result);

    if (result.transcript === 'Hallo Computer') {
      recognized = true;
      say('Ja?');
      setTimeout(recognize, 1000);

    }
  };

  recognition.start();
};
recognized = false;
start.addEventListener('click', () => {
  continousListenOn = true;
  recognized = false;
  continousListen();
});