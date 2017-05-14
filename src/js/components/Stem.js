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

	stem.play = function playStem(initialize) {
		if (initialize) stem.audio.volume = 0;
		return new Promise((resolve, reject) => {
			if (!stem.ready) reject('stem is not ready');
			stem.audio.play().then(() => {
				stem.audio.volume = 1;
				stem.active = true;
				resolve();
			}).catch(() => {
				reject();
			});
		});
	};

	stem.reset = function resetStem() {
		stem.audio.pause();
		stem.audio.currentTime = 0;
	};

	stem.stop = function stopStem() {
		stem.active = false;
		stem.audio.pause();
	};

	stem.unmute = function unmuteStem(currentTime) {
		// if iOS has prevented volume change, it will still be 1
		if (currentTime && stem.audio.volume === 1) {
			if (currentTime) stem.audio.currentTime = currentTime;
			console.log(stem.audio.currentTime);
			stem.play();
		} else {
			stem.active = true;
			stem.audio.volume = 1;
		}
	};

	stem.mute = function muteStem() {
		stem.active = false;
		stem.audio.volume = 0;
		// iOS will prevent volume change. Stop the track instead
		if (stem.audio.volume === 1) {
			stem.stop();
		}
	};

	return stem;
}


export default makeStem;
