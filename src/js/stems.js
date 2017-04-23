// A small utility for getting DOM elements
import { query, queryOne } from '@artcommacode/q';

// A component you can use to emit and subscribe to events.
// Helpful to decouple UI stuff
import publisher from './components/publisher';
import makeTrack from './components/Track';
import makeButton from './components/Button';

// first, just find the elements
const trackElements = query('.stem-track');
const everything = queryOne('.stem-buttons .play-all') || false;
const buttons = [];
const tracks = [];

let readyCount = 0;

function readyHandler() {
	readyCount += 1;
	if (readyCount === tracks.length) {
		queryOne('.stems-container').classList.add('ready');
	}
}

// add each composed track to an array
trackElements.map((track, index) => {
	const newTrack = makeTrack(track, index, publisher, readyHandler);
	tracks.push(newTrack);
});

query('.stem-buttons .stem-button').map((button, index) => {
	const newButton = makeButton(button, index, publisher);
	buttons.push(newButton);
});

/**
 * Event Listeners
 */

if (everything) {
	everything.addEventListener('click', () => {
		publisher.emit('allStemsActivated');
	});
}

// Use each track element as the source of a Stem object
