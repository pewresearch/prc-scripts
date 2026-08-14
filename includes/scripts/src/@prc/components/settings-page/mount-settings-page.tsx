import { createRoot } from '@wordpress/element';
import type { ComponentType } from 'react';

declare global {
	interface Window {
		prcSettingsPageStage?: ComponentType;
	}
}

/**
 * Mount a settings page React app into a WP Admin container div.
 *
 * When PHP rendered a Boot layout container, Gutenberg's initSinglePage owns
 * createRoot. This only assigns the stage component for the shared ESM bridge.
 *
 * @param containerId DOM id of the mount target rendered by PHP.
 * @param App         Root settings app component.
 */
export function mountSettingsPage(
	containerId: string,
	App: ComponentType
): void {
	// Assign before Boot's deferred import() resolves so stage() can render.
	window.prcSettingsPageStage = App;

	const mount = () => {
		const container = document.getElementById(containerId);
		if (!container) {
			return;
		}
		if (container.classList.contains('boot-layout-container')) {
			return;
		}

		const root = createRoot(container);
		root.render(<App />);
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else {
		mount();
	}
}
