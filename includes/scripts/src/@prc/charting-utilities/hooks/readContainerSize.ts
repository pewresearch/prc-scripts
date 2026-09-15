export interface SizedContainer {
	clientWidth: number;
	clientHeight: number;
}

function readContainerSize(element: SizedContainer): {
	width: number;
	height: number;
} {
	return {
		width: element.clientWidth,
		height: element.clientHeight,
	};
}

export { readContainerSize };
