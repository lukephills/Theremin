// REQUEST ANIMATION FRAME POLYFILL
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());




//
//	THEREMIN
//

var theremin = (function () {

    'use strict';

    var nodes = {},

        thereminCtx,
        myAudioAnalyser,
        mySpectrum,
        surface,
        finger,
        source,
        scuzzLFO,
        hasTouch = false,
        isPlaying = false,
        audioSpectrumColor = '#342800',
        frequencyMultiplier = 1,
        spectrumMultiplier = 1,
        bar_width = 10,
        isSafari = navigator.userAgent.indexOf("Safari") !== -1,
        
        windowSize = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0];

        // MULTIPLIERS FOR 3 VIEWPORTS
        if (windowSize<580){
            frequencyMultiplier = 1.3;
            spectrumMultiplier = 1.3;

        } else if (windowSize<700){
            frequencyMultiplier = 1.2;
            spectrumMultiplier = spectrumMultiplier + 1;
            bar_width = bar_width + 1;

        } else if (windowSize<900){
            frequencyMultiplier = 1;
            spectrumMultiplier = spectrumMultiplier + 2;
            bar_width = bar_width + 2;
            
        } else if (windowSize<1070){
            frequencyMultiplier = 1;
            spectrumMultiplier = spectrumMultiplier + 3;
            bar_width = bar_width + 2;
            
        } else if (windowSize<1200){
            frequencyMultiplier = 1;
            spectrumMultiplier = spectrumMultiplier + 3.85;
            bar_width = bar_width + 3;

        } else if (windowSize<1400){
            frequencyMultiplier = 1;
            spectrumMultiplier = spectrumMultiplier + 4.2;
            bar_width = bar_width + 4;
        } else {
            frequencyMultiplier = 1;
            spectrumMultiplier = spectrumMultiplier + 4.5;
            bar_width = bar_width + 4;
        }

    return {

        init: function () {
            var doc = document;

            var AudioContext = (window.AudioContext ||
                window.webkitAudioContext ||
                window.mozAudioContext ||
                window.oAudioContext ||
                window.msAudioContext);

            if (AudioContext){
                thereminCtx = new AudioContext();
            } else {
                alert("Boo hiss! Sorry but this will not work in your browser. Please upgrade to the latest Chrome or Safari and have another try.");
            }

            // window.AudioContext = window.AudioContext || window.webkitAudioContext;
            // if ('AudioContext' in window) {
            //     thereminCtx = new AudioContext();
            // } else {
            //     document.getElementById('error').style.display = "block";
            //     alert("Please update your browser.")
            //     return;
            // }

            doc.getElementById('waveform').addEventListener('change', theremin.setWaveform, false);
            doc.getElementById('delay').addEventListener('input', theremin.sliderChange, false);
            doc.getElementById('feedback').addEventListener('input', theremin.sliderChange, false);
            doc.getElementById('scuzzVolume').addEventListener('input', theremin.sliderChange, false);
            doc.getElementById('mainVolume').addEventListener('input', theremin.sliderChange, false);

            surface = doc.querySelector('.surface');
            finger = doc.querySelector('.finger');

            // volume gains
            nodes.volume = thereminCtx.createGain ? thereminCtx.createGain() : thereminCtx.createGainNode();
            nodes.oscVolume = thereminCtx.createGain ? thereminCtx.createGain() : thereminCtx.createGainNode();
            nodes.finalVolume = thereminCtx.createGain ? thereminCtx.createGain() : thereminCtx.createGainNode();
            nodes.scuzzVolume = thereminCtx.createGain ? thereminCtx.createGain() : thereminCtx.createGainNode();

            // effects
            nodes.filter = thereminCtx.createBiquadFilter();
            nodes.delay = thereminCtx.createDelay ? thereminCtx.createDelay() : thereminCtx.createDelayNode();
            nodes.feedbackGain = thereminCtx.createGain ? thereminCtx.createGain() : thereminCtx.createGainNode();
            nodes.compressor = thereminCtx.createDynamicsCompressor();

            // audio analyser
            myAudioAnalyser = thereminCtx.createAnalyser();
            myAudioAnalyser.smoothingTimeConstant = 0.85;

            theremin.updateOutputs();
            theremin.animateSpectrum();

            surface.addEventListener('mousedown', theremin.play, false);
            surface.addEventListener('touchstart', theremin.play, false);

            doc.querySelector('.surface').addEventListener('touchmove', function (e) {
                e.preventDefault();
            });


            // theremin.routeSounds();
            // doc.querySelector('.main').classList.remove('off');
            // isPlaying = true;
        },

        routeSounds: function () {
            var doc = document;

            // Create the source
            source = thereminCtx.createOscillator();

            // Set the lowpass filter
            theremin.setWaveform(doc.getElementById('waveform'));
            nodes.filter.type = "lowpass" || 0;

            // Set slider values
            nodes.feedbackGain.gain.value = doc.getElementById('feedback').value;
            nodes.delay.delayTime.value = doc.getElementById('delay').value;
            nodes.scuzzVolume.gain.value = doc.getElementById('scuzzVolume').value;

            nodes.volume.gain.value = 0.6;
            nodes.oscVolume.gain.value = 0;
            nodes.finalVolume.gain.value = doc.getElementById('mainVolume').value;

            // Create the Scuzz             
            scuzzLFO = thereminCtx.createOscillator();
            scuzzLFO.frequency.value = 400;
            scuzzLFO.type = "sine";

            // Connect the Scuzz
            scuzzLFO.connect(nodes.scuzzVolume);

            // Previously this:
            // nodes.scuzzVolume.connect(source.frequency);

            // But changed to this to fix older safari bug
            nodes.scuzzVolume.connect(source.detune);

            source.connect(nodes.oscVolume); 
            nodes.oscVolume.connect(nodes.filter);

            nodes.filter.connect(nodes.compressor);
            nodes.filter.connect(nodes.delay);

            nodes.delay.connect(nodes.feedbackGain);
            nodes.delay.connect(nodes.compressor);

            nodes.feedbackGain.connect(nodes.delay);

            nodes.compressor.connect(nodes.volume);

            nodes.volume.connect(nodes.finalVolume);
            nodes.finalVolume.connect(myAudioAnalyser);
            myAudioAnalyser.connect(thereminCtx.destination);


                //touch screens not working until a slider is changed
                // also gradient background is clipped



            if (!scuzzLFO.start) {
                scuzzLFO.start = scuzzLFO.noteOn;
            }
            scuzzLFO.start(0);

            if (!source.start) {
                source.start = source.noteOn;
            }

            source.start(0);

            

        },


        play: function (e) {

            var x,
                y;
            
            if (!isPlaying) {
                
                    theremin.routeSounds();
                    isPlaying = true;
                
            }

            if (e.type === 'touchstart') {
                hasTouch = true;

            } else if (e.type === 'mousedown' && hasTouch) {
                return;
            }

            x = e.pageX - surface.offsetLeft;
            y = e.pageY - surface.offsetTop;

            nodes.oscVolume.gain.value = 1;

            source.frequency.value = x * frequencyMultiplier;
            theremin.setFilterFrequency(y);

            finger.style.webkitTransform = finger.style.MozTransform = finger.style.msTransform = finger.style.OTransform = finger.style.transform = 'translate3d(' + x + 'px,' + y  + 'px, 0)';
            finger.classList.add('active');

            surface.addEventListener('touchmove', theremin.effect, false);
            surface.addEventListener('touchend', theremin.stop, false);
            surface.addEventListener('touchcancel', theremin.stop, false);
            surface.addEventListener('mousemove', theremin.effect, false);
            surface.addEventListener('mouseup', theremin.stop, false);
        },

        stop: function (e) {
            var x = e.pageX - surface.offsetLeft,
                y = e.pageY - surface.offsetTop;
                

            if (e.type === 'mouseup' && hasTouch) {
                hasTouch = false;
                return;
            }

            if (isPlaying) {
                source.frequency.value = x * frequencyMultiplier;
                theremin.setFilterFrequency(y);
                nodes.oscVolume.gain.value = 0;
            }

            finger.classList.remove('active');

            surface.removeEventListener('mousemove', theremin.effect, false);
            surface.removeEventListener('mouseup', theremin.stop, false);
            surface.removeEventListener('touchmove', theremin.effect, false);
            surface.removeEventListener('touchend', theremin.stop, false);
            surface.removeEventListener('touchcancel', theremin.stop, false);
        },

        effect: function (e) {
            var x = e.pageX - surface.offsetLeft,
                y = e.pageY - surface.offsetTop;

            if (e.type === 'mousemove' && hasTouch) {
                return;
            }

            if (isPlaying) {
                source.frequency.value = x * frequencyMultiplier;
                theremin.setFilterFrequency(y);
            }

            finger.style.webkitTransform = finger.style.MozTransform = finger.style.msTransform = finger.style.OTransform = finger.style.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
        },

        updateOutputs: function (e) {
            var doc = document;
            doc.getElementById('delay-output').value = Math.round(doc.getElementById('delay').value * 1000) + ' ms';
            doc.getElementById('feedback-output').value = Math.round(doc.getElementById('feedback').value * 10);
            doc.getElementById('scuzzVolume-output').value = doc.getElementById('scuzzVolume').value;
            doc.getElementById('mainVolume-output').value = Math.round(doc.getElementById('mainVolume').value * 10);
        },

        setWaveform: function (option) {
            var value = option.value || this.value;
            var waves = ["sine", "square", "sawtooth", "triangle"] || [0,1,2,3];
            source.type = waves[value];
        },

        sliderChange: function (slider) {

            if (isPlaying) {
                if (!source.stop) {
                    source.stop = source.noteOff;
                }
                source.stop(0);
                isPlaying = false;
                if (slider.id === 'delay') {
                    nodes.delay.delayTime.value = slider.value;

                } else if (slider.id === 'feedback') {
                    nodes.feedbackGain.gain.value = slider.value;

                } else if (slider.id === 'scuzzVolume') {
                    nodes.scuzzVolume.gain.value = slider.value;

                } else if (slider.id === 'mainVolume') {
                    nodes.mainVolume.gain.value = slider.value;
                }
            }
            theremin.updateOutputs();
        },

        setFilterFrequency: function (y) {
            var min = 40; // min 40Hz
            var max = thereminCtx.sampleRate / 2; // max half of the sampling rate
            var numberOfOctaves = Math.log(max / min) / Math.LN2; // Logarithm (base 2) to compute how many octaves fall in the range.
            var multiplier = Math.pow(2, numberOfOctaves * (((2 / surface.clientHeight) * (surface.clientHeight - y)) - 1.0)); // Compute a multiplier from 0 to 1 based on an exponential scale.
            nodes.filter.frequency.value = max * multiplier; // Get back to the frequency value between min and max.
        },

        animateSpectrum: function () {
            mySpectrum = requestAnimationFrame(theremin.animateSpectrum, document.querySelector('canvas'));
            theremin.drawSpectrum();
        },

        drawSpectrum: function () {
            var canvas = document.querySelector('canvas'),
                ctx = canvas.getContext('2d'),
                canvasSize = windowSize + 30,
                width = canvasSize,
                height = canvasSize,
                freqByteData,
                barCount,
                magnitude,
                i;

                

            canvas.width = canvasSize - 20;
            canvas.height = canvasSize - 10;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = audioSpectrumColor;

            freqByteData = new Uint8Array(myAudioAnalyser.frequencyBinCount);
            myAudioAnalyser.getByteFrequencyData(freqByteData);
            barCount = Math.round(width / bar_width);

            for (i = 0; i < barCount; i += 1) {
                magnitude = freqByteData[i];
                // some values need adjusting to fit on the canvas
                ctx.fillRect(bar_width * i * 1.6, height, bar_width, -magnitude * spectrumMultiplier);
            }
        }
    };
}());

window.addEventListener("DOMContentLoaded", theremin.init, true);


// Pop up modal
$(document).ready(function () {
    $("button").click(function () {
        $(".pop").fadeIn(300);
        positionPopup();
    });

    $(".pop > span, .pop").click(function () {
        $(".pop").fadeOut(300);
    });
    $('.surface').mousedown(function (){
        $('.help').fadeOut(500);
    })

    // If Firefox
    if (bowser.gecko){
        $(".firefox").fadeIn(200);
    };
});


// Functions to get facebook and twitter share counts.
function getfbcount(url){
    var fblikes;
    $.getJSON('http://graph.facebook.com/?ids=' + url, function(data){;
        fblikes = data[url].shares;
        $('.fbCount').append(fblikes + " likes");
    });
}
function gettwcount(url){
    var tweets;
    $.getJSON('http://urls.api.twitter.com/1/urls/count.json?url=' + url + '&callback=?', function(data){
        tweets = data.count;
        $('.twCount').append(tweets + " tweets");
    });
}
$(document).ready(function($){
    var url = "http://www.femurdesign.com/theremin/";
    getfbcount(url);
    gettwcount(url);
});


