(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Joseph/Sites/small/stems/node_modules/@artcommacode/q/index.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var toArray = function toArray(list) {
  return [].concat(_toConsumableArray(list));
};

var first = function first(xs) {
  return xs[0];
};

var elemError = function elemError(e) {
  throw new Error("\"" + String(e) + "\" does't exist in the document");
};

var getRoot = function getRoot(e) {
  return !e ? document : document && document.body && document.body.contains(e) ? e : elemError(e);
};

var query = exports.query = function query(q, e) {
  var root = getRoot(e);
  return root ? toArray(root.querySelectorAll(q)) : [];
};

var queryOne = exports.queryOne = function queryOne(q, e) {
  return first(query(q, e));
};

},{}],"/Users/Joseph/Sites/small/stems/src/js/components/Button.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

/**
 * Receives a DOM element.
 * Returns an object with enable, activate, and deactivate methods
 * @param  {DOM element} element
 * @return {Shape}
 */

function makeButton(el, buttonIndex, publisher) {
	var button = {};
	button.element = el;

	button.enable = function enable() {
		button.enabled = true;
		button.element.classList.add('enabled');
	};

	button.disable = function disable() {
		button.enabled = false;
		button.element.classList.remove('enabled');
	};

	button.toggleEnabled = function toggleEnabled() {
		if (button.enabled) {
			button.disable();
		} else {
			button.enable();
		}
	};

	button.activate = function activate() {
		if (!button.enabled) button.enable();
		button.active = true;
		button.element.classList.add('active');
	};

	button.deactivate = function deactivate() {
		button.active = false;
		button.element.classList.remove('active');
	};

	button.toggleActive = function toggleActive(inputState) {
		button.active = inputState || !button.active;
		if (button.active === true) {
			button.activate();
		} else {
			button.deactivate();
		}
	};

	button.element.addEventListener('click', function () {
		button.toggleActive();
		var event = button.active ? 'stemActivated' : 'stemDeactivated';
		publisher.emit(event, buttonIndex);
	});

	publisher.subscribe('allButtonsDisabled', button.disable);

	publisher.subscribe('stemPlayed', function (activeIndex) {
		console.log(activeIndex, buttonIndex);
		if (activeIndex === buttonIndex) button.activate();
	});

	return button;
}

exports.default = makeButton;

},{}],"/Users/Joseph/Sites/small/stems/src/js/components/Stem.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _q = require('@artcommacode/q');

/**
 * Receives a DOM element with links to audio files to be played in tandem as stems.
 * Returns an object with play/pause/mute methods
 * @param  {DOM element} element
 * @return {Stem}
 */
function makeStem(element) {
	var stem = {};
	stem.audio = element;
	stem.active = false;
	var url = stem.audio.getAttribute('src').split('/');
	stem.fileName = url.slice(-1)[0];

	stem.play = function playStem() {
		stem.active = true;
		stem.audio.play();
	};

	stem.stop = function stopStem() {
		stem.active = false;
		stem.audio.pause();
		stem.audio.currentTime = 0;
	};

	stem.unmute = function unmuteStem() {
		stem.active = true;
		stem.audio.volume = 1;
	};

	stem.mute = function muteStem() {
		console.log('stem muted');
		stem.active = false;
		stem.audio.volume = 0;
	};

	return stem;
}

exports.default = makeStem;

},{"@artcommacode/q":"/Users/Joseph/Sites/small/stems/node_modules/@artcommacode/q/index.js"}],"/Users/Joseph/Sites/small/stems/src/js/components/Track.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _q = require('@artcommacode/q');

var _Stem = require('./Stem');

