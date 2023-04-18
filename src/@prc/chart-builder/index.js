import {
	ChartBuilderWrapper,
	baseConfig,
	ChartBuilderTextWrapper,
} from '@pewresearch/chart-builder/dist';
// @TODO: @benwormald This needs to be brought in to prc-scripts proper.

function loadScript(slug, script) {
	if (!window.prcChartBuilder[slug]) {
		window.prcChartBuilder[slug] = script;
	}
}

window.prcChartBuilder = {};

loadScript('ChartBuilderWrapper', ChartBuilderWrapper);
loadScript('ChartBuilderTextWrapper', ChartBuilderTextWrapper);
loadScript('baseConfig', baseConfig);

console.log('Loading @prc/chart-builder...', window.prcChartBuilder);
