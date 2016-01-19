# The Web Audio Synth
An experiment in to the Web Audio API and angular.js

### About
A project uses the web audio API to create a monophonic synth in JS. The synth features tone generators, a ADSR envelope and LFO. Functionality written vanilla without dependences (apart for webAudio support). UI Built on angular.js

### Development Dependences
You'll need the following to work with this repository:
* Node.js
* NPM
* Gulp

### Getting Started

1. Make sure you have node, npm and gulp installed
2. Navigate in bash to project folder
3. Run the following command to add all gulp npm modules
  ```shell
  npm install --save-dev gulp gulp-sass gulp-autoprefixer gulp-minify-css gulp-rename gulp-notify gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-cache del gulp-livereload
  ```
4. Run the `gulp watch` task
5. Develop!

### web-audio-componants.js && envelope.js
A light weight module for working with the web audio API. Made up of two files, the former (web-audio-componants.js) is dependent on the other.

##### How To Use
Create a new instance of the module and init. This method create a new AudioContext is a required before you can use the module
```javascript
var webAudio = WebAudioComponent;
webAudioComponents.init();
```
Next create a new voice using a JSON object
```javascript
webAudioComponents.newVoice();
```

Create a new voices with the following operations
```javascript
var newVoiceSettings = {
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
webAudioComponents.newVoice(newVoiceSettings);
```

Play a note by passing a frequency to the playNote() method

```javascript
webAudioComponents.playNote(440);
```

Stop a note by passing the frequency to the stopNote() method

```javascript
webAudioComponents.stopNote(440);
```

### Gulp Tasks

##### default
Run using `gulp` or `gulp default`. Deletes entire dist file before running all tasks.
##### javascript
Run using `gulp javascript`. Lints, concat's and minifies all js.
##### styles
Run using `gulp styles`. Compiles sass, concats and minifies into single file.
##### images
Run using `gulp images`. Compresses & optimises all images.
##### move-html
Run using `gulp move-html`. Moves html to dist.
##### move-svg
Run using `gulp move-svg`. Moves svg to dist.
##### move-fonts
Run using `gulp move-fonts`. Moves fonts to dist.
##### watch
Run using `gulp watch`. Watches for changes to *any* task (I think). When the file is updated run the related
