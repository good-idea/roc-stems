import { query, queryOne } from '@artcommacode/q';
import makeStem from './Stem';

/**
 * Receives a DOM element with links to audio files to be played in tandem as stems.
 * Returns an object with play/pause/mute methods
 * @param  {DOM element} element
 * @return {Stem}
 */
function makeTrack(el, trackIndex, publisher) {
	const track = {};
	track.element = el;
	const stemSources = JSON.parse(track.element.getAttribute('data-stems'));

	const autoload = track.element.hasAttribute('autoload') && track.element.getAttribute('autoload') !== 'false';
	const autoplay = track.element.hasAttribute('autoplay') && track.element.getAttribute('autoplay') !== 'false';

	const stems = [];
	let loadedStems = 0;

	// add each element to the tracks array.
	stemSources.map((stemElement) => {
		const stem = makeStem(stemElement);
		stems.push(stem);
	});

	/**
	 * FUNCTIONS
	 */

	/**
	 * Track the number of loaded stems.
	 * Set error status if necessary.
	 */
	function stemLoadedHandler(err) {
		loadedStems += 1;
		if (err) {
			track.hasError = true;
			track.element.classList.add('has-errors');
		}
		if (loadedStems === stems.length) {
			track.isLoaded = true;
			track.element.classList.remove('loading');
			track.element.classList.add('loaded');
			if (autoplay) track.play();
		}
	}

	/**
	 * If the track hasn't loaded, load the stems. Otherwise, play.
	 */
	function handleClick() {
		if (!track.isLoaded) {
			track.load();
		} else {
			track.play();
		}
	}

	/**
	 * METHODS
	 */

	track.load = function loadTrack() {
		track.element.classList.add('loading');
		stems.map(stem => stem.load(stemLoadedHandler));
	};

	track.play = function playTrack() {
		track.active = true;
		const initializeStems = [];
		stems.map((stem) => {
			initializeStems.push(stem.play(true));
		});
		Promise.all(initializeStems).then(() => {
			publisher.emit('trackPlayed', trackIndex);
			setTimeout(() => {
				// const playAttempts = [];
				stems.map((stem) => {
					stem.reset();
					stem.play();
				});
				publisher.emit('enableButtons', stems.length);
				track.element.classList.add('playing');
				track.startTime = Date.now();
			}, 400);
		});
	};

	track.stop = function stopTrack() {
		track.active = false;
		track.startTime = false;
		stems.map(stem => stem.reset());
		// publisher.emit('enableButtons', stems.length);
		track.element.classList.remove('playing');
	};

	track.getCurrentTime = function getCurrentTime() {
		if (!track.active) return null;
		const times = [];
		stems.map((stem) => {
			times.push(stem.audio.currentTime);
		});
		const stemMax = Math.max(...times);
		console.log('mathmax: ', stemMax);

		const now = Date.now();
		const elapsed = (now - track.startTime) / 1000;

		console.log('elapsed: ', elapsed);

		// If all tracks have been muted, their currentTime values will have stopped counting.
		// We're trying to simulate a "mute", but they are paused - so the elapsed time will be
		// a more accurate time to start.
		return Math.max(elapsed, stemMax);
	};

	track.unmuteStem = function unmuteStem(stemIndex) {
		if (track.active) {
			const currentTime = track.getCurrentTime();
			console.log(currentTime);
			stems[stemIndex].unmute(currentTime);
		}
	};

	track.muteStem = function muteStem(stemIndex) {
		if (track.active) stems[stemIndex].mute();
	};

	/*
   * EVENTS
	 */

	track.element.addEventListener('click', handleClick);

	publisher.subscribe('trackPlayed', (newIndex) => {
		if (newIndex !== trackIndex) {
			track.active = false;
			track.stop();
		}
	});

	publisher.subscribe('stemActivated', track.unmuteStem);

	publisher.subscribe('stemDeactivated', track.muteStem);

	publisher.subscribe('allStemsToggled', () => {
		if (track.active) {
			const allEnabled = (stems.filter(stem => stem.active).length === stems.length);
			if (allEnabled) {
				stems.map((stem, stemIndex) => track.muteStem(stemIndex));
				publisher.emit('disableButtons', stems.length);
			} else {
				stems.map((stem, stemIndex) => track.unmuteStem(stemIndex));
				publisher.emit('enableButtons', stems.length);
			}
		}
	});

	if (autoload) track.load();


	/**
	 * Debug logging
	 */

	const debugOutput = queryOne('#debug-output');

	publisher.subscribe('trackPlayed', () => {
		debugOutput.innerHTML = '';
	});

	function pad(input, padLength = 2, char = '0', direction = 'right') {
		let string = input.toString();
		const diff = padLength - input.length;
		for (let i = 0; i < diff; i += 1) {
			if (direction === 'right') {
				string += char;
			} else {
				string = char + string;
			}
		}
		return string;
	}

	function formatDecimal(input, lLength, rLength) {
		const arr = input.toString().split('.');
		if (arr.length === 1) arr.push('0');
		const whole = pad(arr[0], lLength, '0', 'left');
		const dec = pad(arr[1], rLength, '0', 'right').substr(0, rLength);
		return `${whole}.${dec}`;
	}

	setInterval(() => {
		if (track.active) {
			const debugString = ['*******'];
			let min;
			let max;
			stems.map((stem, index) => {
				if (stem.audio) {
					const activated = (stem.active) ? '(on)' : '(off)';
					const currentTime = Math.round(stem.audio.currentTime * 10000) / 10000;
					const formattedTime = formatDecimal(currentTime, 3, 4);

					if (stem.active) {
						min = (min) ? Math.min(min, currentTime) : currentTime;
						max = (max) ? Math.max(max, currentTime) : currentTime;
					}
					if (currentTime === 0) {
						stem.audio.play().catch(() => {
							track.active = false;
						});
					}
					try {
						debugString.push(`   stem ${index + 1}: ${formattedTime} | ${stem.fileName} - ${activated}`);
					} catch (e) {
						// do nothing
					}
				}
			});
			const diff = formatDecimal(max - min, 1, 6);
			debugString.push(`   max diff: ${diff}`);
			debugOutput.innerHTML = debugString.join('<br>');
		}
	}, 100);


	return track;
}


export default makeTrack;
