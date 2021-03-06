/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS geoprocessing functions
 */
(function () {
    'use strict';
    define(['esri/config',
            'esri/tasks/ProjectParameters',
            'esri/tasks/DistanceParameters',
            'esri/tasks/AreasAndLengthsParameters',
            'esri/tasks/GeometryService',
            'esri/SpatialReference',
            'esri/geometry/Point',
            'esri/geometry/Extent',
            'esri/tasks/DensifyParameters'
    ], function(esriConfig, esriProj, esriDist, esriArea, esriGeom, esriSR, esriPoint, esriExtent, esriDensParam) {
        var setGeomServ,
            getOutSR,
            getNorthAngle,
            measureLength,
            measureArea,
            labelPoints,
            zoomLocation,
            projectPoints,
            projectCoords,
            projectGeoms,
            densifyGeom,
            getUTMEastNorth,
            createExtent,
            params = new esriProj();

        setGeomServ = function(url) {
            // all function will use this geometry server it is set once
            // for the map.
            esriConfig.defaults.io.geometryService = new esriGeom(url);
        };

        getOutSR = function(wkid) {
            return new esriSR({ 'wkid': wkid });
        };

        getNorthAngle = function(extent, inwkid, success) {
            var outSR = new esriSR({ 'wkid': 4326 }),
                pointB = new esriPoint((extent.xmin + extent.xmax) / 2,
                                        extent.ymin, new esriSR({ 'wkid': inwkid })),
                geomServ = esriConfig.defaults.io.geometryService;

            params.geometries = [pointB];
            params.outSR = outSR;

            geomServ.project(params, function(projectedPoints) {
                success(projectedPoints);
            });
        };

        measureLength = function(array, unit, success, drawMap) {
            var distUnit,
                distParams = new esriDist(),
                len = array.length,
                geomServ = esriConfig.defaults.io.geometryService;

            if (unit === 'km') {
                distUnit = esriGeom.UNIT_KILOMETER;
            } else {
                distUnit = esriGeom.UNIT_STATUTE_MILE;
            }

            distParams.distanceUnit = distUnit;
            distParams.geometry1 = array[len - 1];
            distParams.geometry2 = array[len - 2];
            distParams.geodesic = true;

            geomServ.distance(distParams, function(distance) {
                // keep 2 decimals
                array[len - 1].distance = Math.floor(distance * 100) / 100;
                success(array, unit, drawMap);
            });
        };

        measureArea = function(poly, unit, success, array, drawMap) {
            var areaUnit, distUnit,
                areaParams = new esriArea(),
                geomServ = esriConfig.defaults.io.geometryService;

            if (unit === 'km') {
                areaUnit = esriGeom.UNIT_SQUARE_KILOMETERS;
                distUnit = esriGeom.UNIT_KILOMETER;
            } else {
                areaUnit = esriGeom.UNIT_SQUARE_MILES;
                distUnit = esriGeom.UNIT_STATUTE_MILE;
            }

            areaParams.areaUnit = areaUnit;
            areaParams.lengthUnit = distUnit;
            areaParams.calculationType = 'preserveShape';

            geomServ.simplify([poly], function(simplifiedGeometries) {
                areaParams.polygons = simplifiedGeometries;
                geomServ.areasAndLengths(areaParams, function(areas) {
                    success(areaParams.polygons[0], areas, unit, array, drawMap);
                });
            });
        };

        labelPoints = function(poly, info, success) {
            var geomServ = esriConfig.defaults.io.geometryService;

            geomServ.simplify([poly], function(simplifiedGeometries) {
                geomServ.labelPoints(simplifiedGeometries, function(labelPoints) {
                    success(labelPoints, info);
                });
            });
        };

        zoomLocation = function(minx, miny, maxx, maxy, mymap, outSR) {
            var inSR = new esriSR({ 'wkid': 4326 }),
                extent = new esriExtent(),
                inputpoint1 = new esriPoint(minx, miny, inSR),
                inputpoint2 = new esriPoint(maxx, maxy, inSR),
                geom = [inputpoint1, inputpoint2],
                geomServ = esriConfig.defaults.io.geometryService;

            params.geometries = geom;
            params.outSR = outSR;

            // Transform the lat/long extent to map coordinates
            geomServ.project(params, function(projectedPoints) {
                var pt1 = projectedPoints[0],
                    pt2 = projectedPoints[1];
                extent = new esriExtent(pt1.x, pt1.y, pt2.x, pt2.y, outSR);
                mymap.setExtent(extent, true);
            });
        };

        projectPoints = function(points, outwkid, success) {
            var geomServ = esriConfig.defaults.io.geometryService;

            params.geometries = points;
            params.outSR = new esriSR({ 'wkid': outwkid });

            geomServ.project(params, function(projectedPoints) {
                var i = 0,
                    geom = params.geometries,
                    len = geom.length;

                // put back the attributes
                if (typeof geom[i].attributes !== 'undefined') {
                    while (i !== len) {
                        projectedPoints[i].attributes = geom[i].attributes;
                        i++;
                    }
                }
                success(projectedPoints);
            });
        };

        projectCoords = function(coords, inwkid, outwkid, success) {
            var point,
                i = 0,
                len = coords.length,
                points = new Array(len),
                inSR = new esriSR({ 'wkid': inwkid });

            while (i !== len) {
                point = coords[i];
                points[i] = new esriPoint(point[0], point[1], inSR);
                i++;
            }

            // call projection function
            projectPoints(points, outwkid, success);
        };

        projectGeoms = function(geometries, outwkid, success) {
            var geomServUnique = new esriGeom(esriConfig.defaults.io.geometryService.url),
                paramsUnique = new esriProj();

            paramsUnique.geometries = geometries;
            paramsUnique.outSR = new esriSR({ 'wkid': outwkid });

            // keep geometries in an array to be able to access them later.
            // we need to do this because the projection remove all attributes from the item
            geomServUnique.geom = geometries;

            // we use a unique geometryService because large dataset will overlap project method
            // and geometryService info will be wrong. We use the project-complete instead of the
            // callback because we have more info this way. We will be able to link back to the
            // geometries original attributes.
            geomServUnique.on('project-complete', function(projected) {
                var feat, att,
                    i = 0,
                    geom = projected.target.geom,
                    len = geom.length,
                    features = new Array(len);

                // put back the attributes
                while (i !== len) {
                    feat = { };
                    att = geom[i].attributes;
                    if (typeof att !== 'undefined') {
                        feat = geom[i].attributes;
                    }
                    feat.geometry = projected.geometries[i];
                    features[i] = feat;
                    i++;
                }
                success(features);
            });

            geomServUnique.project(paramsUnique);
        };

        densifyGeom = function(geom, unit, success) {
            var geomServ = esriConfig.defaults.io.geometryService,
                param = new esriDensParam();
            param.geodesic = true;
            param.geometries = [geom];

            if (unit === 'degree') {
                param.lengthUnit = esriGeom.UNIT_DEGREE;
                param.maxSegmentLength = 1;
            } else if (unit === 'km') {
                param.lengthUnit = esriGeom.UNIT_KILOMETER;
                param.maxSegmentLength = 1;
            }

            geomServ.densify(param, function(geoms) {
                success(geoms[0]);
            });
        };

        getUTMEastNorth = function(lati, longi, utmZone, spnUTMeast, spnUTMnorth) {
            // Get the UTM easting/northing information using a geometry service
            var geomServ = esriConfig.defaults.io.geometryService,
                inSR = new esriSR({ 'wkid': 4326 }),
                outUTM = '326' + utmZone,
                outWkid = parseInt(outUTM, 10),
                outSR = new esriSR({ 'wkid': outWkid }),
                inputpoint = new esriPoint(parseFloat(longi), parseFloat(lati), inSR);

            params.geometries = [inputpoint];
            params.outSR = outSR;

            // Transform the lat/long extent to map coordinates
            geomServ.project(params, function(projectedPoints) {
                spnUTMeast(' ' + Math.round(projectedPoints[0].x));
                spnUTMnorth(' ' + Math.round(projectedPoints[0].y));
            });
        };

        createExtent = function(point, map, tolerancePx) {
            var pixelWidth = map.extent.getWidth() / map.width,
                toleranceMapCoords = tolerancePx * pixelWidth,
                extent = esriExtent(point.x - toleranceMapCoords,
                                    point.y - toleranceMapCoords,
                                    point.x + toleranceMapCoords,
                                    point.y + toleranceMapCoords,
                                    map.spatialReference);

            return extent;
        };

        return {
            setGeomServ: setGeomServ,
            getOutSR: getOutSR,
            getNorthAngle: getNorthAngle,
            measureLength: measureLength,
            measureArea: measureArea,
            labelPoints: labelPoints,
            zoomLocation: zoomLocation,
            projectPoints: projectPoints,
            projectCoords: projectCoords,
            projectGeoms: projectGeoms,
            densifyGeom: densifyGeom,
            getUTMEastNorth: getUTMEastNorth,
            createExtent: createExtent
        };
    });
}());

