desktop.app.tts = {};
desktop.app.tts.available = false;
desktop.app.tts.icon = 'folder';
desktop.app.tts.label = 'Text To Speech';
desktop.app.tts.voices = [];
desktop.app.tts.load = function loadtts (params, next) {
  if ('speechSynthesis' in window){
    desktop.app.tts.available = true;
  }

  function populateVoices () {
    var voices = speechSynthesis.getVoices();
    desktop.app.tts.voices = [];
    for(var i = 0; i < voices.length; i++) {
      desktop.app.tts.voices.push(voices[i]);
    }
  }

  if (desktop.app.tts.available) {
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoices;
    }
    populateVoices();
  }

  // desktop can speak text via client-side TTS engine
  // creates easy reference on desktop object
  desktop.speak = desktop.app.tts.speak;
  next();

};

desktop.app.tts.speak = function speakText (text) {
  // TODO: only speak text onces per client session, regardless of window re-opening
  // TODO: look at card cache, might be good solution, cannot use message cache ( need to replay text of message )

  if (!desktop.app.tts.available) {
    console.log('Warning: TTS Engine not available, cannot speak text.');
  }

  if (desktop.app.tts.available && desktop.settings.audio_enabled && desktop.settings.audio_tts_enabled) {
    var speech = new SpeechSynthesisUtterance(text);
    // TODO: configure voice and language to locality
    // TODO: localStorage desktop.settings for tts settings
    // speech.lang = desktop.app.tts.lang || 'en-US';
    if (typeof desktop.settings.tts_voice_index === 'undefined') {
      desktop.set('tts_voice_index', 0);
    }
    speech.voice = desktop.app.tts.voices[desktop.settings.tts_voice_index];
    window.speechSynthesis.speak(speech);
  }
}

desktop.app.tts.processMessages = function processTTSMessages (data, callback) {
  data.messages.forEach(function(message){
    // TODO: only play /speak messages if recent ( within 30 seconds)
    //       This is so buddies aren't spammed with speak messages after joining chat late
    // perform exported action
    let text = '';
    text = message.text.split(' ');
    if (text[0] === '/speak') {
      text.shift();
      let msg = text.join(' ');
      desktop.app.tts.speak(msg || 'nope');
    }
  });
  callback(null, data);
}