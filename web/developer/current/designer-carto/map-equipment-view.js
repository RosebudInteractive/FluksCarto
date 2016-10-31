(function(window){
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

    var EquipmentView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data)
            this._group = null;
            this._hidden = true;
	        this._caption = false;
	        this._icon = false;
	        this._subIcon = false;
	        this._dataGroup = false;
	        this.shiftX = -30;
	        this.shiftY = -30;

            var imgUrl = data.icon().url();
            var natures = this._data.scheme._getNatures();
            if (!imgUrl && natures && natures[this._data.data().nature()])
                imgUrl = natures[this._data.data().nature()];
            data.icon().url(imgUrl);
        },

	    pointBelongsToEquipment: function (point){
			if ((this._caption) && (this._caption.pointBelongsToObject(point))) return true;
		    if ((this._icon) && (this._icon.pointBelongsToObject(point))) return true;
		    if ((this._subIcon) && (this._subIcon.pointBelongsToObject(point))) return true;
		    if ((this._dataGroup) && (!this._hidden) && (this._dataGroup.pointBelongsToObject(point))) return true;
		    return false;
	    },

	    ajustContainer: function(bounds){
		    if (this._dataGroup)
			    this._dataGroup.ajustContainer(true);
		    this.ajustDataPosition(this._data._bounds, true);
//		    console.log("ajustContainer")
	    },

	    getBounds: function(x, y){
		    var nw = SchemeDesigner.fromPixelToLatLng(this._map, x, y);
		    return new google.maps.LatLngBounds(nw, nw);
	    },

	    getAnchorPoint: function(){
			if (this._data && this._data._icon && this._data._icon._bounds)
			{
				this._requiresRepositioning = (this._data._icon._bounds.getNorthEast().lat() == this._data._icon._bounds.getSouthWest().lat());
				return this._data._icon._bounds.getCenter();
			}
		    else
				return null;
	    },

	    ajustCaptionPosition: function(bounds){
		    var px = SchemeDesigner.fromLatLngToPixel(this._map, bounds.getNorthEast().lat(),bounds.getSouthWest().lng());
		    this._data._title._x = px.x - this._data._x;
		    this._data._title._y = px.y - this._data._y;
		    this._data._title._bounds = this.getBounds(this._data._x + this._data._title._x, this._data._y + this._data._title._y);
		    this._caption.setBounds(this._data._title._bounds, true, true, false);
//		    console.log("ajustCaption")
	    },

	    getSubIconBounds: function (){
		    return this.getBounds(this._data._x + this._data._icon._x + this.shiftX, this._data._y + this._data._icon._y + this.shiftY);
	    },

	    ajustDataPosition: function(bounds, fromRescale){
		    var px = SchemeDesigner.fromLatLngToPixel(this._map, bounds.getNorthEast().lat(),bounds.getSouthWest().lng());
		    if (!fromRescale){
			    var pxIcon = SchemeDesigner.fromLatLngToPixel(this._map, this._data._icon._bounds.getNorthEast().lat(),this._data._icon._bounds.getSouthWest().lng());
			    var pxCaption = SchemeDesigner.fromLatLngToPixel(this._map, this._data._title._bounds.getNorthEast().lat(),this._data._title._bounds.getSouthWest().lng());
			    this._data._x = px.x;
			    this._data._y = px.y;
			    this._data._icon._x = (pxIcon.x - px.x);
			    this._data._icon._y = (pxIcon.y - px.y);
			    this._data._title._x = (pxCaption.x - px.x);
			    this._data._title._y = (pxCaption.y - px.y);
			} else {
			    this._data._x = px.x;
			    this._data._y = px.y;
		    }
		    this._data._title._bounds = this.getBounds(this._data._x + this._data._title._x, this._data._y + this._data._title._y);
		    this._caption.setBounds(this._data._title._bounds, true, true, false);
		    this._data._icon._bounds = this.getBounds(this._data._x + this._data._icon._x, this._data._y + this._data._icon._y);
		    this._icon.setBounds(this._data._icon._bounds, true, true, false);

		    this._subIcon.setBounds(this.getSubIconBounds(), true, true);

		    if ((!this._data._bounds.equals(bounds) || (this._requiresRepositioning))){
			    this._dataGroup._skipBoundsEvent = true;
			    this._dataGroup.setBounds(bounds, true, true, false);
			    this._data.scheme.equipmentMoves(this);
			    this._requiresRepositioning = false;
		    }
//		    console.log("ajustDataPosition", px.x, px.y)
	    },

	    ajustIconPosition: function(bounds, withResize){
		    var px = SchemeDesigner.fromLatLngToPixel(this._map, bounds.getNorthEast().lat(),bounds.getSouthWest().lng());
		    this._data._x = px.x - this._data._icon._x;
		    this._data._y = px.y - this._data._icon._y;
		    this._data._bounds = this.getBounds(this._data._x, this._data._y);
		    this._data._title._bounds = this.getBounds(this._data._x + this._data._title._x, this._data._y + this._data._title._y);
		    this._data._icon._bounds = this.getBounds(this._data._x + this._data._icon._x, this._data._y + this._data._icon._y);
		    this._caption.setBounds(this._data._title._bounds, true, true, false);

		    this._subIcon.setBounds(this.getSubIconBounds(), true, true, false);

		    this._dataGroup.setBounds(this._data._bounds, true, true, false);
		    this._data.scheme.equipmentMoves(this);
		    //console.log("ajustIconPosition",px.x, px.y,this._data._bounds.getNorthEast().lng(),this._data._bounds.getSouthWest().lng());
	    },

	    toggleData: function() {
		    if (this._dataGroup){
			    this._dataGroup.setVisible(this._hidden);
		        this._hidden = !this._hidden;
	        }
	    },

	    setBoundsVisibility: function(value){
		    if (this._dataGroup)
			    this._dataGroup.setBoundsVisibility(value && (!this._hidden));
		    if (this._caption)
			    this._caption.setBoundsVisibility(value);
		    if (this._icon)
			    this._icon.setBoundsVisibility(value);
		    if (this._subIcon)
			    this._subIcon.setBoundsVisibility(value);
		    return false;
	    },

	render: function(map, grp)  {
		    this._map = map;
            var fromCoords = false;
			var fromBounds = false;
            if (!this._dataGroup) {
	             if (this._data._bounds) {
		            var px = SchemeDesigner.fromLatLngToPixel(this._map, this._data._bounds.getNorthEast().lat(),this._data._bounds.getSouthWest().lng());
		            this._data._x = px.x;
		            this._data._y = px.y;
		            fromBounds = true;
	            } else if ((this._data._data) && (this._data._data._coordinates) && (this._data._data._coordinates.lat) && (this._data._data._coordinates.lng)) {
		            var px = SchemeDesigner.fromLatLngToPixel(this._map, this._data._data._coordinates.lat, this._data._data._coordinates.lng);
		            this._data._x = px.x;
		            this._data._y = px.y;
		            fromCoords = true;
	            }
            }
	        if (!this._caption) {
		        this._data._title._bounds = this.getBounds(this._data._x + this._data._title._x, this._data._y + this._data._title._y);
		        this._caption = new SchemeDesigner.EntryTitleView(this._data._title, this);
	        }
	        if (!this._dataGroup) {
		        if (!fromBounds) this._data._bounds = this.getBounds(this._data._x, this._data._y);
                this._data._hidden = this._hidden;
		        this._dataGroup = new SchemeDesigner.EntryDataView(this._data, this, false); //showStatus = true
	        }
	        if (!this._icon) {
		        this._data._icon._bounds = this.getBounds(this._data._x + this._data._icon._x, this._data._y + this._data._icon._y);
	            this._icon = new SchemeDesigner.EntryIconView(this._data.icon(), this, true);
	        }
			if (!this._subIcon) {
				this._subIcon = new SchemeDesigner.EntrySubIconView(null, this, this.getSubIconBounds());
			}

	        this._caption.render(map, this._group);
	        this._icon.render(map, this._group);
			this._subIcon.render(map, this._group);
	        this._dataGroup.render(map, this._group);
			this._dataGroup.setVisible(!this._hidden);
            if (fromCoords) {
	            map.panTo(new google.maps.LatLng({lat: this._data._icon._bounds.getNorthEast().lat(), lng: this._data._icon._bounds.getSouthWest().lng()}));
	            //map.fitBounds(this._data._icon._bounds);
            }
            this._data.scheme._viewRendered(this);
        },

	    setVisible: function(value){
		    if (this._dataGroup)
			    this._dataGroup.setVisible(value && (!this._hidden));
		    if (this._caption)
			    this._caption.setVisible(value);
		    if (this._icon)
			    this._icon.setVisible(value);
		    if (this._subIcon)
			    this._subIcon.setVisible(value);
	    },

	    setDesignMode: function(value){
		    if (this._dataGroup)
			    this._dataGroup.setDesignMode(value);
		    if (this._caption)
			    this._caption.setDesignMode(value);
		    if (this._icon)
			    this._icon.setDesignMode(value);
		    if (this._subIcon)
			    this._subIcon.setDesignMode(value);
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

	    resetDraggable: function(){
		    if (this._icon)
			    this._icon.resetDraggable();
		    if (this._caption)
			    this._caption.resetDraggable();
		    if (this._dataGroup)
			    this._dataGroup.resetDraggable();
	    },

	    remove: function() {
            this._super();
	        if (this._dataGroup) {
		        this._dataGroup.remove();
		        this._dataGroup = null;
	        }
	        if (this._caption) {
		        this._caption.remove();
		        this._caption = null;
	        }
	        if (this._icon) {
		        this._icon.remove();
		        this._icon = null;
	        }
		    if (this._subIcon) {
			    this._subIcon.remove();
			    this._subIcon = null;
		    }
            return this;
        }

    });
    window.SchemeDesigner.EquipmentView = EquipmentView;

})(window);
