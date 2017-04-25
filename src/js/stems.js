// A small utility for getting DOM elements
import { query, queryOne } from '@artcommacode/q';

// A component you can use to emit and subscribe to events.
// Helpful to decouple UI stuff
import publisher from './components/publisher';
import makeTrack from './components/Track';
import makeButton from './components/Button';

// first, just find the elements
const trackElements = query('.stem-track');
const everything = queryOne('.stem-button--play-all') || false;
const buttons = [];
const tracks = [];

// add each composed track to an array
trackElements.map((track, index) => {
	const newTrack = makeTrack(track, index, publisher);
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
		publisher.emit('allStemsToggled');
	});
}

// Use each track element as the source of a Stem object
