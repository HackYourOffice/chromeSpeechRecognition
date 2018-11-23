let recognized = false;
let continousListenOn = false;

function httpGetAsync(theUrl, callback)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      var jsonData = JSON.parse(xmlHttp.responseText);
      callback(jsonData);
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous

  xmlHttp.send();
}

const commands = {
  help: 'welche Kommandos gibt es',
  beerAllowed: 'darf ich schon Bier trinken',
  roomNames: 'welche Räume gibt es',
  tempPokerraum: 'wie warm ist es in Pokerraum',
  tempWerkstatt: 'wie warm ist es in der Werkstatt',
  time: 'wie spät ist es',
  fuck: 'f*** dich'
};

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
  httpGetAsync(`http://openhab-test.synyx.coffee:8080/rest/items/${roomName}_Temperature_Current`, (event) => {
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

      if (msg === commands.beerAllowed) {
        say('zum wohl');
      }

      // http://www.icndb.com/api/
      if (msg === 'erzähl einen Witz') {
        httpGetAsync('http://api.icndb.com/jokes/random', (event) => {
          console.log('result: ', event);
          console.log(typeof event);
          const joke = event.value.joke;

          console.log(joke);
          say(joke, 'en');
        });
      }

      if (msg === commands.roomNames) {

        httpGetAsync('http://openhab-test.synyx.coffee:8080/rest/items/', (event) => {
          console.log(event);
          const rooms = event.map(e => {
            return e.name;
          }).filter(e => e.endsWith('Temperature_Current'))
            .forEach(e => {
              const room = e.split('_')[0];
              if (room !== 'Group') {
                say(room)
              }
            });

        });
      }

      if (msg === commands.tempPokerraum) {
        sayRoomTemperature('Pokerraum');
      }

      if (msg === commands.tempWerkstatt) {
        sayRoomTemperature('Werkstatt');
      }

      if (msg === commands.help) {
        say('es gibt folgende Befehle');
        Object.keys(commands).forEach(cmd => {
          say(commands[cmd]);
        });
      }

      if (msg === commands.time) {
        const now = new Date();
        const hour = now.getHours();
        const min = now.getMinutes();
        say(`Es ist ${hour} Uhr ${min}`);
      }

      if (msg === commands.fuck) {
        say('Fick Dich selber');
      }
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
  recognition.onerror = () => console.log('onerror');
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