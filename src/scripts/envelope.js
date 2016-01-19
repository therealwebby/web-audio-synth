var Envelope = (function(){
  var audioContext,
      settings = {
        attack : 3000,
        decay : 1000,
        sustain : 0.6,
        release : 300,
        attackEnable : true,
        decayEnable : true,
        sustainEnable : true,
        releaseEnable : true
      },
      rampDown;

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
   * Handles the attack of the osc playing
   * @param {object} gainNode -Gain node that the tone is being played through
   */
  function attack(gainNode) {
    var maxGain = gainNode.gain.value;
    // console.log(maxGain);
    if (settings.attackEnable === true) {
      var val = settings.attack;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(maxGain, audioContext.currentTime + (val / 1000));
      //Wait before playing the decay
      rampDown = setTimeout(decay, val, [gainNode, maxGain]);
    }
  }

  /**
   * Handles the decay of the osc playing
   * @param {object} gainNode -Gain node that the tone is being played through
   */
  function decay(args) {
    var gainNode = args[0],
        maxGain = args[1];
    // console.log('decay');
    if (settings.decayEnable === true) {
      var val = settings.decay;
      var sustain = settings.sustain * maxGain;
      gainNode.gain.setValueAtTime(maxGain, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(sustain, audioContext.currentTime + (val / 1000));
    }

  }

  /**
   * Handles the release of the osc playing
   * @param {object} gainNode -Gain node that the tone is being played through
   */
  function release(gainNode) {
    if (typeof rampDown === 'number') {
      clearTimeout(rampDown);
    }
    if (settings.releaseEnable === true) {
      var val = parseInt(settings.release);
      var gainVal = gainNode.gain.value;
      gainNode.gain.setValueAtTime(gainVal, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + (val / 1000));
    }
  }

  /**
   * Initiates the evenelope
   * @param {object} adsrSettings - Settings for the ADSR to be used
   * @param {object} audioCtx - The active audio context for the enevlope
   */
  function init(adsrSettings, audioCtx) {
    settings = _mergeObjects(settings, adsrSettings);
    audioContext = audioCtx;
  }

  return {
    init : init,
    attack: attack,
    decay: decay,
    release: release,
    settings: settings
  };
})();
