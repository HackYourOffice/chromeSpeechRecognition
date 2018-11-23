

window.commandList.push(new Command('welche Kommandos gibt es', () => {
  say('es gibt folgende Befehle');
  window.commandList.forEach(cmd => {
    say(cmd.name);
  });
}, (text) => {
  if (text === 'Hilfe' || text === this.name) {
    return true;
  }
  return false;
}));

window.commandList.push(new Command('darf ich schon Bier trinken', () => {
  httpGetAsyncText('https://bier.synyx.de/', (text) => {

    if (text.includes('Is it beertime yet? - YES')) {
      say('zum wohl');
    } else {
      say('nö');
    }
  });
}));

window.commandList.push(new Command('wie warm ist es in Pokerraum', () => {
  sayRoomTemperature('Pokerraum');
}));

window.commandList.push(new Command('wie warm ist es in der Werkstatt', () => {
  sayRoomTemperature('Werkstatt');
}));


window.commandList.push(new Command('f*** dich', () => {
  say('Fick Dich selber');
}));

window.commandList.push(new Command('erzähl einen Witz', () => {
  // http://www.icndb.com/api/
  httpGetAsyncJson('http://api.icndb.com/jokes/random', (event) => {
    console.log('result: ', event);
    console.log(typeof event);
    const joke = event.value.joke;

    console.log(joke);
    say(joke, 'en');
  });
}));

window.commandList.push(new Command('wie spät ist es', () => {
  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  say(`Es ist ${hour} Uhr ${min}`);
}));

window.commandList.push(new Command('welche Räume gibt es', () => {
  httpGetAsyncJson('http://openhab-test.synyx.coffee:8080/rest/items/', (event) => {
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
}));

