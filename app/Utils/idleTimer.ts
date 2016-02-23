//Stop all audio on pageshow?

var intTime = new Date().getTime();
var getTime = function() {
	var intNow = new Date().getTime();
	if (intNow - intTime > 1000) {
		console.log("I JUST WOKE UP")
	}
	intTime = intNow;
	setTimeout(getTime,500);
};
getTime();