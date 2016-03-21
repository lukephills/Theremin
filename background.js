chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {
        'outerBounds': {
            'width': 800,
            'height': 500,
            'minWidth': 360,
            'minHeight': 450,
        }
    });
});