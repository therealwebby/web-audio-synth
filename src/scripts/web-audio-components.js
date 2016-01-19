/**
 * A vanillia JS module for using the web audio api.
 * @module WebAudioComponent
 */
var WebAudioComponent = (function(Envelope) {
  var audioContext,
      voiceSettings = [],
      playingNotes = [],
      defaultVoice = {
        type: 'sine',
        detune: 0,
        frequency: 440,
        gain: 1,
        lfo : true,
        lfoSettings : {
          type: 'sawtooth',
          detune: 10,
          frequency: 2,
          gain: 10
        },
        envelope: true,
          envelopeSettings : {
          attackEnable: true,
          decayEnable: true,
          sustainEnable: true,
          releaseEnable: true,
          attack: 300,
          decay: 100,
          sustain: 0.7,
          release: 300,
        }
      };

  /**
   * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
   * @private
   * @param {object} obj1 - the base object
   * @param {object} obj2 - the objects with settings to be overwritted
   * @returns obj3 a new object based on obj1 and obj2
   */
  function _mergeObjects(obj1, obj2){
      var obj3 = {};

      for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
      }

      for (var attr in obj2) {
        if (typeof obj3[attr] === 'object') {
          obj3[attr] = _mergeObjects(obj1[attr], obj2[attr]);
        } else {
          obj3[attr] = obj2[attr];
        }

      }

      return obj3;
  }

  /**
   * Create a new oscillator
   * @private
   * @param {object} settings - JSON object with relevent settings. Based on all or lso part of defaultVoice
   * @returns {object} - oscillator node
   */
  function _addOsc(settings) {
    var osc;

    osc = audioContext.createOscillator();
    osc.type = settings.type;
    osc.frequency.value = settings.frequency;
    osc.detune.value = settings.detune;

    return osc;
  }

  /**
   * Create a new gain node
   * @private
   * @param {object} settings - JSON object with relevent settings. Based on all or lso part of defaultVoice
   * @param {boolean} connectDestination - Weither or not this gain node should be connected ot the destination immediatly
   * @returns {object} - gain node
   */
  function _addGain(settings, connectDestination){
    var gain;

    gain = audioContext.createGain() || audioContext.createGainNode();
    if (connectDestination) {
      gain.connect(audioContext.destination);
    }
    gain.gain.value = settings.gain;

    return gain;
  }

  /**
   * Create a new gain node
   * @private
   * @param {object} lfoSettings - JSON object with relevent settings. Based on the lso sub object of defaultVoice
   * @returns {object} - lfo object comprised of an oscillator and gain node
   */
  function _addLFO(lfoSettings) {
    var lfo = {};
    lfo.osc = _addOsc(lfoSettings);
    lfo.gain = _addGain(lfoSettings, false);
    return lfo;
  }

  /**
   * Builds a new voice based on a JSON object. Pushes the voice to voices array
   * @private
   * @param {object} voiceSettings - JSON object with relevent settings. Based on defaultVoice
   */
  function _buildVoice(voiceSettings) {
    var voice = {};
    voice.osc = _addOsc(voiceSettings);
    voice.gain = _addGain(voiceSettings, true);

    if (voiceSettings.lfo) {
      voice.lfo = _addLFO(voiceSettings.lfoSettings);
    }

    if (voiceSettings.envelope) {
      voice.envelopeSettings = voiceSettings.envelopeSettings;
      voice.envelope = Envelope;
      voice.envelope.init(voice.envelopeSettings, audioContext);
    }

    voice.osc.connect(voice.gain);
    return voice;
  }

  /**
   * Starts the LFO
   * @private
   * @param {object} lfo - lfo object comprised of an oscillator and gain node
   * @param {object} osc - oscillator node playing the tone
   */
  function _runLFO(lfo, osc){
    lfo.osc.connect(lfo.gain);
    lfo.gain.connect(osc.frequency);

    lfo.osc.start();
  }

  /**
   * Stops the LFO
   * @private
   * @param {object} lfo - lfo object comprised of an oscillator and gain node
   */
  function _stopLFO(lfo){
    lfo.osc.stop();
  }

  /**
   * Plays a tone. Tone is then stored in an array of play so that it can be
   * stopped when the key is released
   * @public
   * @param {string} feq - fequency of the note to play
   */
  function playNote(feq) {

    for (var i = 0; i < voiceSettings.length; i++) {
      var thisVoice = _buildVoice(voiceSettings[i]);

      thisVoice.osc.frequency.value = feq;

      if (typeof thisVoice.envelope === 'object') {
        thisVoice.envelope.attack(thisVoice.gain);
      }

      thisVoice.osc.start();

      if (typeof thisVoice.lfo !== 'undefined') {
        // console.log( 'lfo enabled' );
        _runLFO(thisVoice.lfo, thisVoice.osc);
      }

      playingNotes.push({
        frequency : feq,
        voice: thisVoice
      });
      // console.log('voice at frequency' + feq + ' is playing');
    }

  }

  /**
   * Stops a note playing by frequency
   * @public
   * @param {string} feq - frequency of the not that is to be stopped
   */
  function stopNote(feq){
    for (var i = 0; i < playingNotes.length; i++) {
      if (playingNotes[i].frequency === feq) {

        if (typeof playingNotes[i].voice.envelope === 'object') {
          playingNotes[i].voice.envelope.release(playingNotes[i].voice.gain);
        }

        var stopOsc = setTimeout( function(voice){
          voice.osc.stop();

          if (typeof voice.lfo !== 'undefined') {
            _stopLFO(voice.lfo);
          }
        }.bind(this, playingNotes[i].voice), playingNotes[i].voice.envelopeSettings.release);

        playingNotes.splice(i, 1);

        // console.log('voice at frequency' + feq + ' has stopped');
      }
    }
    // for (var v = 0; v < voices.length; v++) {
    //

    // }
  }

  /**
   * Add a new voice.
   * @public
   * @param {object} settings - JSON object with relevent settings. Based on defaultVoice
   */
  function newVoice (settings) {
    var newVoiceSettings = _mergeObjects(defaultVoice, settings);
    voiceSettings.push(newVoiceSettings);
  }

  /**
   * Initiates the audioContext for the page
   * @public
   */
  function init() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
    }
    catch(e) {
      console.error( 'Please try another browser :' + e );
    }
  }

  return {
    init : init,
    newVoice: newVoice,
    voices: voiceSettings,
    playNote : playNote,
    stopNote : stopNote
  };
})(Envelope);
