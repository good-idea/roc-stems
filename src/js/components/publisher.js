
class PubSubEmitter {
	constructor() {
		// create a new Map to hold all of the topics
		this.listeners = new Map();
	}

	subscribe(topic, callback) {
		// if the listener does not hae the topic yet, add it.
		if (!this.listeners.has(topic)) this.listeners.set(topic, []);
		// push the callback to the topic's array
		this.listeners.get(topic).push(callback);
	}

	unsubscribe(topic, callback) {
		const listeners = this.listeners.get(topic);
		let index;

		if (listeners && listeners.length) {
			// find the index of the callback we're removing
			index = listeners.reduce((i, listener, currentIndex) => {
				(typeof(listener) === 'function' && listener === callback) ?
					i = currentIndex :
					i;
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

	emit(topic, ...args) {
		// get the listeners subscribed to the topic
		const listeners = this.listeners.get(topic);

		if (listeners && listeners.length) {
			// execute each callback with any supplied arguments
			listeners.forEach((listener) => {
				listener(...args);
			});
			return true;
		}
		return false;
	}
}

const publisher = new PubSubEmitter();

export default publisher;
