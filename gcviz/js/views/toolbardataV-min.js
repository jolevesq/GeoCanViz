(function(){define(["jquery-private","gcviz-vm-tbdata"],function(b,c){var a;a=function(g){var f,e=g.toolbardata,d=g.mapframe.id,h="";f=g.find(".gcviz-tbdata-content");if(e.data.enable){h+='<input id="fileDialogData" type="file" accept=".csv" data-bind="event: { change: addClick }" tabindex="-1"></input><div class="row"><div class="span1"><button id="btnAddCSV'+d+'" class="gcviz-data-add" tabindex="0" data-bind="buttonBlur, click: launchDialog, attr: { alt: tpAdd }"></button></div><div class="span11"><label class="gcviz-label gcviz-nav-lblpos" for="btnAddCSV'+d+'" data-bind="text: lblCSV"></label></div></div>'}h+='<div><ul class="gcviz-data-ul" data-bind="template: { name: \'userTmpl\', foreach: $root.userArray }"></ul></div>';h+='<script id="userTmpl" type="text/html">';h+='<li class="gcviz-data-li"><div class="gcviz-data-item">';h+='<input class="gcviz-data-itemchild" type="checkbox" data-bind="event: { click: $root.changeItemsVisibility }, attr: { alt: $root.tpVisible, id: \'checkbox\' + id }, checked: true"/>';h+='<span class="gcviz-data-itemchild" data-bind="text: label, attr: { id: \'span\' + id }"></span>';h+='<div class="gcviz-data-itemchild" data-bind="attr: { id: \'symbol\' + id }"></div>';h+='<button class="gcviz-data-itemchild gcviz-data-del" tabindex="0" data-bind="click: function($data) { $root.removeClick($data) }, tooltip: { content: $root.tpDelete }"></button>';h+="</div></li>";h+="<\/script>";h+='<div data-bind="uiDialog: { title: lblErrTitle, width: 300, height: 200, ok: dialogDataClose, close: dialogDataClose, openDialog: \'isErrDataOpen\' }"><span data-bind="text: errMsg"></span></div>';f.append(h);return(c.initialize(f,d))};return{initialize:a}})}).call(this);