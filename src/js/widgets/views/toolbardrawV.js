/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar draw widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-tbdraw',
			'dijit/TitlePane',
			'gcviz-i18n'
	], function($viz, tbdrawVM, dojotitle, i18n) {
		var initialize,
			getMeasureBtn,
			getDrawBtn,
			getEraseBtn,
			getUndoRedoBtn,
			getImpExpBtn;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbardraw,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '',
				$holder = $mapElem.find('.gcviz-tbholder');

			// add the url for dowload page to config
			config.urldownload = $mapElem.mapframe.map.urldownload;

			$holder.append('<div class="gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbdraw' + mapid, title: '' + i18n.getDict('%toolbardraw-name') + '', content: '<div class="gcviz-tbdraw-content gcviz-tbcontent"></div>', open: config.expand });
			$holder.append(tp.domNode);
			tp.startup();

			// set focus on open
			tp.on('click', function() {
				$viz('.gcviz-tbholder').scrollTo($viz('.gcviz-tbdraw-content'));
			});

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdraw-content');

			// contextual help
			node += '<div class="row">' +
						'<label class="gcviz-help-bubbledesc" for="tbdraw' + mapid + '" data-bind="contextHelp: { text: helpDesc, alt: helpAlt, img: imgHelpBubble, id: \'tbdraw' + mapid + '\' }"></label>' +
					'</div>';

			// first row
			node += '<div class="gcviz-draw-row1">';

			// set color picker
			node +=	'<div class="row">' +
						'<div class="gcviz-draw-cholder span5">' +
							'<button class="gcviz-draw-black" tabindex="0" data-bind="click: function() { selectColorClick(\'black\') }, attr: { title: tpBlack }, css: {\'gcviz-draw-pickblack\': selectedColor() === \'black\' }"></button>' +
							'<button class="gcviz-draw-blue" tabindex="0" data-bind="click: function() { selectColorClick(\'blue\') }, attr: { title: tpBlue }, css: {\'gcviz-draw-pickblue\': selectedColor() === \'blue\' }"></button>' +
							'<button class="gcviz-draw-green" tabindex="0" data-bind="click: function() { selectColorClick(\'green\') }, attr: { title: tpGreen }, css: {\'gcviz-draw-pickgreen\': selectedColor() === \'green\' }"></button>' +
							'<button class="gcviz-draw-red" tabindex="0" data-bind="click: function() { selectColorClick(\'red\') }, attr: { title: tpRed }, css: {\'gcviz-draw-pickred\': selectedColor() === \'red\' }"></button>' +
							'<button class="gcviz-draw-yellow" tabindex="0" data-bind="click: function() { selectColorClick(\'yellow\') }, attr: { title: tpYellow }, css: {\'gcviz-draw-pickyellow\': selectedColor() === \'yellow\' }"></button>' +
							'<button class="gcviz-draw-white" tabindex="0" data-bind="click: function() { selectColorClick(\'white\') }, attr: { title: tpWhite }, css: {\'gcviz-draw-pickwhite\': selectedColor() === \'white\' }"></button>' +
						'</div>' +
						'<div class="span7">' +
							'<span class="gcviz-colorspanlabel" data-bind="text: lblColor"></span>' +
						'</div>' +
					'</div>';

			// set measure buttons
			node += getMeasureBtn(config);

			// set draw and add text buttons
			node += getDrawBtn(config);

			// set erase buttons
			node += getEraseBtn();

			// set undo and redo buttons
			node += getUndoRedoBtn();

			// set import and export buttons
			node += getImpExpBtn(config);

			// WCAG dialog window
			node += '<div id="diagDrawWCAG' + mapid + '" data-bind="wcag: { }, uiDialog: { title: $root.WCAGTitle, width: 490, height: 350, ok: $root.dialogWCAGOk, cancel: $root.dialogWCAGCancel, close: $root.dialogWCAGClose, openDialog: \'isDialogWCAG\' }">' +
						'<div>' +
							'<label for="gcviz-xvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGx"></label>' +
							'<input id="gcviz-xvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: xValue"/>' +
							'<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgx"></span>' +
						'</div>' +
						'<div>' +
							'<label for="gcviz-yvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGy"></label>' +
							'<input id="gcviz-yvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: yValue"/>' +
							'<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgy"></span>' +
						'</div>' +
						'<div class="row" data-bind="visible: activeTool() !== \'text\'">' +
							'<button id="btnAddPt' + mapid + '" class="span1 gcviz-draw-wcagadd" tabindex="0" data-bind="buttonBlur, click: addCoords"></button>' +
							'<label class="gcviz-label span11 gcviz-draw-lbladd" for="btnAddPt' + mapid + '" data-bind="text: lblWCAGadd"></label>' +
						'</div>' +
						'<div data-bind="visible: activeTool() !== \'text\'" style="clear: both;">' +
							'<ul data-bind="template: { name: \'coordsWCAG\', foreach: WCAGcoords }"></ul>' +
							'<script type="text/html" id="coordsWCAG">' +
								'<li style="white-space: nowrap;">' +
									'<span data-bind="text: \'x: \' + $data[0] + \', y: \' + $data[1]"></span>' +
								'</li>' +
							'</script>' +
						'</div>' +
					'</div>';

			$toolbar.append(node);
			return(tbdrawVM.initialize($toolbar, mapid, config));
		};

		getMeasureBtn = function(config) {
			var measLabel,
				classSpan = 'span2',
				node = '',
				measLine = config.measureline.enable,
				measArea = config.measurearea.enable;

			if (measLine && measArea) {
				classSpan = 'span4';
				measLabel = 'lblMeasFull';
			} else if (measLine) {
				measLabel = 'lblMeasLine';
			} else if (measArea) {
				measLabel = 'lblMeasArea';
			}

			if (measLine || measArea) {
				// create the row
				node += '<div class="row"><div class="' + classSpan + '">';

				// add buttons
				// add measure line button
				if (measLine) {
					node += '<button class="gcviz-draw-length" tabindex="0" data-bind="buttonBlur, click: measureLengthClick, attr: { title: tpMeasureLength }"></button>';

					// if there is second button, add a separator
					if (measArea) {
						node += '<div class="gcviz-tbseparator"></div>';
					}
				}

				// add measure area button
				if (measArea) {
					node += '<button class="gcviz-draw-area" tabindex="0" data-bind="buttonBlur, click: measureAreaClick, attr: { title: tpMeasureArea }"></button>';
				}

				// close the span for buttons
				node += '</div>';

				// add text
				node += '<div class="span8">' +
							'<span class="gcviz-drawspanlabel" data-bind="text: ' + measLabel + '"></span>' +
						'</div>';

				// close row
				node += '</div>';
			}

			return node;
		};

		getDrawBtn = function(config) {
			var drawLabel,
				classSpan = 'span2',
				node = '',
				drawLine = config.drawline.enable,
				drawText = config.drawtext.enable;

			if (drawLine && drawText) {
				classSpan = 'span4';
				drawLabel = 'lblDrawFull';
			} else if (drawLine) {
				drawLabel = 'lblDrawLine';
			} else if (drawText) {
				drawLabel = 'lblDrawText';
			}

			if (drawLine || drawText) {
				// create the row
				node += '<div class="row"><div class="' + classSpan + '">';

				// add buttons
				// add draw line button
				if (drawLine) {
					node += '<button class="gcviz-draw-line" tabindex="0" data-bind="buttonBlur, click: drawClick, attr: { title: tpDraw }"></button>';

					// if there is second button, add a separator
					if (drawText) {
						node += '<div class="gcviz-tbseparator"></div>';
					}
				}

				// add draw text button
				if (drawText) {
					node += '<button class="gcviz-draw-text" tabindex="0" data-bind="buttonBlur, click: textClick, attr: { title: tpText }"></button>';
				}

				// close the span for buttons
				node += '</div>';

				// add text
				node += '<div class="span8">' +
							'<span class="gcviz-drawspanlabel" data-bind="text: ' + drawLabel + '"></span>' +
						'</div>';

				// close row
				node += '</div>';
			}

			// if add text on, add the dialog window for annotation
			if (drawText) {
				node += '<div data-bind="uiDialog: { title: $root.lblTextTitle, width: 450, height: 220, ok: $root.dialogTextOk, cancel: $root.dialogTextCancel, close: $root.dialogTextClose, openDialog: \'isTextDialogOpen\' }">' +
							'<div id="gcviz-draw-inputbox">' +
								'<form><fieldset>' +
									'<input id="gcviz-textvalue" class="gcviz-draw-textinput text ui-widget-content ui-corner-all" data-bind="value: drawTextValue, valueUpdate: \'afterkeydown\', returnKey: dialogTextOkEnter, attr: { title: lblTextDesc }"/>' +
									'<div style="clear: both"></div><span data-bind="text: lblTextInfo"></span>' +
								'</fieldset></form>' +
							'</div>' +
						'</div>';
			}

			return node;
		};

		getEraseBtn = function() {
			// create the row
			var node = '<div class="row"><div class="span4">' +

					// add erase all and erase selected buttons
					'<button class="gcviz-draw-del" tabindex="0" data-bind="buttonBlur, click: eraseClick, attr: { title: tpErase }, enable: isGraphics"></button>' +
					'<div class="gcviz-tbseparator"></div>' +
					'<button class="gcviz-draw-delsel" tabindex="0" data-bind="buttonBlur, click: eraseSelClick, attr: { title: tpEraseSel }, enable: isGraphics() && !isWCAG()"></button>' +

				// close the span for buttons
				'</div>' +

				// add text
				'<div class="span8">' +
					'<span class="gcviz-drawspanlabel" data-bind="text: lblErase"></span>' +
				'</div>' +

			// close row
			'</div>';

			return node;
		};

		getUndoRedoBtn = function() {
			// create the row
			var node = '<div class="row"><div class="span4">' +

					// add erase all and erase selected buttons
					'<button class="gcviz-draw-undo" tabindex="0" data-bind="buttonBlur, click: undoClick, attr: { title: tpUndo }, enable: stackUndo().length > 0"></button>' +
					'<div class="gcviz-tbseparator"></div>' +
					'<button class="gcviz-draw-redo" tabindex="0" data-bind="buttonBlur, click: redoClick, attr: { title: tpRedo }, enable: stackRedo().length > 0"></button>' +

				// close the span for buttons
				'</div>' +

				// add text
				'<div class="span8">' +
					'<span class="gcviz-drawspanlabel" data-bind="text: lblUndoRedo"></span>' +
				'</div>' +

			// close row
			'</div>';

			return node;
		};

		getImpExpBtn = function(config) {
			var node = '';

			if (config.importexport.enable) {
				// create the row
				node = '<div class="row"><div class="span4">' +

						// add import and export buttons
						'<input id="fileDialogAnno" type="file" accept="application/json" data-bind="event: { change: importClick }" tabindex="-1"></input>' +
						'<button class="gcviz-draw-imp" tabindex="0" data-bind="buttonBlur, click: launchDialog, attr: { title: tpImport }"></button>' +
						'<div class="gcviz-tbseparator"></div>' +
						'<button class="gcviz-draw-exp" tabindex="0" data-bind="buttonBlur, click: exportClick, attr: { title: tpExport }, enable: isGraphics"></button>' +

					// close the span for buttons
					'</div>' +

					// add text
					'<div class="span8">' +
						'<span class="gcviz-drawspanlabel" data-bind="text: lblImpExp"></span>' +
					'</div>' +

				// close row
				'</div>';
			}

			return node;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
