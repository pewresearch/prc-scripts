/**
 * External Dependencies
 */
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

// Establish the main firebase config object
const { prcFirebaseConfig, prcFirebaseInteractivesConfig } = window;

const app = firebase.initializeApp(prcFirebaseConfig);
const interactives = firebase.initializeApp(
	prcFirebaseInteractivesConfig,
	'interactivesDB'
);
const auth = firebase.auth();

console.log(
	'@prc/firebase config:',
	prcFirebaseConfig,
	prcFirebaseInteractivesConfig,
	firebase
);

function loadScript(slug, script) {
	if (!window[slug]) {
		window[slug] = script;
	}
}

loadScript('firebase', app);
loadScript('interactivesDB', interactives);
loadScript('firebaseAuth', auth);
