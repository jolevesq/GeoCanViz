/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Footer view model widget
 */
/* global locationPath: false */
(function() {
    'use strict';
    define(['jquery-private',
            'knockout',
            'proj4js',
            'gcviz-i18n',
            'gcviz-func',
            'gcviz-gisgeo',
            'gcviz-vm-map',
            'gcviz-vm-tbdata'
    ], function($viz, ko, proj4, i18n, gcvizFunc, gisGeo, mapVM, tbdataVM) {
        var initialize,
            notifyTableReady,
            toggleDatagrid,
            subscribeIsDGOpen,
            vm = {};

        initialize = function($mapElem, mapid, config, dataToolbar) {

            // data model
            var footerViewModel = function($mapElem, mapid, config, dataToolbar) {
                var _self = this, coordEvt, inwkt, outwkt,
                    pathGCVizPNG = locationPath + 'gcviz/images/GCVizLogo.png',
                    configMouse = config.mousecoords,
                    configNorth = config.northarrow,
                    scalebar = config.scalebar,
                    inwkid = configNorth.inwkid,
                    outwkid = configMouse.outwkid,
                    $section = $viz('#section' + mapid),
                    heightData = 659; // height of datatable when open

                // viewmodel mapid to be access in tooltip custom binding
                _self.mapid = mapid;

                // images path
                _self.imgLogoPNG = pathGCVizPNG;

                // tooltip, text strings
                _self.tpFormat = i18n.getDict('%footer-tpformat');
                _self.urlLogo = i18n.getDict('%footer-urlgcvizrepo');
                _self.urlLogoAlt = i18n.getDict('%footer-tpgithub');
                _self.lblWest = i18n.getDict('%west');
                _self.lblPosition = i18n.getDict('%position');
                _self.tpDatagrid = i18n.getDict('%footer-tpdatagrid');
                _self.tpArrow = i18n.getDict('%footer-tpNorth');

                // coords and arrow
                _self.coordsLabel = ko.observable('');
                _self.coords1a = ko.observable('');
                _self.coords1b = ko.observable('');
                _self.coords2a = ko.observable('');
                _self.coords2b = ko.observable('');
                _self.dualCoords = ko.observable(0);
                _self.rotateArrow = ko.observable('');

                // enable button table (will be set true by datagridVM when
                // datatable is ready)
                _self.isTableReady = ko.observable(false);

                // to notify datagridVM open datagrid button has been pushed
                _self.isOpenDG = ko.observable(false);

                // get in and out wkt
                $viz.ajax({
                    url: 'http://epsg.io/' + inwkid+ '.wkt',
                    crossDomain: true,
                    dataType: 'text',
                    async: false,
                    success: function(wkt) {
                        inwkt = wkt;
                    },
                    error: function(err) {
                        console.log('Not able to set WKT: ' + err);
                    }
                });
                $viz.ajax({
                    url: 'http://epsg.io/' + outwkid + '.wkt',
                    crossDomain: true,
                    dataType: 'text',
                    async: false,
                    success: function(wkt) {
                    outwkt = wkt;
                    },
                    error: function(err) {
                        console.log('Not able to set WKT: ' + err);
                    }
                });// end ajax

                _self.init = function() {
                    // See if user wanted the map coordinnates
                    if (configMouse.enable) {
                        coordEvt = mapVM.registerEvent(mapid, 'mouse-move', _self.showCoordinates);

                        $viz('#' + mapid).on('gcviz-ready', function() {
                            // subscribe to the open add data event. When data is added we need to stop the
                            // show coordinate event because it corrupts the projection and creates errors
                            if (dataToolbar) {

                                tbdataVM.subscribeIsAddData(mapid, function(val) {
                                    if (val) {
                                        coordEvt.remove();
                                    } else {
                                        coordEvt = mapVM.registerEvent(mapid, 'mouse-move', _self.showCoordinates);
                                    }
                                });
                            }
                        });
                    }

                    // see if user wanted a north arrow
                    if (configNorth.enable) {
                        // set init state
                        gisGeo.getNorthAngle(mapVM.getExtentMap(mapid), inwkid, _self.updateArrow);

                        // pan end and zoom end events
                        mapVM.registerEvent(mapid, 'pan-end', _self.showNorthArrow);
                        mapVM.registerEvent(mapid, 'zoom-end', _self.showNorthArrow);
                    }

                    // see if user wanted a scalebar
                    if (scalebar.enable) {
                        mapVM.setScaleBar(mapid, scalebar);
                    }

                    return { controlsDescendantBindings: true };
                };

                _self.showCoordinates = function(evt) {
                    // Use proj4 instead of the geomtry server to get mouse coordinnates
                    //gisGeo.projectPoints([evt.mapPoint], outwkid, _self.updateCoordinates);
                    require(['proj4js'], function(proj4js) {
                        _self.updateCoordinates(proj4(inwkt, outwkt, [evt.mapPoint.x, evt.mapPoint.y]));
                    });
                };

                _self.updateCoordinates = function(projectedPoints) {
                    var strPointX, strPointY, dms,
                        strPointX2 = '',
                        strPointY2 = '',
                        x = projectedPoints[0],
                        y = projectedPoints[1];

                    // if coords are valid
                    if (!isNaN(x) && !isNaN(y)) {
                        // if lat/long, set dd and dms
                        if (outwkid === 4326) {
                            _self.dualCoords(1);

                            // dms
                            dms = gcvizFunc.convertDdToDms(x, y, 0);
                            strPointY = dms.y.join(' ');
                            strPointX = dms.x.join(' ');

                            // dd
                            if (x < 0) {
                                strPointX2 = (-1 * x.toFixed(3)).toString() + ' ' + _self.lblWest;
                            } else {
                                strPointX2 = x.toFixed(3).toString() + ' E';
                            }

                            if (y < 0) {
                                strPointY2 = (-1 * y.toFixed(3)).toString() + ' S';
                            } else {
                                strPointY2 = y.toFixed(3).toString() + ' N';
                            }

                            _self.coords2a(strPointY2 + ' |');
                            _self.coords2b(strPointX2);
                        } else {
                            strPointX = 'X= ' + x.toFixed(3).toString();
                            strPointY = 'Y= ' + y.toFixed(3).toString();
                        }

                        _self.coordsLabel(_self.lblPosition);
                        _self.coords1a(strPointY + ' |');
                        _self.coords1b(strPointX);
                    }
                };

                _self.showNorthArrow = function(evt) {
                    gisGeo.getNorthAngle(evt.extent, inwkid, _self.updateArrow);
                };

                _self.updateArrow = function(projectedPoints) {
                    var dLon, lat1, lat2,
                        x, y, pointB,
                        bearing,
                        pointA = { x: -100, y: 90 };

                    pointB = projectedPoints[0];
                    dLon = (pointB.x - pointA.x) * Math.PI / 180;
                    lat1 = pointA.y * Math.PI / 180;
                    lat2 = pointB.y * Math.PI / 180;
                    y = Math.sin(dLon) * Math.cos(lat2);
                    x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
                    bearing = Math.atan2(y, x) * 180 / Math.PI;
                    bearing = ((bearing + 360) % 360).toFixed(1) - 90; //Converting -ve to +ve (0-360)
                    _self.rotateArrow('rotate(' + bearing + 'deg)');
                };

                _self.datagridClick = function() {
                    var $datagrid = $viz('#gcviz-datagrid' + mapid),
                        heightSect = parseInt($section.css('height'), 10);

                    // refresh accordion and set the section height. If we dont set the height when datatable is
                    // open, there is overlap in Safari.
                    if ($datagrid.accordion('option', 'active') === 0) {
                        $datagrid.accordion({ active: false }).click();
                        gcvizFunc.setStyle($section[0], { 'height': (heightSect - heightData) + 'px' });
                        _self.isOpenDG(false);
                    } else {
                        $datagrid.accordion({ active: 0 }).click();
                        gcvizFunc.setStyle($section[0], { 'height': (heightSect + heightData) + 'px' });
                        _self.isOpenDG(true);
                    }
                    return false;
                };

                _self.goGitHub = function(data, event) {
                    if (event.keyCode === 13) {
                        window.open(_self.urlLogo, '_blank');
                    }
                };

                _self.init();
            };

            // put view model in an array because we can have more then one map in the page
            vm[mapid] = new footerViewModel($mapElem, mapid, config, dataToolbar);
            ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
            return vm;
        };

        // *** PUBLIC FUNCTIONS ***
        notifyTableReady = function(mapid) {
            var viewModel = vm[mapid];

            // link to view model to call the function inside
            if (typeof viewModel !== 'undefined') {
                viewModel.isTableReady(true);
            }
        };

        toggleDatagrid = function(mapid) {
            var viewModel = vm[mapid];

            // link to view model to call the function inside
            if (typeof viewModel !== 'undefined') {
                viewModel.datagridClick();
            }
        };

        subscribeIsDGOpen = function(mapid, funct) {
            return vm[mapid].isOpenDG.subscribe(funct);
        };

        return {
            initialize: initialize,
            notifyTableReady: notifyTableReady,
            toggleDatagrid: toggleDatagrid,
            subscribeIsDGOpen: subscribeIsDGOpen
        };
    });
}).call(this);
