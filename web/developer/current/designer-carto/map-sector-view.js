(function(window){
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

	SchemeDesigner.fromPixelToLatLng = function (map, x, y) {
		var projection = map.getProjection();
		var topRight = projection.fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = projection.fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = 1 << map.getZoom();
		return projection.fromPointToLatLng(new google.maps.Point(x / scale + bottomLeft.x, y / scale + topRight.y));
	};

	SchemeDesigner.fromLatLngToPixel = function (map, lat, lng) {
		var projection = map.getProjection();
		var topRight = projection.fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = projection.fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = 1 << map.getZoom();
		var ll = new google.maps.LatLng({lat:lat,lng:lng});
		var tmp = projection.fromLatLngToPoint(ll);
		return {x: (tmp.x - bottomLeft.x) * scale, y: (tmp.y - topRight.y) * scale };
	};

    var SectorView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data)
            this._group = null;
            this._hidden = false;
            this._dragData = null;
            this._caption = null;
            this._dataGroup = null;
            this._status = null;
	        this._data._hidden = false;
        },

	    ajustContainer: function(bounds){
            if (this._dataGroup)
                this._dataGroup.ajustContainer(bounds);
            if (this._caption)
                this._caption.ajustContainer(bounds);
	    },

        ajustCaptionPosition: function(bounds){
          var px = SchemeDesigner.fromLatLngToPixel(this._map, bounds.getNorthEast().lat(),bounds.getSouthWest().lng());
          this._data._title._x = px.x - this._data._x;
          this._data._title._y = px.y - this._data._y;
//          console.log('ajustCaptionPosition: ',this._data._title._x, this._data._title._y,", data block:", this._data._x, this._data._y);
        },

        getBounds: function(x, y){
            var nw = SchemeDesigner.fromPixelToLatLng(this._map, x, y);
            return new google.maps.LatLngBounds(nw, nw);
        },

        ajustDataPosition: function(bounds, withResize){
            var px = SchemeDesigner.fromLatLngToPixel(this._map, bounds.getNorthEast().lat(),bounds.getSouthWest().lng());
            this._data._x = px.x;
            this._data._y = px.y;
            if (withResize){
                var px2 = SchemeDesigner.fromLatLngToPixel(this._map, bounds.getSouthWest().lat(),bounds.getNorthEast().lng());
                this._data._width = px2.x - this._data._x;
                this._data._height = px2.y - this._data._y;
            }
            this._data._title._bounds = this.getBounds(this._data._x + this._data._title._x, this._data._y + this._data._title._y);
            this._caption.setBounds(this._data._title._bounds, true, true, false);
	        if (!this._data._bounds.equals(bounds)){
		        this._dataGroup.setBounds(bounds, true, true);
	        }
        },
		render: function(map, grp){
            this._super(map, grp);
            this._map = map;
			var fromBounds = false;
	        if (!this._caption) {
	            if (this._data._bounds) {
		            var px = SchemeDesigner.fromLatLngToPixel(this._map, this._data._bounds.getNorthEast().lat(), this._data._bounds.getSouthWest().lng());
		            this._data._x = px.x;
		            this._data._y = px.y;
		            fromBounds = true;
	            }
		        this._data._title._bounds = this.getBounds(this._data._x + this._data._title._x, this._data._y + this._data._title._y);
		        this._caption = new SchemeDesigner.EntryTitleView(this._data._title, this);
	        }
	        if (!this._dataGroup) {
		        if (!fromBounds)
		            this._data._bounds = this.getBounds(this._data._x, this._data._y);
		        this._dataGroup = new SchemeDesigner.EntryDataView(this._data, this, true); // showStatus = true
                this._dataGroup._bindableToPolygon = true;
	        }

            this._caption.render(map, this._group);
            this._dataGroup.render(map, this._group);
            this._data.scheme._viewRendered(this);
        },

	    setVisible: function(value){
		    if (this._dataGroup)
			    this._dataGroup.setVisible(value);
		    if (this._caption)
			    this._caption.setVisible(value);
	    },

	    setBoundsVisibility: function(value){
		    if (this._dataGroup)
			    this._dataGroup.setBoundsVisibility(value);
		    if (this._caption)
			    this._caption.setBoundsVisibility(value);
		    return false;
	    },

	    resetDraggable: function(){
		    if (this._caption)
			    this._caption.resetDraggable();
		    if (this._dataGroup)
			    this._dataGroup.resetDraggable();
	    },

	    setDesignMode: function(value){
		    if (this._dataGroup)
			    this._dataGroup.setDesignMode(value);
		    if (this._caption)
			    this._caption.setDesignMode(value);
	    },

        setProperty: function(data) {
            this._super(data);
            if (data && data.property == "border-color") {
                this._rect.attr("stroke", "#" + data.value);
                this._data.stroke("#" + data.value)
            }
            if (data && data.property == "fill-color") {
                this._rect.attr("fill", "#" + data.value);
                this._data.background("#" + data.value)
            }
        },

        remove: function() {
            this._super();
            this._data.scheme._unbindSectorFromPolygon(this);
            if (this._dataGroup) {
                this._dataGroup.remove();
                this._dataGroup = null;
            }
            if (this._caption) {
                this._caption.remove();
                this._caption = null;
            }
            return this;
        }

    });

    window.SchemeDesigner.SectorView = SectorView;

})(window);

