(function($) {
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

	SchemeDesigner.getEmptyPolygon = function(map, event){
		var tmp = {
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			paths: [], editable: false};
		var bounds = map.getBounds();
		var dLng = Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
		var dLat = Math.abs(bounds.getNorthEast().lat() - bounds.getSouthWest().lat());
		var sLng = event.latLng.lng() - dLng / 10;
		var sLat = event.latLng.lat() - dLat / 10;
		tmp.paths.push(new google.maps.LatLng({lat: sLat, lng: sLng}));
		tmp.paths.push(new google.maps.LatLng({lat: sLat, lng: sLng + dLng / 5}));
		tmp.paths.push(new google.maps.LatLng({lat: sLat + dLat / 5, lng: sLng + dLng / 5}));
		tmp.paths.push(new google.maps.LatLng({lat: sLat + dLat / 5, lng: sLng}));
		return tmp;
	};

	SchemeDesigner.getEmptyLine = function(map, event){
		var tmp = {
			strokeColor: "#00FF00",
			strokeOpacity: 1,
			strokeWeight: 2,
			paths: [], editable: false};
		var bounds = map.getBounds();
		var dLng = Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
		var dLat = Math.abs(bounds.getNorthEast().lat() - bounds.getSouthWest().lat());
		var sLng = event.latLng.lng() - dLng / 10;//bounds.getCenter().getLng();
		var sLat = event.latLng.lat() - dLat / 10;//bounds.getCenter().getLat();
		tmp.paths.push(new google.maps.LatLng({lat: sLat, lng: sLng}));
		tmp.paths.push(new google.maps.LatLng({lat: sLat + dLat / 5, lng: sLng + dLng / 5}));
		return tmp;
	};

	SchemeDesigner.getEmptyBounds = function(map, event) {
		var mapBounds = map.getBounds();
		var dLng = Math.abs(mapBounds.getNorthEast().lng() - mapBounds.getSouthWest().lng());
		var dLat = Math.abs(mapBounds.getNorthEast().lat() - mapBounds.getSouthWest().lat());
		var bounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
			new google.maps.LatLng(event.latLng.lat()+dLat / 20, event.latLng.lng()+dLng / 20));
		return bounds;
	};

    SchemeDesigner.getEmptyTitle = function(map, event){
        return {
	        color: "#000000",
	        fontFamily: "Times New Roman",
	        fontSize: "16",
	        text: "New text",
	        bounds: SchemeDesigner.getEmptyBounds(map, event)
        };
    };


    var PolygonView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._element = null;
            this._googleMapObj = null;
            this._super(data);
            this._resizeData = null;
	        this._eventsOnPath = false;
        },

        render: function (map, grp) {
            this._super(map, grp);
            var that = this;
            if (!this._googleMapObj) {
	            var tmp = {paths: this._data._paths,
		            strokeColor: this._data._strokeColor,
		            fillColor: this._data._fillColor,
		            fillOpacity: this._data._fillOpacity,
	                strokeOpacity: this._data._strokeOpacity,
		            draggable: true,
		            strokeWeight:this._data._strokeWeight
	            };
                this._googleMapObj = new google.maps.Polygon(tmp);
                this._googleMapObj.setMap(map);
	            this._googleMapObj.addListener('click', function(e) {
		            if (!that._data.scheme.designMode()) return;
		            if (this.getEditable()){
		                var del = (window.event) && (window.event.ctrlKey);
			            if ((e.vertex != null) && del) {
					            this.getPath().removeAt(e.vertex);
			            } else {
				            this.setEditable(false);
			            }
		            } else {
			            this.setEditable(true);
			            if (!that._eventsOnPath) {
				            this.getPath().addListener('set_at', function (index) {
					            that._data._paths = that._googleMapObj.getPath().getArray();
					            return false;
				            });
				            this.getPath().addListener('insert_at', function (index) {
					            that._data._paths = that._googleMapObj.getPath().getArray();
					            return false;
				            });
				            this.getPath().addListener('remove_at', function (index) {
					            that._data._paths = that._googleMapObj.getPath().getArray();
					            return false;
				            });
				            that._eventsOnPath = true;
			            }
		            }
		            that._data.scheme._viewClicked(that, e);
		            e.stop();
		            return false;
	            });
	            this._googleMapObj.addListener('mouseover', function(e) {
	                //this.setEditable(true);
		            this.setOptions({strokeWeight:4});
		            return false;
	            });
	            this._googleMapObj.addListener('mouseout', function(e) {
		            //this.setEditable(false);
		            this.setOptions({strokeWeight:2});
		            return false;
	            });
	            this._googleMapObj.addListener('dragstart', function(e) {
		            that._startDragPoint = e.latLng;
		            if (that._data._sector){
			            that._data._sector.setBoundsVisibility(false);
			            that._sectorStartDrag = that._data._sector._data._bounds;
		            }
		            return false;
	            });
	            this._googleMapObj.addListener('drag', function(e) {
		            if (that._startDragPoint){
			            var shiftLat = e.latLng.lat() - that._startDragPoint.lat();
			            var shiftLng = e.latLng.lng() - that._startDragPoint.lng();
			            if (that._data._sector && that._sectorStartDrag){
				            var oldNe = that._sectorStartDrag.getNorthEast();
				            var oldSw = that._sectorStartDrag.getSouthWest();
				            var newNe = new google.maps.LatLng(oldNe.lat()+shiftLat, oldNe.lng()+shiftLng);
				            var newSw = new google.maps.LatLng(oldSw.lat()+shiftLat, oldSw.lng()+shiftLng);
				            var newBounds = new google.maps.LatLngBounds(newSw, newNe);
				            that._data._sector.ajustDataPosition(newBounds);
			            }
		            }
		            return false;
	            });
	            this._googleMapObj.addListener('dragend', function(e) {
		            that._startDrapPoint = null;
		            if (that._data._sector) {
			            that._data._sector.setBoundsVisibility(true);
		            }
		            that._data._paths = that._googleMapObj.getPath().getArray();
		            return false;
	            });

            }
            this._data.scheme._viewRendered(this);
        },

        getVisible: function(){
            return (this._googleMapObj) && this._googleMapObj.getVisible();
        },

        setVisible: function(value){
            return (this._googleMapObj) && this._googleMapObj.setVisible(value);
        },


	    setDesignMode: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setOptions({draggable:value, editable: value});
	    },

        setProperty: function(data) {
            this._super(data);
            if (data && data.property == "border-color") {
	            this._data._strokeColor = "#" + data.value;
	            this._googleMapObj.setOptions({strokeColor:this._data._strokeColor});
            }
            if (data && data.property == "fill-color") {
	            this._data._fillColor = "#" + data.value;
	            this._googleMapObj.setOptions({fillColor:this._data._fillColor});
            }
        },

        remove: function() {
            this._super();
            if (this._googleMapObj)
                this._googleMapObj.setMap(null);
            this._googleMapObj = null;
            return this;
        }

    });
    SchemeDesigner.PolygonView = PolygonView;

    var TitleView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data);
            this._dragData = null;
            this._border = null;
            this._googleMapObj = null;
            this._element = null;
            this._overlay = null;
        },

        render: function(map, group) {
            this._super(map, group);
            var that = this;
            if (!this._googleMapObj) {
                var tmp = {
                    bounds: this._data._bounds,
                    strokeColor: "#000000",
                    strokeOpacity: 0.5,
                    strokeWeight: 2,
                    fillOpacity:0,
                    background:"transparent",
                    //editable: true,
                    visible: true,
	                zIndex: 300,
                    draggable: true
                };
                this._googleMapObj = new google.maps.Rectangle(tmp);
                this._googleMapObj.setMap(map);
                var overlayOptions = {
                    bounds: this._data._bounds,
                    fontFamily: this._data.fontFamily(),
                    fontSize: this._data.fontSize(),
                    color: this._data.color()
                };
                this._overlay = new MapTextOverlay(tmp.bounds, this._data._text, this._map, overlayOptions, this.ajustContainer.bind(this));
                this._googleMapObj.addListener('click', function(e) {
	                if (!that._data.scheme.designMode()) return;
                    var ed = true;//!that._googleMapObj.getEditable();
                    //that._googleMapObj.setEditable(ed);
                    that._googleMapObj.setOptions({draggable:true, strokeWeight: ed?2:0, strokeOpacity: ed?0.5:0});
                    that._data.scheme._viewClicked(that, e);
                    e.stop();
                    return false;
                });

	            this._googleMapObj.addListener('mousemove', function (e) {
		            if (that._dragReset){
			            that._googleMapObj.setOptions({draggable:true});
			            that._dragReset = false;
		            }
		            return false;
	            });

	            this._googleMapObj.addListener('drag', function(e) {
                    that._overlay.bounds_ = that._googleMapObj.getBounds();
                    that._overlay.draw();
	                that._data._bounds = that._googleMapObj.getBounds();
	                return false;
                });
	            this._googleMapObj.addListener('dragend', function(e) {
		            that._data._bounds = that._googleMapObj.getBounds();
		            return false;
	            });

            }
            this._data.scheme._viewRendered(this);
        },

	    resetDraggable: function(){
		    if (this._googleMapObj) {
			    this._dragReset = true;
			    this._googleMapObj.setOptions({draggable:false});
		    }
	    },

	    setDesignMode: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setOptions({draggable:value, editable: value});
	    },

	    ajustContainer: function(){
		    if (this._overlay) {
			    var bounds = this._overlay.getBoundsFromDiv();
			    this._data._bounds = bounds;
			    this._googleMapObj.setBounds(bounds);
		    }
	    },

        setProperty: function(data) {
            this._super(data);
            if ((!this._element) && (this._overlay) && (this._overlay.div_)) this._element = this._overlay.div_;
            if (this._element) {
                if (data && data.property == "text") {
                    this._element.innerHTML = data.value;
                    this._data.text(data.value);
	                this.ajustContainer();
                }
                if (data && data.property == "text-color") {
                    this._element.style.color = "#" + data.value;
                    this._data.color("#" + data.value);
                }
                if (data && data.property == "text-size") {
                    this._element.style.fontSize = data.value + 'px';
                    this._data.fontSize(data.value);
	                this.ajustContainer();
                }
                if (data && data.property == "font-family") {
                    this._element.style.fontFamily = data.value;
                    this._data.fontFamily(data.value);
	                this.ajustContainer();
                }

                if (data && data.property == "text-bold") {
                    this._element.style.fontWeight = data.value ? "900" : null;
                    this._data.bold(data.value);
	                this.ajustContainer();
                }

                if (data && data.property == "text-italic") {
                    this._element.style.fontStyle = data.value ? "italic" : null;
                    this._data.italic(data.value);
	                this.ajustContainer();
                }

                if (data && data.property == "text-underline") {
                    this._element.style.textDecoration  = data.value ? "underline" : null;
                    this._data.underline(data.value);
	                this.ajustContainer();
                }
            }
        },

        remove: function() {
            this._super();
            if (this._overlay)
                this._overlay.setMap(null);
            this._overlay = null;
            if (this._googleMapObj)
                this._googleMapObj.setMap(null);
            this._googleMapObj = null;
            this._element = null;
            return this;
        },

    });
    SchemeDesigner.TitleView = TitleView;

    var LineView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
	        this._element = null;
	        this._googleMapObj = null;
	        this._super(data);
	        this._border = null;
	        this._foreground = null;
        },

        render: function (map, grp) {
	        this._super(map, grp);
	        var that = this;
	        if (!this._googleMapObj) {
		        var tmp = {
			        path: this._data._paths,
			        strokeColor: this._data._strokeColor,
			        strokeOpacity: this._data._strokeOpacity,
			        strokeWeight:this._data._strokeWeight,
			        editable: true,
			        draggable: true,
			        zIndex: 250
		        };
		        this._googleMapObj = new google.maps.Polyline(tmp);
		        this._googleMapObj.setMap(map);
		        this._googleMapObj.addListener('click', function(e) {
			        if (!that._data.scheme.designMode()) return;

			        if (this.getEditable()){
				        this.setEditable(false);
			        } else {
				        this.setEditable(true);
			        }
			        that._data.scheme._viewClicked(that, e);
			        e.stop();
			        return false;
		        });
		        this._googleMapObj.addListener('mouseover', function(e) {
			        //this.setEditable(true);
			        this.setOptions({strokeWeight:that._data._strokeWeight + 4});
			        return false;
		        });
		        this._googleMapObj.addListener('mouseout', function(e) {
			        //this.setEditable(false);
			        this.setOptions({strokeWeight:that._data._strokeWeight});
			        return false;
		        });
		        this._googleMapObj.getPath().addListener('insert_at', function(index) {
			        that._googleMapObj.setMap(null);
			        if (index==1) {
				        this.removeAt(index);
			        }
			        that._googleMapObj.setMap(map);
			        return false;
		        });
		        this.disableSetAt = false;
		        this._googleMapObj.getPath().addListener('set_at', function(index) {
			        if (!that.disableSetAt) {
				        that._data._paths = that._googleMapObj.getPath().getArray();
//				        if (window.ctrlIsDown && (index in [0, 1])) {
				        if (index in [0, 1]) {
					        that.checkLinkToEquipment(index, window.ctrlIsDown);
				        }
			        }
			        that.disableSetAt = false;
		        });
		        this._googleMapObj.addListener('dragend', function(index) {
			        that._data._paths = that._googleMapObj.getPath().getArray();
			        if (window.ctrlIsDown && (index in [0, 1])) {
				        that.checkLinkToEquipment(0);
				        that.checkLinkToEquipment(1);
			        }
			        return false;
		        });
		        this._googleMapObj.addListener('dragstart', function(index) {
			        if (window.ctrlIsDown){
				        that._data._equipment1 = null;
				        that._data._equipment2 = null;
			        }
			        return false;
		        });
	        }
            this._data.scheme._viewRendered(this);
        },

	    checkLinkToEquipment: function(index, bindIfNotEmpty){
		    var latLngPoint = this._data._paths[index];//new google.maps.LatLng({lat:this._data._paths[index].lat(), lng:this._data._paths[index].lng()});
		    var eq = this._data.scheme._findEquipmentAtPoint(latLngPoint);
		    if (bindIfNotEmpty || (eq==null)) {
			    if (index == 0) this._data._equipment1 = eq;
			    if (index == 1) this._data._equipment2 = eq;
		    }
		    if (eq) this.checkEquipmentMove(eq);
	    },

	    checkEquipmentMove: function(equipment){
		    var index = -1;
			if (this._data._equipment1 == equipment) index = 0;
		    if (this._data._equipment2 == equipment) index = 1;
		    if (index == -1) return false;
			this._data._paths[index] = equipment.getAnchorPoint();
		    this.disableSetAt = true;
		    this._googleMapObj.setMap(null);
		    this._googleMapObj.getPath().setAt(index, this._data._paths[index]);
		    this._googleMapObj.setMap(this._map);
	    },

        getVisible: function(){
            return (this._googleMapObj) && this._googleMapObj.getVisible();
        },

        setVisible: function(value){
            return (this._googleMapObj) && this._googleMapObj.setVisible(value);
        },

        setProperty: function(data) {
	        this._super(data);
	        if (data && data.property == "fill-color") {
		        this._data._strokeColor = "#" + data.value;
		        this._googleMapObj.setOptions({strokeColor:this._data._strokeColor});
	        }
	        if (data && data.property == "line-width") {
		        this._data._strokeWeight = data.value;
		        this._googleMapObj.setOptions({strokeWeight:data.value});
	        }
        },

	    setDesignMode: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setOptions({draggable:value, editable: value});
	    },

        _renderLineWidth: function(showAsFocused) {

            var width = this._data.width() ? this._data.width() : 4;
            var borderWidth = (+width) + 5;
            if (this.focused() || showAsFocused) this._border.addClass("visible");
            else this._border.removeClass("visible");

            this._element.attr({ "stroke-width": width });
            this._border.attr({ "stroke-width": borderWidth });
            this._foreground.attr({ "stroke-width": borderWidth });
        },

        remove: function() {
            this._super();
            if (this._googleMapObj)
                this._googleMapObj.setMap(null);
            this._googleMapObj = null;
            return this;
        }

    });
    SchemeDesigner.LineView = LineView;
})(jQuery);
