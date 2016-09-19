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
				configDatagrid = $mapElem.datagrid,
				configScalebar = config.scalebar.enable,
				dataToolbar = $mapElem.toolbardata.enable,
				node = '';

			$mapElem.find('#' + mapid).append('<div id="foot' + mapid + '" class="gcviz-foot"></div>');
			$footer = $mapElem.find('.gcviz-foot');

			// create row to hold all componants
			node = '<div class="gcviz-row">';

			// logo and link to GitHub
			node += '<div class="gcviz-span5">';

			if (config.logo) {
				node += '<div><a target="_blank" data-bind="attr: { href: urlLogo }" tabindex="-1">' +
							'<img class="gcviz-foot-logo" data-bind="event: { keyup: goGitHub }, attr: { src: imgLogoPNG }, tooltip: { content: urlLogoAlt }" tabindex="0"></img>' +
						'</a></div>';
			}

			// add button to open datagrid
			if (configDatagrid.enable) {
				node += '<button class="gcviz-foot-data" data-bind="buttonBlur, click: datagridClick, tooltip: { content: tpDatagrid, position: { my: \'right+30 top-65\', collision: \'fit\' } }"></button>';
			}

			node += '</div>';

			// set north arrow
			node += '<div class="gcviz-span1">';
			if (config.northarrow.enable) {
				node += '<div id="arrow' + mapid + '" class="gcviz-foot-arrow unselectable" data-bind="style: { \'webkitTransform\': rotateArrow(), ' +
																												'\'MozTransform\': rotateArrow(), ' +
																												'\'msTransform\': rotateArrow(), ' +
																												'\'OTransform\': rotateArrow(), ' +
																												'\'transform\': rotateArrow() }, ' +
																												'attr: { alt: tpArrow }"></div>';
			}
			node += '</div>';

			// set mouse coordinates
			node += '<div class="gcviz-span4">';
			if (config.mousecoords.enable && window.browser !== 'Mobile') {
				node += '<div class="gcviz-foot-coords-label unselectable" data-bind="text: coordsLabel"></div>' +
						'<table><tr>' +
							'<td><div class="gcviz-foot-coords-values unselectable" data-bind="text: coords1a, style: { marginTop: dualCoords() < 1 ? \'13px\' : \'6px\' }"></div></td>' +
							'<td><div class="gcviz-foot-coords-values gcviz-foor-coords-right unselectable" data-bind="text: coords1b, style: { marginTop: dualCoords() < 1 ? \'13px\' : \'6px\' }"></div></td></tr>' +
							'<tr><td><div class="gcviz-foot-coords-values gcviz-float-right unselectable" data-bind="text: coords2a"></div></td>' +
							'<td><div class="gcviz-foot-coords-values gcviz-foor-coords-right unselectable" data-bind="text: coords2b"></div></td>' +
						'</tr></table>';
			}
			node += '</div>';

			// set scalebar
			node += '<div class="gcviz-span2">';
			if (configScalebar) {
				node += '<div id="scalebar' + mapid + '" class="unselectable"></div>';
			}
			node += '</div>';

			// close row
			node += '</div>';

			$footer.append(node);
			return(footerVM.initialize($footer, mapid, config, dataToolbar));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
