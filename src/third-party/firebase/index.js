/**
 * External Dependencies
 */
import * as firebase from 'firebase/app';
import * as auth from 'firebase/auth';
import * as database from 'firebase/database';

// Establish the main firebase config object
const { prcFirebaseConfig, prcFirebaseInteractivesConfig } = window;
const app = firebase.initializeApp(prcFirebaseConfig);
// const interactives = firebase.initializeApp(prcFirebaseInteractivesConfig);
console.log('@prc/firebase config:', prcFirebaseConfig, prcFirebaseInteractivesConfig, firebase);

function loadScript(slug, script) {
	if (!window[slug]) {
		window[slug] = script;
	}
}

loadScript('firebase', app);
// loadScript('firebaseInteractives', interactives);
loadScript('firebaseAuth', auth);
loadScript('firebaseDatabase', database);
