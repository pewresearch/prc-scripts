import type { MeasureLabelBBoxOptions } from './measureLabel';

export interface LeaderLineRegistration {
	id: string;
	anchorX: number;
	anchorY: number;
	labelCenterX: number;
	labelCenterY: number;
	text: string;
	fontSize: number;
	fontFamily: string;
	fontWeight?: string | number;
	maxWidth?: number;
	textAnchor?: MeasureLabelBBoxOptions['textAnchor'];
	dominantBaseline?: MeasureLabelBBoxOptions['dominantBaseline'];
	anchorRadius?: number;
	stroke?: string;
	strokeWidth?: number;
	threshold?: number;
}

type Listener = () => void;

export function createLeaderLineStore() {
	const registry = new Map<string, LeaderLineRegistration>();
	let listeners: Listener[] = [];
	let snapshotVersion = 0;

	function emit() {
		snapshotVersion += 1;
		listeners.forEach((listener) => listener());
	}

	return {
		subscribe(listener: Listener) {
			listeners.push(listener);
			return () => {
				listeners = listeners.filter((item) => item !== listener);
			};
		},
		getSnapshot() {
			return snapshotVersion;
		},
		getLines(): IterableIterator<LeaderLineRegistration> {
			return registry.values();
		},
		register(entry: LeaderLineRegistration) {
			registry.set(entry.id, entry);
			emit();
		},
		unregister(id: string) {
			if (registry.delete(id)) {
				emit();
			}
		},
	};
}

export type LeaderLineStore = ReturnType<typeof createLeaderLineStore>;
