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
	const stemElements = query('audio', el);

	const stems = [];

	// See if all of the tracks are ready

	function checkIfReady() {
		const readyCount = stems.filter(stem => stem.isReady).length;
		if (readyCount === stems.length) {
			track.ready = true;
			track.element.classList.add('ready');
		}
	}

	// add each element to the tracks array.
	// When it's loaded,
	stemElements.map((stemElement) => {
		const stem = makeStem(stemElement);
		const url = stemElement.getAttribute('src').split('/');
		stem.fileName = url.slice(-1)[0];
		stems.push(stem);

		stem.audio.addEventListener('canplaythrough', () => {
			stem.isReady = true;
			checkIfReady();
		});
	});

	// functions that we attach to the 'track' object are public &
	// usable from the outside.
	// Everything else is private.

	function play() {
		// don't do anything if it's not ready. The user shouldn't be
		// able to play the track until it's ready anyway, though.
		if (!track.ready) return false;
		stems.map((stem, index) => {
			stem.play();
			publisher.emit('stemPlayed', index);
		});
		track.active = true;
		track.element.classList.add('playing');
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

	track.element.addEventListener('click', () => {
		publisher.emit('trackPlayed', trackIndex);
	});

	publisher.subscribe('trackPlayed', (newIndex) => {
		if (newIndex === trackIndex) {
			play();
		} else {
			stop();
		}
	});

	publisher.subscribe('stemActivated', (stemIndex) => {
		if (track.active) stems[stemIndex].activate();
	});
	publisher.subscribe('stemDeactivated', (stemIndex) => {
		if (track.active) stems[stemIndex].deactivate();
	});
	// publisher.subscribe('stemToggled', stemIndex => stems[stemIndex].toggle());
	publisher.subscribe('allStemsActivated', () => {
		stems.map((stem, index) => {
			stem.activate()
			publisher.emit('stemPlayed', index);
		});
	});

	/**
	 * Debug logging
	 */

	setInterval(() => {
		if (track.active) {
			stems.map((stem, index) => {
				const activated = (stem.active) ? 'activated' : 'deactivated';
				const currentTime = Math.round(stem.audio.currentTime * 100) / 100;
				console.log(`   stem ${index}: ${currentTime} | ${stem.fileName} - ${activated}`);
			});
			console.log('*******');
		}
	}, 100);

	track.stemsCount = stems.length;
	return track;
}


export default makeTrack;
