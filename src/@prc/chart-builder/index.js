import {
	ChartBuilderWrapper,
	masterConfig,
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
loadScript('masterConfig', masterConfig);

console.log('Loading @prc/chart-builder...', window.prcChartBuilder);
