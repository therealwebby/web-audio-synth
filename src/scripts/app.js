/**
 * Angular Web Synth Application
 */

/**
 * Main weather application module
 */
var app = angular.module('webSynth', ['ngAnimate']);

/**
 * Main app config settings
 */
app.config(function($logProvider){
  //Change to turn of debug options
  var production = false;


  var mode = production ? false : true;
  $logProvider.debugEnabled(mode);
});

/**
 * App directive creating a new envelope UI. Used as inside of a synth directive
 */
app.directive('envelope', function(){
  return {
    restrict: 'E',
    scope: false,
    templateUrl : 'template-parts/envelope-panel.html',
    controller: ['$scope', '$log', function($scope, $log){
      $log.debug('current-voice-enelope', $scope.voice.envelopeSettings);

      var chartCtx = document.getElementById("adsr-chart").getContext("2d");
      var envelopeChartData = {
        labels: ['A', 'D', 'S', 'R'],
        datasets: [{
          fillColor: 'rgba(0, 0 , 0, 0)',
          strokeColor: 'rgba(0, 0 , 0, 0.2)',
          pointColor: 'rgba(0, 0 , 0, 0.2)',
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: [
            $scope.voice.envelopeSettings.attack,
            $scope.voice.envelopeSettings.decay,
            ($scope.voice.envelopeSettings.sustain * 3000),
            $scope.voice.envelopeSettings.release
          ]
        }]
      };
      var envelopeChartOptions = {
        bezierCurve: false,
        showTooltips: false,
        responsive: true,
        scaleShowLabels: false,
        scaleOverride : true,
        scaleSteps: 3,
        scaleStepWidth: 1000,
        scaleStartValue: 0,
        animation: false
      };
      $scope.envelopeChart = new Chart(chartCtx).Line(envelopeChartData, envelopeChartOptions);

      $scope.$watchCollection(function(){
        return [
          $scope.voice.envelopeSettings.attack,
          $scope.voice.envelopeSettings.decay,
          $scope.voice.envelopeSettings.sustain,
          $scope.voice.envelopeSettings.release
        ];
      }, function(newValue){
        var newPointValues = [
          parseInt(newValue[0]),
          parseInt(newValue[1]),
          parseFloat(newValue[2]) * 3000,
          parseInt(newValue[3])
        ];
        $log.debug('newPointValues', newPointValues);
        for (var i = 0; i < $scope.envelopeChart.datasets[0].points.length; i++) {
          $scope.envelopeChart.datasets[0].points[i].value = newPointValues[i];
        }
        $scope.envelopeChart.update();
      });
    }]
  };
});

/**
 * App directive creating a new lfo UI. Used as inside of a synth directive
 */
app.directive('lfo', function(){
  return {
    restrict: 'E',
    scope: false,
    templateUrl : 'template-parts/lfo-panel.html',
    controller: ['$scope', '$log', function($scope, $log){
      $log.debug('current-voice-lfo', $scope.voice.lfoSettings);
    }]
  };
});

/**
 * App directive creating a new tone UI. Used as inside of a synth directive
 */
app.directive('tone', function(){
  return {
    restrict: 'E',
    scope: false,
    templateUrl : 'template-parts/tone-panel.html',
    controller: ['$scope', '$log', function($scope, $log){
      $log.debug('current-voice', $scope.voice);
      // this pretty much a defunct property and should be deleted eventually
    }]
  };
});

/**
 * Directive with click handlers for each key.
 */
app.directive('key', function(){
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attr) {

      element.bind('mousedown', function(e) {
        var feq = this.dataset.feq;
        scope.webAudio.playNote(feq);
      });

      element.bind('mouseup', function(e) {
        var feq = this.dataset.feq;
        scope.webAudio.stopNote(feq);
      });

    }
  };
});

/**
 * Main functionality for a synth. Creates a new voice, and UI to the page
 */
app.directive('synth', function(){
  return {
    restrict: 'E',
    templateUrl : 'template-parts/synth.html',
    scope: {
      octives: '=',
    },
    controller: ['$scope', '$log', '$document', function($scope, $log, $document){

      var heldKeys = [];

      //Main Web Audio component
      $scope.webAudio = WebAudioComponent;
      $scope.webAudio.init();
      $scope.webAudio.newVoice({
        type: 'square',
        gain: 0.4,
        detune: 0,
        lfoSettings: {
          type: 'square',
          frequency: 20,
          gain: 10
        },
        envelopeSettings: {
          attack: 50,
          decay: 750,
          sustain: 0.7,
          release: 750
        }
      });

      //Note Frequencys
      $scope.noteFrequencys = {
        'c4' : 261.626,
        'c#4': 277.183,
        'd4' : 293.665,
        'd#4': 311.127,
        'e4' : 329.628,
        'f4' : 349.228,
        'f#4': 369.994,
        'g4' : 391.995,
        'g#4': 415.305,
        'a4' : 440,
        'a#4': 466.164,
        'b4' : 493.883
      };
      $scope.keynameNoteLookup = {
        65 : 'c4',
        87 : 'c#4',
        83 : 'd4',
        69 : 'd#4',
        68 : 'e4',
        70 : 'f4',
        84 : 'f#4',
        71 : 'g4',
        89 : 'g#4',
        72: 'a4',
        85: 'a#4',
        74: 'b4'
      };

      $scope.getNumber = function(oct){
        return new Array(oct);
      };

      //Keyboard Manager
      $document.bind('keydown keypress', function(evt){
        //Check if the key is already being held
        if ( heldKeys.indexOf(evt.keyCode) > -1 ) {
          return;
        }

        var feq = $scope.noteFrequencys[ $scope.keynameNoteLookup[evt.keyCode] ];

        heldKeys.push(evt.keyCode);
        if (typeof feq !== 'undefined') {
          $scope.webAudio.playNote(feq);
        }
      });

      $document.bind('keyup', function(evt){
        var feq = $scope.noteFrequencys[ $scope.keynameNoteLookup[evt.keyCode] ];
        var heldKeyIndex = heldKeys.indexOf(evt.keyCode);
        heldKeys.splice(heldKeyIndex, 1);
        $scope.webAudio.stopNote(feq);
      });

    }]
  };

 });

/**
 * Main app controller.
 */
app.controller('webSynthController', ['$scope', '$log', '$timeout', function($scope, $log, $timeout){

}]);
