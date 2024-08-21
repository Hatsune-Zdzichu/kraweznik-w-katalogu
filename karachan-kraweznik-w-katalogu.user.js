// ==UserScript==
// @name		karachan krawężnik w katalogu
// @version		1
// @grant		none
// @match		https://karachan.org/*
// ==/UserScript==

(() => {
	let boardPrefix, allThreads, hiddenThreads, toggleState, toggleButton;

	const initCatalogView = () => {
		boardPrefix = `h_${window.location.pathname.substring(1, 1 + window.location.pathname.substring(1).indexOf('/'))}_`;

		allThreads = [...document.querySelectorAll('#threads > div.thread')];
		hiddenThreads = [];
		Object.keys(window.localStorage)
			.filter(e => e.startsWith(boardPrefix))
			.forEach(e => {
				const thread = document.getElementById(`thread-${e.substring(boardPrefix.length)}`);
				thread ? hiddenThreads.push(thread) : window.localStorage.removeItem(e);
			});

		allThreads.forEach(e => addKraweznikButton(e, hiddenThreads.indexOf(e) === -1));
		hiddenThreads.forEach(e => hideElement(e, true));

		addToggleViewButton();
	}

	const toggleView = () => {
		allThreads.forEach(e => hideElement(e, toggleState));
		hiddenThreads.forEach(e => hideElement(e, !toggleState));
		toggleButton.innerText = toggleState ? 'Pokaż nieukryte' : 'Pokaż ukryte';
		toggleState = !toggleState;
	}

	const addToggleViewButton = () => {
		toggleState = true;
		toggleButton = document.createElement('a');
		const navlinks = document.querySelector('.navLinks');
		toggleButton.addEventListener('click', toggleView);
		toggleButton.innerText = 'Pokaż ukryte';
		navlinks.insertBefore(toggleButton, navlinks.querySelector('br'));
		navlinks.insertBefore(document.createTextNode(' ['), toggleButton);
		toggleButton.after(document.createTextNode(']'));
	}

	const addKraweznikButton = (thread, bool) => {
		const a = document.createElement('a');
		const meta = thread.querySelector('.meta');
		meta.appendChild(a);
		a.innerText = bool ? ' [ – ] ' : ' [ + ] ';
		a.addEventListener('click', () => {
			hideElement(thread, true);
			meta.removeChild(a);
			addKraweznikButton(thread, !bool);
			const keyName = boardPrefix + thread.id.substring(7);
			if(bool) {
				window.localStorage.setItem(keyName, thread.querySelector('.teaser').innerText);
				hiddenThreads.push(thread);
			} else {
				window.localStorage.removeItem(keyName);
				hiddenThreads.splice(hiddenThreads.indexOf(thread), 1);
				if(hiddenThreads.length === 0) {
					toggleView();
				}
			}
		});
	}

	const hideElement = (e, bool) => {
		e.style.display = bool ? 'none' : '';
	}

	const fixKraweznikInThreadView = () => {
		document.querySelector('a.hider').addEventListener('click', () => {
			window.location.pathname = window.location.pathname.split('res')[0] + "catalog.html";
		});
	}

	if(window.location.pathname.endsWith('/catalog.html')) {
		window.addEventListener('DOMContentLoaded', initCatalogView);
	} else if(window.location.pathname.includes('/res/')) {
		window.addEventListener('DOMContentLoaded', fixKraweznikInThreadView);
	}
})();