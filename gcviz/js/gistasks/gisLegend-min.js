(function(){define(["jquery-private","esri/request","esri/renderers/Renderer","dojo/dom-construct","esri/symbols/jsonUtils","esri/renderers/jsonUtils","dojox/gfx"],function(g,a,f,d,b,c,j){var h,e,i,l,k;h=function(n,m,p){var o=n.getLayer(m);if(typeof o!=="undefined"){o.setVisibility(p)}};e=function(n,p,m){var o=n.getLayer(p);if(typeof o!=="undefined"){o.setOpacity(m)}};i=function(B,C,s){var r,F,p,t,w,o,E,x=JSON.parse(B),q=c.fromJson(x),z=q.defaultSymbol,u=q.infos,v=q.symbol,A=q.normalizationField,n=q.attributeField,m=q.attributeField2,G=q.attributeField3,D=C;if(u){var y=u;if(z&&y.length>0&&y[0].label!=="[all other values]"){y.unshift({label:"[all other values]",symbol:z})}t=n+(A?"/"+A:"");t+=(m?"/"+m:"")+(G?"/"+G:"");w='<div id="featureLayerSymbol'+s+'" class="gcviz-leg-uniqueFieldHolder">';w+=t+"</div>";g.each(y,function(H,I){o=d.create("div",{"class":"gcviz-leg-uniqueSymbolHolder"});E=d.create("div",{"class":"gcviz-leg-uniqueSpan"});F=b.getShapeDescriptors(I.symbol);r=k(I,o);p=r.createShape(F.defaultShape);l(F,p,I);E.innerHTML=I.label;d.place(o,D);d.place(E,D);d.place(d.create("br"),D)})}else{if(v){F=b.getShapeDescriptors(v);r=k(q,C);p=r.createShape(F.defaultShape);l(F,p,q)}}};k=function(p,o){var q,m=p.symbol.width,n=p.symbol.height;if(m&&n){q=j.createSurface(o,m,n)}else{q=j.createSurface(o,30,30)}return q};l=function(r,s,p){var q=r.fill,m=r.stroke,n=p.symbol.width,o=p.symbol.height;if(q){s.setFill(q)}if(m){s.setStroke(m)}if(n&&o){s.applyTransform({dx:n/2,dy:o/2})}else{s.applyTransform({dx:15,dy:15})}};return{setLayerVisibility:h,setLayerOpacity:e,getFeatureLayerSymbol:i}})}());