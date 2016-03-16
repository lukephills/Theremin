//borrowed from underscore.js
function isUndef(val){
    return val === void 0;
}

//borrowed from underscore.js
function isFunction(val){
    return typeof val === "function";
}

var audioContext;

//polyfill for AudioContext and OfflineAudioContext
if (isUndef(window.AudioContext)){
    window.AudioContext = window.webkitAudioContext;
}
if (isUndef(window.OfflineAudioContext)){
    window.OfflineAudioContext = window.webkitOfflineAudioContext;
}

if (!isUndef(AudioContext)){
    audioContext = new AudioContext();
} else {
    throw new Error("Web Audio is not supported in this browser");
}

//SHIMS////////////////////////////////////////////////////////////////////

if (!isFunction(AudioContext.prototype.createGain)){
    AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
}
if (!isFunction(AudioContext.prototype.createDelay)){
    AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
}
if (!isFunction(AudioContext.prototype.createPeriodicWave)){
    AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;
}
if (!isFunction(AudioBufferSourceNode.prototype.start)){
    AudioBufferSourceNode.prototype.start = AudioBufferSourceNode.prototype.noteGrainOn;
}
if (!isFunction(AudioBufferSourceNode.prototype.stop)){
    AudioBufferSourceNode.prototype.stop = AudioBufferSourceNode.prototype.noteOff;
}
if (!isFunction(OscillatorNode.prototype.start)){
    OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
}
if (!isFunction(OscillatorNode.prototype.stop)){
    OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;
}
if (!isFunction(OscillatorNode.prototype.setPeriodicWave)){
    OscillatorNode.prototype.setPeriodicWave = OscillatorNode.prototype.setWaveTable;
}
