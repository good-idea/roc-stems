import { query, queryOne } from '@artcommacode/q';

/**
 * Receives a DOM element with links to audio files to be played in tandem as stems.
 * Returns an object with play/pause/mute methods
 * @param  {DOM element} element
 * @return {Stem}
 */
function makeStem(src) {
	const stem = {};
	stem.audio = new Audio();

	stem.load = function loadStem(loadedCallback) {
		stem.fileName = src.replace(/\/$/).split('/').pop();
		const xhr = new XMLHttpRequest();
		xhr.open('GET', encodeURI(src), true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.responseType = 'blob';
		xhr.onload = (e) => {
			const blob = new Blob([xhr.response], { type: 'audio/mp3' });
			const objectUrl = URL.createObjectURL(blob);
			stem.audio.src = objectUrl;
			stem.audio.onload = () => {
				URL.revokeObjectURL(objectUrl);
			};
			stem.ready = true;
			const error = (e.target.status !== 200) ? `${e.target.status} ${e.target.statusText}` : false;
			loadedCallback(error);
		};
		xhr.send();
	};

	// const stem = {};
	// stem.audio = element;
	// stem.active = false;
	// const url = stem.audio.getAttribute('src').split('/');
	// stem.fileName = url.slice(-1)[0];

	stem.play = function playStem() {
		if (stem.ready) {
			stem.unmute();
			stem.audio.play();
		}
		stem.active = true;
		try {
			stem.audio.play();
		} catch (e) {
			// do nothing
		}
	};

	stem.reset = function resetStem() {
		stem.stop();
		stem.audio.volume = 1;
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
		stem.active = false;
		stem.audio.volume = 0;
	};

	return stem;
}


export default makeStem;
