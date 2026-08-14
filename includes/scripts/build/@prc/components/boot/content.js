export function stage() {
	const Stage = window.prcSettingsPageStage;
	if (!Stage || !window.wp?.element?.createElement) {
		return null;
	}
	return window.wp.element.createElement(Stage);
}
