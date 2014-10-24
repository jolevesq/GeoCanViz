/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Footer view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-footer'
	], function(footerVM) {
		var initialize;

		initialize = function($mapElem) {
			var $footer,
				config = $mapElem.footer,
				mapid = $mapElem.mapframe.id,
				configScalebar = config.scalebar.enable,
				node = '';

			$mapElem.find('#' + mapid).append('<div id="foot' + mapid + '" class="gcviz-foot"></div>');
			$footer = $mapElem.find('.gcviz-foot');

            // logo and link to GitHub
            if (config.logo) {
				node += '<div><a target="_blank" data-bind="attr: { href: urlLogo }" tabindex="-1">' +
							'<img class="gcviz-foot-logo" data-bind="event: { keyup: goGitHub }, attr: { src: imgLogoPNG }, tooltip: { content: urlLogoAlt }" tabindex="0"></img>' +
						'</a></div>';
            }

			// set scalebar
			if (configScalebar) {
				node += '<div id="scalebartool' + mapid + '" class="gcviz-foot-scalebar unselectable">' +
							'<div id="divScalebar' + mapid + '"></div>' +
							'<div class="gcviz-foot-scaleApprox" data-bind="text: lblApprox">(approx.)</div>' +
						'</div>';
			}

			// set north arrow
			if (config.northarrow.enable) {
				node += '<div id="arrow_' + mapid + '" class="gcviz-foot-arrow unselectable" data-bind="style: { \'webkitTransform\': rotateArrow(), ' +
																												'\'MozTransform\': rotateArrow(), ' +
																												'\'msTransform\': rotateArrow(), ' +
																												'\'OTransform\': rotateArrow(), ' +
																												'\'transform\': rotateArrow() }"></div>';
			}

			// set mouse coordinates
			if (config.mousecoords.enable) {
				node += '<span id="mousecoord_' + mapid + '" class="gcviz-foot-coords-values unselectable" data-bind="text: coords"></span>';
			}

			$footer.append(node);
			return(footerVM.initialize($footer, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
