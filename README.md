## Required Markup

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

## Run Locally

`npm install`
`npm run serve`

## Modify/Compile

`gulp watch`
