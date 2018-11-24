

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

window.commandList.push(new Command('UPS', () => {
  const rand = Number.parseInt(Math.random() * 7) + 1;
  const url = `https://www.soundjay.com/human/fart-0${rand}.mp3`;
  console.log(url);
  const audio = new Audio(url);
  audio.play();
}, (text) => {
  if (['Pups', 'UPS'].includes(text)) {
    return true;
  }
}));


window.commandList.push(new Command('wie ist das Wetter', () => {
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude; //49
    const lon = position.coords.longitude; //8

    httpGetAsyncJson(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}8&lon=${lon}&appid=237cd23c72575576cdab347b7c01a3f8&lang=de`, (json) => {
      const city = json.name;
      const weather = json.weather[0].description;
      const temp = Number.parseInt(json.main.temp - 273);
      const humi = json.main.humidity;

      say(`In ${city} ist das Wetter ${weather} bei ${temp} Grad Celsius und einer Luftfeuchte von ${humi}%`)
    })
  }, () => {
    console.log('error in geo location');
  });
}));


window.commandList.push(new Command('wo ist das nächste Reisezentrum', () => {
  // https://developer.deutschebahn.com/store/apis/info?name=Reisezentren&version=v1&provider=DBOpenData#!/default/get_reisezentren_loc_lat_lon
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude; //49
    const lon = position.coords.longitude; //8

    httpGetAsyncJsonFromBahn(`https://api.deutschebahn.com/reisezentren/v1/reisezentren/loc/${lat}/${lon}`, (json) => {
      const name = json.name;
      const dist = Number.parseInt(json.dist);
      const addr = json.address;
      const city = json.city;
      say(`Das nächste Reisezentrum ist ${dist} km entfernt in der ${addr} in ${city}`);
    });
  });
}));