var _Stem2 = _interopRequireDefault(_Stem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Receives a DOM element with links to audio files to be played in tandem as stems.
 * Returns an object with play/pause/mute methods
 * @param  {DOM element} element
 * @return {Stem}
 */
function makeTrack(el, trackIndex, publisher, readyCallback) {
	var track = {};
	track.element = el;
	var stemElements = (0, _q.query)('audio', el);

	var stems = [];

	// See if all of the tracks are ready

	function checkIfReady() {
		var readyCount = stems.filter(function (stem) {
			return stem.isReady;
		}).length;

		if (readyCount === stems.length) {
			track.ready = true;
			// reports back to the main script, so it can count all of the loaded tracks
			readyCallback(trackIndex);
			if (!track.hasErrors) {
				track.element.classList.add('ready');
			} else {
				track.element.classList.add('has-errors');
			}
		}
	}

	// add each element to the tracks array.
	// When it's loaded, report it.
	// If there is a network error, flag the track
	stemElements.map(function (stemElement) {
		var stem = (0, _Stem2.default)(stemElement);
		var url = stemElement.getAttribute('src').split('/');
		stem.fileName = url.slice(-1)[0];
		stems.push(stem);

		stem.audio.load();

		function canPlayThroughHandler() {
			// console.log(`${trackIndex} - ${stem.fileName} is ready`)
			stem.isReady = true;
			stem.audio.removeEventListener('canplaythrough', canPlayThroughHandler);
			checkIfReady();
		}

		stem.audio.addEventListener('canplaythrough', canPlayThroughHandler);

		stem.audio.addEventListener('error', function (e) {
			if (e.target.error.code === 3 || e.target.error.code === 4) {
				console.warn(stem.fileName + ' could not be loaded');
				stem.isReady = true;
				track.hasErrors = true;
				checkIfReady();
			}
		});
	});

	// functions that we attach to the 'track' object are public &
	// usable from the outside.
	// Everything else is private.


	function playAllStems() {
		stems.map(function (stem, index) {
			stem.unmute();
			publisher.emit('stemPlayed', index);
		});
	}

	var startSynced = function startSynced() {
		return new Promise(function (resolve, reject) {
			stems.map(function (stem) {
				return stem.mute();
			});
			function checkSync() {
				stems.map(function (stem) {
					return stem.play();
				});
				var minMax = stems.reduce(function (previous, current) {
					return {
						min: Math.min(previous.min || current.audio.currentTime, current.audio.currentTime),
						max: Math.max(previous.max || current.audio.currentTime, current.audio.currentTime)
					};
				}, { min: undefined, max: undefined });
				var diff = minMax.max - minMax.min;
				if (minMax.max === 0) {
					console.log('Not ready.. trying again');
					setTimeout(checkSync, 500);
				} else if (diff < 0.05) {
					console.log('starting with diff of ' + diff);
					stems.map(function (stem) {
						return stem.stop();
					});
					setTimeout(function () {
						playAllStems();
						resolve();
					}, 250);
				} else {
					console.log('diff: ' + diff + '  - trying again..');
					stems.map(function (stem) {
						return stem.stop();
					});
					setTimeout(checkSync, 500);
				}
			}
			setTimeout(checkSync, 500);
		});
	};

	function play() {
		track.active = true;
		track.element.classList.add('loading');
		// don't do anything if it's not ready. The user shouldn't be
		// able to play the track until it's ready anyway, though.
		if (!track.ready) return false;
		// const isSynced = startSynced();
		startSynced().then(function () {
			track.element.classList.add('playing');
		});
		return true;
	}

	function stop() {
		stems.map(function (stem) {
			return stem.stop();
		});
		track.active = false;
		track.element.classList.remove('playing');
	}

	/**
  * Bind event listeners & emitters
  */

	track.element.addEventListener('click', function () {
		publisher.emit('trackPlayed', trackIndex);
	});

	publisher.subscribe('trackPlayed', function (newIndex) {
		debugOutput.innerHTML = '';
		if (newIndex === trackIndex) {
			play();
		} else {
			stop();
		}
	});

	publisher.subscribe('stemActivated', function (stemIndex) {
		if (track.active) stems[stemIndex].unmute();
	});
	publisher.subscribe('stemDeactivated', function (stemIndex) {
		console.log(stemIndex, track.active);
		if (track.active) stems[stemIndex].mute();
	});

	publisher.subscribe('allStemsActivated', playAllStems);

	/**
  * Debug logging
  */

	var debugOutput = (0, _q.queryOne)('#debug-output');

	function pad(input) {
		var padLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
		var char = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0';
		var direction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'right';

		var string = input.toString();
		var diff = padLength - input.length;
		for (var i = 0; i < diff; i += 1) {
			if (direction === 'right') {
				string += char;
			} else {
				string = char + string;
			}
		}
		return string;
	}

	function formatDecimal(input, lLength, rLength) {
		var arr = input.toString().split('.');
		if (arr.length === 1) arr.push('0');
		var whole = pad(arr[0], lLength, '0', 'left');
		var dec = pad(arr[1], rLength, '0', 'right').substr(0, rLength);
		return whole + '.' + dec;
	}

	setInterval(function () {
		if (track.active) {
			var debugString = ['*******'];
			var min = void 0;
			var max = void 0;
			stems.map(function (stem, index) {
				if (stem.audio) {
					var activated = stem.active ? 'activated' : 'deactivated';
					var currentTime = Math.round(stem.audio.currentTime * 10000) / 10000;
					var formattedTime = formatDecimal(currentTime, 3, 4);

					min = min ? Math.min(min, currentTime) : currentTime;
					max = max ? Math.max(max, currentTime) : currentTime;
					if (currentTime === 0) stem.audio.play();
					debugString.push('   stem ' + index + ': ' + formattedTime + ' | ' + stem.fileName + ' - ' + activated + ' | ' + stem.audio.buffered.end(0) + ' / ' + stem.audio.duration);
				}
			});
			var diff = formatDecimal(max - min, 1, 6);
			debugString.push('   max diff: ' + diff);
			debugOutput.innerHTML = debugString.join('<br>');
		}
	}, 100);

	track.stemsCount = stems.length;
	return track;
}

exports.default = makeTrack;

},{"./Stem":"/Users/Joseph/Sites/small/stems/src/js/components/Stem.js","@artcommacode/q":"/Users/Joseph/Sites/small/stems/node_modules/@artcommacode/q/index.js"}],"/Users/Joseph/Sites/small/stems/src/js/components/publisher.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PubSubEmitter = function () {
	function PubSubEmitter() {
		_classCallCheck(this, PubSubEmitter);

		// create a new Map to hold all of the topics
		this.listeners = new Map();
	}

	_createClass(PubSubEmitter, [{
		key: 'subscribe',
		value: function subscribe(topic, callback) {
			// if the listener does not hae the topic yet, add it.
			if (!this.listeners.has(topic)) this.listeners.set(topic, []);
			// push the callback to the topic's array
			this.listeners.get(topic).push(callback);
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(topic, callback) {
			var listeners = this.listeners.get(topic);
			var index = void 0;

			if (listeners && listeners.length) {
				// find the index of the callback we're removing
				index = listeners.reduce(function (i, listener, currentIndex) {
					typeof listener === 'function' && listener === callback ? i = currentIndex : i;
				}, -1);

				if (index > -1) {
					// if we found a match, splice it out, and resupply the map with the spliced array
					listeners.splice(index, 1);
					this.listeners.set(topic, listeners);
					return true; // return true if we removed something
				}
			}
			return false; // return false if we didn't
		}
	}, {
		key: 'emit',
		value: function emit(topic) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			// get the listeners subscribed to the topic
			var listeners = this.listeners.get(topic);

			if (listeners && listeners.length) {
				// execute each callback with any supplied arguments
				listeners.forEach(function (listener) {
					listener.apply(undefined, args);
				});
				return true;
			}
			return false;
		}
	}]);

	return PubSubEmitter;
}();

