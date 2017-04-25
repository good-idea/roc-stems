# Usage

The compiled file is `dist/js/stems.js`. Include that in the footer of your markup.

**Important note:** Your stem files need to be hosted on the same domain, or on one that allows for cross-origin requests.

## Required Markup

### Stem Tracks

Stems for each track should be listed as an array in an attribute on an element with a `data-stems` attribute and a `.play-stem` class.

Example:

```
<li class="play-stem"
	data-stems='["http://www.standard-quality.biz/external/roc-stems/catharsis-bass.mp3",
							 "http://www.standard-quality.biz/external/roc-stems/catharsis-drums.mp3",
							 "http://www.standard-quality.biz/external/roc-stems/catharsis-synth.mp3",
							 "http://www.standard-quality.biz/external/roc-stems/catharsis-vox.mp3"]'>
1. Catharsis</li>
```
**Caveat**: Use single quotes to wrap the *entire* attribute, and double quotes to wrap each track.

When each track is played, it will enable one button for each of its stems.

#### Options

 - Autoload: give the element a `autoload` attribute to load the stems automatically.
 - Autoplay: give the element a `autoplay` attribute to play after autoloading. Example:

 ```
 <li class="stem-track"
	 autoload
	 autoplay
	 data-stems='["/roc-stems/catharsis-bass.mp3",
							 "/roc-stems/catharsis-drums.mp3",
							 "/roc-stems/catharsis-synth.mp3",
							 "/roc-stems/catharsis-vox.mp3"]'>
	 1. Catharsis
 </li>
 ```

### Stem Buttons

Buttons that activate & deactivate stems should be given a `.stem-button` class. The button that plays all stems should have a class of `.stem-button--play-all`.

Example:

```
<div class="stem-button">
	<img src="img/shape0.png" >
</div>
<div class="stem-button">
	<img src="img/shape1.png">
</div>

<h2 class="everything stem-button--play-all">EVERYTHING</h2>
```

The buttons are discovered in the DOM one at a time, and their index will toggle the stem on the active track with the same index. Given the examples above, the second button will play the `catharsis-drums.mp3` stem.

### Styling

This script will add and remove classes to the track and stem buttons depending on their state.

**Track**

`.stem-track` - bare state
`.stem-track.loading` - applied while loading. Will be removed once loaded and replaced with:
`.stem-track.loaded` - fully loaded state.
`.stem-track.has-errors` - Applied if there are errors loading any of the stems.
`.stem-track.playing` - Applied during playback.

**Stem Button**

`.stem-button` - bare state
`.stem-button.enabled` - Applied when the button can be used
`.stem-button.active` - Applied while the associated stem is playing

**Debugging**

If you want a little debugging info, add the following anywhere in your markup:

```
<h4 id="debug-output" class="debug-output" style="display: none"></h4>
```

It will output info in the format: `stem [index]: [playback time] | [filename] - [state] | [seconds loaded] | [track length]`

**See `src/css/stems-player.css` for some examples.**

----

# Development

## Run Locally

Make sure you have [Node](https://nodejs.org/en/download/) installed.

`npm run start` and visit `http://localhost:3000`

Put all track stems in `public/roc-stems` (files are not included in the repo)

## Modify/Compile

 - Install dependencies: `npm install`
 - Run a server, watching for changes in the markup: `npm start`
 - Recompile CSS & JS files on change: `gulp watch`
