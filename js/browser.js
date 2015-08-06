window.onresize = doLayout;
var isLoading = false;

onload = function() {
	var webview = document.querySelector('webview');
	doLayout();

	var version = navigator.appVersion.substr(navigator.appVersion.lastIndexOf('Chrome/') + 7);
	var match = /([0-9]*)\.([0-9]*)\.([0-9]*)\.([0-9]*)/.exec(version);
	var majorVersion = parseInt(match[1]);
	var buildVersion = parseInt(match[3]);

	document.querySelector('#back').onclick = function() {
		webview.back();
	};

	document.querySelector('#forward').onclick = function() {
		webview.forward();
	};

	document.querySelector('#home').onclick = function() {
		navigateTo('https://appserver.gwn/GWN');
	};

	document.querySelector('#reload').onclick = function() {
		if (isLoading) {
		webview.stop();
		} else {
		webview.reload();
		}
	};

	document.querySelector('#reload').addEventListener(
		'webkitAnimationIteration',
		function() {
		if (!isLoading) {
			document.body.classList.remove('loading');
		}
	});

	document.querySelector('#terminate').onclick = function() {
		webview.terminate();
	};

	document.querySelector('#clear-data').onclick = function() {
		var clearDataType = {
			appcache: true,
			cookies: true,
			fileSystems: true,
			indexedDB: true,
			localStorage: true,
			webSQL: true,
		}
		if (majorVersion >= 44 || (majorVersion == 43 && buildVersion >= 2350)) {
			clearDataType['cache'] = true;
		}
		webview.clearData(
			{ since: 0 }, // Remove all browsing data.
			clearDataType,
			function() { webview.reload(); }
		);
	};

	document.querySelector('#location-form').onsubmit = function(e) {
		e.preventDefault();
		navigateTo(document.querySelector('#location').value);
	};

	webview.addEventListener('exit', handleExit);
	webview.addEventListener('loadstart', handleLoadStart);
	webview.addEventListener('loadstop', handleLoadStop);
	webview.addEventListener('loadabort', handleLoadAbort);
	webview.addEventListener('loadredirect', handleLoadRedirect);
	webview.addEventListener('loadcommit', handleLoadCommit);
	webview.addEventListener('permissionrequest', handlePermission);

	customUA();
};

function handlePermission(event) {
	console.log(event.permission);
	switch (event.permission) {
		case 'fullscreen':
		case 'loadplugin':
			console.log('loading...');
			console.log(event.request);
			event.request.allow();
	}
}

function customUA() {
	var webview = document.querySelector('webview');
	currentUA = webview.getUserAgent();
	webview.setUserAgentOverride(currentUA + ' iPad');
};

function strStartsWith(str, prefix) {
	return str.indexOf(prefix) === 0;
}

function navigateTo(url) {
	resetExitedState();
	if (!strStartsWith(url, 'http')) {
		url = 'http://' + url;
	}
	document.querySelector('webview').src = url;
}

function doLayout() {
	var webview = document.querySelector('webview');
	var controls = document.querySelector('#controls');
	var controlsHeight = controls.offsetHeight;
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var webviewWidth = windowWidth;
	var webviewHeight = windowHeight - controlsHeight;

	webview.style.width = webviewWidth + 'px';
	webview.style.height = webviewHeight + 'px';

	var sadWebview = document.querySelector('#sad-webview');
	sadWebview.style.width = webviewWidth + 'px';
	sadWebview.style.height = webviewHeight * 2/3 + 'px';
	sadWebview.style.paddingTop = webviewHeight/3 + 'px';
}

function handleExit(event) {
	console.log(event.type);
	document.body.classList.add('exited');
	if (event.type == 'abnormal') {
		document.body.classList.add('crashed');
	} else if (event.type == 'killed') {
		document.body.classList.add('killed');
	}
}

function resetExitedState() {
	document.body.classList.remove('exited');
	document.body.classList.remove('crashed');
	document.body.classList.remove('killed');
}

function handleKeyDown(event) {
	if (event.ctrlKey) {
		switch (event.keyCode) {
		// Ctrl+F.
		case 70:
			event.preventDefault();
			openFindBox();
			break;

		// Ctrl++.
		case 107:
		case 187:
			event.preventDefault();
			increaseZoom();
			break;

		// Ctrl+-.
		case 109:
		case 189:
			event.preventDefault();
			decreaseZoom();
		}
	}
}

function gwnURL() {
	urlValue = document.querySelector('#location').value;
	if ( urlValue.indexOf("appserver.gwn") >= 0 ) {
		document.querySelector('#location').value = 'GetWellNetwork';
		document.querySelector('#controls').style.display = 'none';
		doLayout();
	} else {
		document.querySelector('#controls').style.display = '-webkit-flex';
		doLayout();
	}
}

function handleLoadCommit(event) {
	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}

	document.querySelector('#location').value = event.url;
	gwnURL();

	var webview = document.querySelector('webview');
	document.querySelector('#back').disabled = !webview.canGoBack();
	document.querySelector('#forward').disabled = !webview.canGoForward();
}

function handleLoadStart(event) {
	document.body.classList.add('loading');
	isLoading = true;

	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}

	document.querySelector('#location').value = event.url;
	gwnURL();
}

function handleLoadStop(event) {
	// We don't remove the loading class immediately, instead we let the animation
	// finish, so that the spinner doesn't jerkily reset back to the 0 position.
	isLoading = false;
}

function handleLoadAbort(event) {
	console.log('LoadAbort');
	console.log('  url: ' + event.url);
	console.log('  isTopLevel: ' + event.isTopLevel);
	console.log('  type: ' + event.type);
}

function handleLoadRedirect(event) {
	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}

	document.querySelector('#location').value = event.newUrl;
	gwnURL();
}