var publisher = new PubSubEmitter();

exports.default = publisher;

},{}],"/Users/Joseph/Sites/small/stems/src/js/stems.js":[function(require,module,exports){
'use strict';

var _q = require('@artcommacode/q');

var _publisher = require('./components/publisher');

var _publisher2 = _interopRequireDefault(_publisher);

var _Track = require('./components/Track');

var _Track2 = _interopRequireDefault(_Track);

var _Button = require('./components/Button');

var _Button2 = _interopRequireDefault(_Button);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// first, just find the elements
// A small utility for getting DOM elements
var trackElements = (0, _q.query)('.stem-track');

// A component you can use to emit and subscribe to events.
// Helpful to decouple UI stuff

var everything = (0, _q.queryOne)('.stem-buttons .play-all') || false;
var buttons = [];
var tracks = [];

var readyCount = 0;

function readyHandler() {
	readyCount += 1;
	if (readyCount === tracks.length) {
		(0, _q.queryOne)('.stems-container').classList.add('ready');
	}
}

// add each composed track to an array
trackElements.map(function (track, index) {
	var newTrack = (0, _Track2.default)(track, index, _publisher2.default, readyHandler);
	tracks.push(newTrack);
});

(0, _q.query)('.stem-buttons .stem-button').map(function (button, index) {
	var newButton = (0, _Button2.default)(button, index, _publisher2.default);
	buttons.push(newButton);
});

/**
 * Event Listeners
 */

if (everything) {
	everything.addEventListener('click', function () {
		_publisher2.default.emit('allStemsActivated');
	});
}

// Use each track element as the source of a Stem object

},{"./components/Button":"/Users/Joseph/Sites/small/stems/src/js/components/Button.js","./components/Track":"/Users/Joseph/Sites/small/stems/src/js/components/Track.js","./components/publisher":"/Users/Joseph/Sites/small/stems/src/js/components/publisher.js","@artcommacode/q":"/Users/Joseph/Sites/small/stems/node_modules/@artcommacode/q/index.js"}]},{},["/Users/Joseph/Sites/small/stems/src/js/stems.js"])

//# sourceMappingURL=stems.js.map
