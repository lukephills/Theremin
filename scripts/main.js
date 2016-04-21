!function(a,b){"function"==typeof define?define(b):"undefined"!=typeof module&&module.exports?module.exports.browser=b():this[a]=b()}("bowser",function(){function a(){return e?{name:"Internet Explorer",msie:d,version:c.match(/(msie |rv:)(\d+(\.\d+)?)/i)[2]}:m?{name:"Opera",opera:d,version:c.match(q)?c.match(q)[1]:c.match(/opr\/(\d+(\.\d+)?)/i)[1]}:f?{name:"Chrome",webkit:d,chrome:d,version:c.match(/chrome\/(\d+(\.\d+)?)/i)[1]}:g?{name:"PhantomJS",webkit:d,phantom:d,version:c.match(/phantomjs\/(\d+(\.\d+)+)/i)[1]}:k?{name:"TouchPad",webkit:d,touchpad:d,version:c.match(/touchpad\/(\d+(\.\d+)?)/i)[1]}:i||j?(b={name:i?"iPhone":"iPad",webkit:d,mobile:d,ios:d,iphone:i,ipad:j},q.test(c)&&(b.version=c.match(q)[1]),b):l?{name:"Android",webkit:d,android:d,mobile:d,version:(c.match(q)||c.match(r))[1]}:h?{name:"Safari",webkit:d,safari:d,version:c.match(q)[1]}:o?(b={name:"Gecko",gecko:d,mozilla:d,version:c.match(r)[1]},n&&(b.name="Firefox",b.firefox=d),b):p?{name:"SeaMonkey",seamonkey:d,version:c.match(/seamonkey\/(\d+(\.\d+)?)/i)[1]}:{}}var b,c=navigator.userAgent,d=!0,e=/(msie|trident)/i.test(c),f=/chrome/i.test(c),g=/phantom/i.test(c),h=/safari/i.test(c)&&!f&&!g,i=/iphone/i.test(c),j=/ipad/i.test(c),k=/touchpad/i.test(c),l=/android/i.test(c),m=/opera/i.test(c)||/opr/i.test(c),n=/firefox/i.test(c),o=/gecko\//i.test(c),p=/seamonkey\//i.test(c),q=/version\/(\d+(\.\d+)?)/i,r=/firefox\/(\d+(\.\d+)?)/i,s=a();return s.msie&&s.version>=8||s.chrome&&s.version>=10||s.firefox&&s.version>=4||s.safari&&s.version>=5||s.opera&&s.version>=10?s.a=d:s.msie&&s.version<8||s.chrome&&s.version<10||s.firefox&&s.version<4||s.safari&&s.version<5||s.opera&&s.version<10?s.c=d:s.x=d,s}),function(){for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var c=(new Date).getTime(),d=Math.max(0,16-(c-a)),e=window.setTimeout(function(){b(c+d)},d);return a=c+d,e}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})}();var theremin=function(){"use strict";var a,b,c,d,e,f,g,h={},i=!1,j=!1,k="#342800",l=1,m=1,n=10,o=(-1!==navigator.userAgent.indexOf("Safari"),window.innerWidth||document.documentElement.clientWidth||document.getElementsByTagName("body")[0]);return 580>o?(l=1.3,m=1.3):700>o?(l=1.2,m+=1,n+=1):900>o?(l=1,m+=2,n+=2):1070>o?(l=1,m+=3,n+=2):1200>o?(l=1,m+=3.85,n+=3):1400>o?(l=1,m+=4.2,n+=4):(l=1,m+=4.5,n+=4),{init:function(){var c=document,f=window.AudioContext||window.webkitAudioContext||window.mozAudioContext||window.oAudioContext||window.msAudioContext;f?a=new f:alert("Boo hiss! Sorry but this will not work in your browser. Please upgrade to the latest Chrome or Safari and have another try."),c.getElementById("waveform").addEventListener("change",theremin.setWaveform,!1),c.getElementById("delay").addEventListener("input",theremin.sliderChange,!1),c.getElementById("feedback").addEventListener("input",theremin.sliderChange,!1),c.getElementById("scuzzVolume").addEventListener("input",theremin.sliderChange,!1),c.getElementById("mainVolume").addEventListener("input",theremin.sliderChange,!1),d=c.querySelector(".surface"),e=c.querySelector(".finger"),h.volume=a.createGain?a.createGain():a.createGainNode(),h.oscVolume=a.createGain?a.createGain():a.createGainNode(),h.finalVolume=a.createGain?a.createGain():a.createGainNode(),h.scuzzVolume=a.createGain?a.createGain():a.createGainNode(),h.filter=a.createBiquadFilter(),h.delay=a.createDelay?a.createDelay():a.createDelayNode(),h.feedbackGain=a.createGain?a.createGain():a.createGainNode(),h.compressor=a.createDynamicsCompressor(),b=a.createAnalyser(),b.smoothingTimeConstant=.85,theremin.updateOutputs(),theremin.animateSpectrum(),d.addEventListener("mousedown",theremin.play,!1),d.addEventListener("touchstart",theremin.play,!1),c.querySelector(".surface").addEventListener("touchmove",function(a){a.preventDefault()})},routeSounds:function(){var c=document;f=a.createOscillator(),theremin.setWaveform(c.getElementById("waveform")),h.filter.type="lowpass",h.feedbackGain.gain.value=c.getElementById("feedback").value,h.delay.delayTime.value=c.getElementById("delay").value,h.scuzzVolume.gain.value=c.getElementById("scuzzVolume").value,h.volume.gain.value=.6,h.oscVolume.gain.value=0,h.finalVolume.gain.value=c.getElementById("mainVolume").value,g=a.createOscillator(),g.frequency.value=400,g.type="sine",g.connect(h.scuzzVolume),h.scuzzVolume.connect(f.detune),f.connect(h.oscVolume),h.oscVolume.connect(h.filter),h.filter.connect(h.compressor),h.filter.connect(h.delay),h.delay.connect(h.feedbackGain),h.delay.connect(h.compressor),h.feedbackGain.connect(h.delay),h.compressor.connect(h.volume),h.volume.connect(h.finalVolume),h.finalVolume.connect(b),b.connect(a.destination),g.start||(g.start=g.noteOn),g.start(0),f.start||(f.start=f.noteOn),f.start(0)},play:function(a){var b,c;if(j||(theremin.routeSounds(),j=!0),"touchstart"===a.type)i=!0;else if("mousedown"===a.type&&i)return;b=a.pageX-d.offsetLeft,c=a.pageY-d.offsetTop,h.oscVolume.gain.value=1,f.frequency.value=b*l,theremin.setFilterFrequency(c),e.style.webkitTransform=e.style.MozTransform=e.style.msTransform=e.style.OTransform=e.style.transform="translate3d("+b+"px,"+c+"px, 0)",e.classList.add("active"),d.addEventListener("touchmove",theremin.effect,!1),d.addEventListener("touchend",theremin.stop,!1),d.addEventListener("touchcancel",theremin.stop,!1),d.addEventListener("mousemove",theremin.effect,!1),d.addEventListener("mouseup",theremin.stop,!1)},stop:function(a){var b=a.pageX-d.offsetLeft,c=a.pageY-d.offsetTop;return"mouseup"===a.type&&i?void(i=!1):(j&&(f.frequency.value=b*l,theremin.setFilterFrequency(c),h.oscVolume.gain.value=0),e.classList.remove("active"),d.removeEventListener("mousemove",theremin.effect,!1),d.removeEventListener("mouseup",theremin.stop,!1),d.removeEventListener("touchmove",theremin.effect,!1),d.removeEventListener("touchend",theremin.stop,!1),void d.removeEventListener("touchcancel",theremin.stop,!1))},effect:function(a){var b=a.pageX-d.offsetLeft,c=a.pageY-d.offsetTop;"mousemove"===a.type&&i||(j&&(f.frequency.value=b*l,theremin.setFilterFrequency(c)),e.style.webkitTransform=e.style.MozTransform=e.style.msTransform=e.style.OTransform=e.style.transform="translate3d("+b+"px,"+c+"px, 0)")},updateOutputs:function(){var a=document;a.getElementById("delay-output").value=Math.round(1e3*a.getElementById("delay").value)+" ms",a.getElementById("feedback-output").value=Math.round(10*a.getElementById("feedback").value),a.getElementById("scuzzVolume-output").value=a.getElementById("scuzzVolume").value,a.getElementById("mainVolume-output").value=Math.round(10*a.getElementById("mainVolume").value)},setWaveform:function(a){var b=a.value||this.value,c=["sine","square","sawtooth","triangle"]||[0,1,2,3];f.type=c[b]},sliderChange:function(a){j&&(f.stop||(f.stop=f.noteOff),f.stop(0),j=!1,"delay"===a.id?h.delay.delayTime.value=a.value:"feedback"===a.id?h.feedbackGain.gain.value=a.value:"scuzzVolume"===a.id?h.scuzzVolume.gain.value=a.value:"mainVolume"===a.id&&(h.mainVolume.gain.value=a.value)),theremin.updateOutputs()},setFilterFrequency:function(b){var c=40,e=a.sampleRate/2,f=Math.log(e/c)/Math.LN2,g=Math.pow(2,f*(2/d.clientHeight*(d.clientHeight-b)-1));h.filter.frequency.value=e*g},animateSpectrum:function(){c=requestAnimationFrame(theremin.animateSpectrum,document.querySelector("canvas")),theremin.drawSpectrum()},drawSpectrum:function(){var a,c,d,e,f=document.querySelector("canvas"),g=f.getContext("2d"),h=o+30,i=h,j=h;for(f.width=h-20,f.height=h-10,g.clearRect(0,0,i,j),g.fillStyle=k,a=new Uint8Array(b.frequencyBinCount),b.getByteFrequencyData(a),c=Math.round(i/n),e=0;c>e;e+=1)d=a[e],g.fillRect(n*e*1.6,j,n,-d*m)}}}();window.addEventListener("DOMContentLoaded",theremin.init,!0),function(){$("button").click(function(){$(".pop").fadeIn(300)}),$(".pop > span, .pop").click(function(){$(".pop").fadeOut(300)}),$(".surface").mousedown(function(){$(".help").fadeOut(500)}),bowser.gecko&&$(".firefox").fadeIn(200)}(),function(){function a(a){var b;$.getJSON("http://graph.facebook.com/?ids="+a,function(c){b=c[a].shares,$(".fbCount").append(b+" likes")})}function b(a){var b;$.getJSON("http://urls.api.twitter.com/1/urls/count.json?url="+a+"&callback=?",function(a){b=a.count,$(".twCount").append(b+" tweets")})}var c="http://www.femurdesign.com/theremin/";a(c),b(c)}();