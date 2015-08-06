var pls;

chrome.app.runtime.onLaunched.addListener(function() {
	runPLS();
});

chrome.app.runtime.onRestarted.addListener(function() {
	runPLS();
});

function handleKeyEvent(e) {
	switch (e.keyCode) {
		// ESC
		case 27:
			e.preventDefault();
			break;
		// F12
		case 123:
			chrome.app.window.create('keypress.html', {
				frame: 'none'
			});
			break;
	}
}

function runPLS() {
	chrome.app.window.create('browser.html', {
		state: 'fullscreen',
		frame: 'none',
		id: 'pls'
		},
		function(win) {
			pls = win;

			win.contentWindow.document.addEventListener('keydown', handleKeyEvent);
			win.contentWindow.document.addEventListener('keyup', function(e) {
				e.preventDefault();
			});
		}
	);
}
