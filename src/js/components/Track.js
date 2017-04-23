import { query, queryOne } from '@artcommacode/q';
import makeStem from './Stem';

/**
 * Receives a DOM element with links to audio files to be played in tandem as stems.
 * Returns an object with play/pause/mute methods
 * @param  {DOM element} element
 * @return {Stem}
 */
function makeTrack(el, trackIndex, publisher, readyCallback) {
	const track = {};
	track.element = el;
	const stemElements = query('audio', el);

	const stems = [];

	// See if all of the tracks are ready

	function checkIfReady() {
		const readyCount = stems.filter(stem => stem.isReady).length;

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
	stemElements.map((stemElement) => {
		const stem = makeStem(stemElement);
		const url = stemElement.getAttribute('src').split('/');
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

		stem.audio.addEventListener('error', (e) => {
			if (e.target.error.code === 3 || e.target.error.code === 4) {
				console.warn(`${stem.fileName} could not be loaded`);
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
		stems.map((stem, index) => {
			stem.unmute();
			publisher.emit('stemPlayed', index);
		});
	}


	const startSynced = () => new Promise((resolve, reject) => {
		stems.map(stem => stem.mute());
		function checkSync() {
			stems.map(stem => stem.play());
			const minMax = stems.reduce((previous, current) => {
				return {
					min: Math.min(previous.min || current.audio.currentTime, current.audio.currentTime),
					max: Math.max(previous.max || current.audio.currentTime, current.audio.currentTime),
				};
			}, { min: undefined, max: undefined });
			const diff = minMax.max - minMax.min;
			if (minMax.max === 0) {
				console.log('Not ready.. trying again');
				setTimeout(checkSync, 1000);
			} else if (diff < 0.05) {
				console.log(`starting with diff of ${diff}`);
				stems.map(stem => stem.stop());
				setTimeout(() => {
					playAllStems();
					resolve();
				}, 250);
			} else {
				console.log(`diff: ${diff}  - trying again..`);
				stems.map(stem => stem.stop());
				setTimeout(checkSync, 1000);
			}
		}
		setTimeout(checkSync, 1000);
	});

	function play() {
		track.active = true;
		track.element.classList.add('loading');
		// don't do anything if it's not ready. The user shouldn't be
		// able to play the track until it's ready anyway, though.
		if (!track.ready) return false;
		// const isSynced = startSynced();
		startSynced().then(() => {
			track.element.classList.remove('loading');
			track.element.classList.add('playing');
			publisher.emit('trackPlayed', trackIndex, stems.length);
		});
		return true;
	}

	function stop() {
		stems.map(stem => stem.stop());
		track.active = false;
		track.element.classList.remove('playing');
	}

	/**
	 * Bind event listeners & emitters
	 */

	track.element.addEventListener('click', play);

	publisher.subscribe('trackPlayed', (newIndex) => {
		if (newIndex === trackIndex) {
			if (!track.active) play();
		} else {
			stop();
		}
	});

	publisher.subscribe('stemActivated', (stemIndex) => {
		if (track.active) stems[stemIndex].unmute();
	});
	publisher.subscribe('stemDeactivated', (stemIndex) => {
		console.log(stemIndex, track.active);
		if (track.active) stems[stemIndex].mute();
	});

	publisher.subscribe('allStemsActivated', playAllStems);

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
					const activated = (stem.active) ? 'activated' : 'deactivated';
					const currentTime = Math.round(stem.audio.currentTime * 10000) / 10000;
					const formattedTime = formatDecimal(currentTime, 3, 4);

					min = (min) ? Math.min(min, currentTime) : currentTime;
					max = (max) ? Math.max(max, currentTime) : currentTime;
					if (currentTime === 0) stem.audio.play();
					debugString.push(`   stem ${index}: ${formattedTime} | ${stem.fileName} - ${activated} | ${stem.audio.buffered.end(0)} / ${stem.audio.duration}`);
				}
			});
			const diff = formatDecimal(max - min, 1, 6);
			debugString.push(`   max diff: ${diff}`);
			debugOutput.innerHTML = debugString.join('<br>');
		}
	}, 100);

	track.stemsCount = stems.length;
	return track;
}


export default makeTrack;
