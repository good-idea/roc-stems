import { query, queryOne } from '@artcommacode/q';

/**
 * Receives a DOM element with links to audio files to be played in tandem as stems.
 * Returns an object with play/pause/mute methods
 * @param  {DOM element} element
 * @return {Stem}
 */
function makeStem(element) {
	const stem = {};
	stem.audio = element;
	stem.active = false;
	const url = stem.audio.getAttribute('src').split('/');
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
		console.log('stem muted')
		stem.active = false;
		stem.audio.volume = 0;
	};

	return stem;
}


export default makeStem;
