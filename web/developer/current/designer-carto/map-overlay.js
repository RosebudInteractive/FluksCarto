(function($){

var statusRadius = 15;

MapTextOverlay = function (bounds, text, map, options, ajustCallback) {
	this.bounds_ = bounds;
	this.text_ = text;
	this.map_ = map;
	this.div_ = null;
    this.options_ = options;
	this.ajustCallback_ = ajustCallback;
	this.setMap(map);
};

MapTextOverlay.prototype = new google.maps.OverlayView();
MapTextOverlay.prototype.onAdd = function() {
	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
    div.style.borderColor = 'black';
	div.style.position = 'absolute';
	div.style.background = this.options_.background;
    div.style.fill = this.options_.color;
    div.style.fontFamily = this.options_.fontFamily;
    div.style.fontSize = this.options_.fontSize;
	div.style.whiteSpace = 'nowrap';
    //div.style.padding = '2px';
	div.innerHTML = this.text_;
	this.div_ = div;
	var panes = this.getPanes();
	panes.markerLayer.appendChild(div);
	if (this.ajustCallback_)
		this.ajustCallback_();
};

MapTextOverlay.prototype.draw = function() {
    var nw = this.getXYFromDiv();
	var div = this.div_;
	if (div) {
		div.style.left = nw.x + 'px';
		div.style.top = nw.y + 'px';
		div.style.width = 'auto';
	}
};

MapTextOverlay.prototype.onRemove =	function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};

MapTextOverlay.prototype.pointFromBounds = function(bounds, bottomRight) {
    var overlayProjection = this.getProjection();
    var sw = overlayProjection.fromLatLngToDivPixel(bounds.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(bounds.getNorthEast());
    if (bottomRight)
        return ({x: ne.x + 6, y: sw.y});
    else
        return ({x: sw.x, y: ne.y});
};

MapTextOverlay.prototype.getBoundsFromDiv = function() {
    var nw = this.getXYFromDiv();
	var left = nw.x;
	var top = nw.y;
    var overlayProjection = this.getProjection();
	if (overlayProjection && this.div_) {
		var newSw = overlayProjection.fromDivPixelToLatLng({x: left, y: top + this.div_.clientHeight});
		var newNe = overlayProjection.fromDivPixelToLatLng({x: left + this.div_.clientWidth + 6, y: top});
		var tmp = new google.maps.LatLngBounds(newSw, newNe);
		return tmp;
	}
};

MapTextOverlay.prototype.getXYFromDiv = function() {
    return this.pointFromBounds(this.bounds_);
};

MapTextOverlay.prototype.getVisible = function() {
	return ((this.div_) && (this.div_.style.visibility === 'visible'))?true:false;
};

MapTextOverlay.prototype.setVisible = function(value){
	if (this.div_){
		if (value) {
			this.show();
		} else {
			this.hide();
		}
	}
};

MapTextOverlay.prototype.hide = function() {
	if (this.div_) {
		this.div_.style.visibility = 'hidden';
	}
};

MapTextOverlay.prototype.show = function() {
	if (this.div_) {
		this.div_.style.visibility = 'visible';
	}
};

MapTextOverlay.prototype.toggle = function() {
	if (this.div_) {
		if (this.getVisible()) {
			this.hide();
		} else {
			this.show();
		}
	}
};

MapImageOverlay = function (bounds, imgUrl, map, options, ajustCallback) {
	this.bounds_ = bounds;
	this.map_ = map;
	this.imgUrl_ = imgUrl;
	this.div_ = null;
	this.div_ = null;
	this.options_ = options;
	this.ajustCallback_ = ajustCallback;
	this.circle_ = null;
	this.setMap(map);
};

MapImageOverlay.prototype = new google.maps.OverlayView();

MapImageOverlay.prototype.onAdd = function() {
	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.borderColor = 'black';
	div.style.position = 'absolute';
	div.style.opacity = 0.7;
	div.style.background = this.options_.background;
	var img = document.createElement('img');
	var that = this;
	img.setAttribute('src', this.imgUrl_);
	//img.setAttribute('opacity', "0.5");
	div.appendChild(img);
	this.div_ = div;
	this.img_ = img;
	if (this.options_.status)
		this.addCircle();
	if (this.options_.infoIcon)
		this.addInfoIcon();
	var panes = this.getPanes();
	panes.markerLayer.appendChild(div);
	img.onload = function(){
		that.draw();
		if (that.ajustCallback_)
			that.ajustCallback_();
	};
};

MapImageOverlay.prototype.addCircle = function() {
	var div = document.createElement('div');
	this.circle_ = div;
//	div.style.left = '0px';
//	div.style.bottom = '0px';
//	div.style.width = '32px';
//	div.style.height = '32px';
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.borderColor = 'black';
	div.style.position = 'absolute';
	div.style.opacity = 0.8;
	div.style.background = 'transparent';
	div.style.fill = 'transparent';
	div.style.padding = '1px';
	div.innerHTML = '<svg width="30" height="30"><circle cx="15" cy="15" r="15" fill="red"/></svg>';
	this.div_.appendChild(div);
};

MapImageOverlay.prototype.addInfoIcon = function() {
		var div = document.createElement('div');

		div.style.borderStyle = 'none';
		div.style.borderWidth = '0px';
		div.style.position = 'absolute';
		div.style.left = '-30px';
		div.style.top = '-30px';
		div.style.opacity = 1;
		div.style.background = 'transparent';
		div.style.fill = 'transparent';
		div.style.cursor = 'pointer';
		var img = document.createElement('img');
		img.setAttribute('src', "designer/css/img/info-popup.png");
		img.setAttribute('cursor', "pointer");
		div.appendChild(img);
		this.div_.appendChild(div);

	};

MapImageOverlay.prototype.pointFromBounds = function(bounds, bottomRight) {
	var overlayProjection = this.getProjection();
	var sw = overlayProjection.fromLatLngToDivPixel(bounds.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(bounds.getNorthEast());
	if (bottomRight)
		return ({x: ne.x, y: sw.y});
	else
		return ({x: sw.x, y: ne.y});
};

MapImageOverlay.prototype.getXYFromDiv = function() {
   return this.pointFromBounds(this.bounds_);
};

MapImageOverlay.prototype.draw = function() {
	var nw = this.pointFromBounds(this.bounds_);
	var div = this.div_;
	if (div) {
		div.style.left = nw.x + 'px';
		div.style.top = nw.y + 'px';
	}
	if (this.circle_ && this.img_) {
		this.circle_.style.left = this.img_.width - statusRadius - 2 + 'px';
		this.circle_.style.top = this.img_.height - statusRadius - 2 + 'px';
	}
	if (this.ajustCallback_)
		this.ajustCallback_();
};

MapImageOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};

MapImageOverlay.prototype.getBoundsFromDiv = function() {
    var nw = this.getXYFromDiv();
    var overlayProjection = this.getProjection();
	var newSw = overlayProjection.fromDivPixelToLatLng({x: nw.x, y: nw.y + this.div_.clientHeight});
	var newNe = overlayProjection.fromDivPixelToLatLng({x: nw.x + this.div_.clientWidth, y: nw.y});
	var tmp = new google.maps.LatLngBounds(newSw, newNe);
	return tmp;
};

MapImageOverlay.prototype.getVisible = function() {
	return ((this.div_) && (this.div_.style.visibility === 'visible'))?true:false;
};

MapImageOverlay.prototype.setVisible = function(value){
	if (this.div_){
		if (value) {
			this.show();
		} else {
			this.hide();
		}
	}
};

MapImageOverlay.prototype.hide = function() {
	if (this.div_) {
		this.div_.style.visibility = 'hidden';
	}
};

MapImageOverlay.prototype.show = function() {
	if (this.div_) {
		this.div_.style.visibility = 'visible';
	}
};

MapImageOverlay.prototype.toggle = function() {
	if (this.div_) {
		if (this.getVisible()) {
			this.hide();
		} else {
			this.show();
		}
	}
};

MapDataOverlay = function (bounds, data, map, options, ajustCallback) {
	this.bounds_ = bounds;
	this.map_ = map;
	this.data_ = data;
	this.div_ = null;
	this.options_ = options;
	this.ajustCallback_ = ajustCallback;
	this.circle_ = null;
	this.setMap(map);
};

MapDataOverlay.prototype = new google.maps.OverlayView();

MapDataOverlay.prototype.onAdd = function() {
	var div = document.createElement('div');
	//div.style.boxSizing = "border-box";
	div.style.display = "block";
//	div.style.borderStyle = 'solid';
	div.style.borderWidth = '12px';
	div.style.borderColor = (this.options_.stroke)?this.options_.stroke:"black";
	div.style.position = 'absolute';
	div.style.background = (this.options_.background)?this.options_.background:"rgba(255,255,255,0.5)";
	div.style.fontFamily = this.options_.fontFamily;
	div.style.fontSize = this.options_.fontSize;
	div.style.opacity = 0.9;
	div.style.zIndex = 600;
//    div.style.padding = '4px';
    div.style.visibility = (this.options_.hidden)?'hidden':'visible';
	this.div_ = div;
	var panes = this.getPanes();
	panes.markerLayer.appendChild(div);
    this.addTableFromCustomData();
	if (this.options_.status)
		this.addCircle();
    this.draw();
	if (this.ajustCallback_)
		this.ajustCallback_();
};

MapDataOverlay.prototype.addTableFromCustomData = function() {
    var table = document.createElement('table');
    table.border='0px';
    var tableBody = document.createElement('tbody');
    var info = this.data_._data._data;
    table.appendChild(tableBody);
    for (var propName in info){
        var tr = document.createElement('tr');
        tableBody.appendChild(tr);
        var td1 = document.createElement('td');
        tr.appendChild(td1);
        td1.appendChild(document.createTextNode(propName));
        var td2 = document.createElement('td');
        td2.appendChild(document.createTextNode(info[propName]));
	    td2.style.fontWeight = "900";
        tr.appendChild(td2);
    }
    this.div_.appendChild(table);
};

MapDataOverlay.prototype.addCircle = function() {
	var div = document.createElement('div');
	this.circle_ = div;
	div.style.left = '0px';
	div.style.bottom = '0px';
	div.style.width = '32px';
	div.style.height = '32px';
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.borderColor = 'black';
	div.style.position = 'absolute';
	div.style.opacity = 0.5;
	div.style.background = 'transparent';
	div.style.fill = 'transparent';
	div.style.padding = '1px';
	div.innerHTML = '<svg width="30" height="30"><circle cx="15" cy="15" r="15" fill="red"/></svg>';
	this.div_.appendChild(div);
};

MapDataOverlay.prototype.draw =	function() {
	var nw = this.pointFromBounds(this.bounds_);
	var div = this.div_;
	div.style.left = nw.x + 'px';
	div.style.top = nw.y + 'px';
	div.style.width = this.data_._width + 'px';
	div.style.height = this.data_._height + 'px';
	if (this.circle_) {
		this.circle_.style.left = this.data_._width - statusRadius - 2 + 'px';
		this.circle_.style.top = this.data_._height - statusRadius - 2 + 'px';
	}
};

MapDataOverlay.prototype.getBoundsFromDiv = function() {
    var nw = this.getXYFromDiv();
    var overlayProjection = this.getProjection();
	if (overlayProjection) {
		var newSw = overlayProjection.fromDivPixelToLatLng({x: nw.x, y: nw.y + this.div_.clientHeight});
		var newNe = overlayProjection.fromDivPixelToLatLng({x: nw.x + this.div_.clientWidth, y: nw.y});
		var tmp = new google.maps.LatLngBounds(newSw, newNe);
	}
	return tmp;
};

MapDataOverlay.prototype.pointFromBounds = function(bounds, bottomRight) {
    var overlayProjection = this.getProjection();
    var sw = overlayProjection.fromLatLngToDivPixel(bounds.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(bounds.getNorthEast());
    if (bottomRight)
        return ({x: ne.x, y: sw.y});
    else
        return ({x: sw.x, y: ne.y});
};

MapDataOverlay.prototype.getXYFromDiv = function() {
    return this.pointFromBounds(this.bounds_);
};

MapDataOverlay.prototype.resizeByBounds = function(bounds){
    this.bounds_ = bounds;
    var nw = this.pointFromBounds(this.bounds_);
    var se = this.pointFromBounds(this.bounds_,true);
    this.data_._width = se.x - nw.x;
    this.data_._height = se.y - nw.y;
    this.draw();
};

MapDataOverlay.prototype.onRemove =	function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};

MapDataOverlay.prototype.getVisible = function() {
	return ((this.div_) && (this.div_.style.visibility === 'visible'))?true:false;
};

MapDataOverlay.prototype.setVisible = function(value){
	if (this.div_){
		if (value) {
			this.show();
		} else {
			this.hide();
		}
	}
};

MapDataOverlay.prototype.hide = function() {
	if (this.div_) {
		this.div_.style.visibility = 'hidden';
	}
};

MapDataOverlay.prototype.show = function() {
	if (this.div_) {
		this.div_.style.visibility = 'visible';
	}
};

MapDataOverlay.prototype.toggle = function() {
	if (this.div_) {
		if (this.getVisible()) {
			this.hide();
		} else {
			this.show();
		}
	}
};

MapDataOverlay.prototype.setOptions = function(options) {
	if (options.property == "border-color"){
		this.div_.style.borderColor = "#" + options.value;
	}
	if (options.property == "fill-color"){
		this.div_.style.background = "#" + options.value;
	}
};

})(jQuery);
