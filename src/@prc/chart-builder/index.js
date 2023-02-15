import {
	ChartBuilderWrapper,
	baseConfig,
	ChartBuilderTextWrapper,
} from '@pewresearch/chart-builder/dist';

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
