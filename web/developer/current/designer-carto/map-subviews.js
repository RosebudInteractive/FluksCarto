(function($){
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

	visibleWeight = 2;
	visibleOpacity = 0.5;

    var EntryTitleView = SchemeDesigner.ViewBase.extend({
        init: function(data, parent) {
            this._super(data);
            this._parent = parent;
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
			        strokeOpacity:visibleOpacity,
			        strokeWeight: visibleWeight,
			        fillOpacity: 0,
			        background: "transparent",
			        visible: true,
			        draggable: true,
                    zIndex: 200
		        };
		        this._googleMapObj = new google.maps.Rectangle(tmp);
		        this._googleMapObj.setMap(map);
		        var overlayOptions = {
			        bounds: this._data._bounds,
			        fontFamily: this._data.fontFamily(),
			        fontSize: this._data.fontSize(),
			        color: this._data.color()
		        };
		        this._overlay = new MapTextOverlay(tmp.bounds, this._data.entry()._name, this._map, overlayOptions, this.ajustContainer.bind(this));
		        this._googleMapObj.addListener('click', function (e) {
			        if (!that._data.scheme.designMode()) return;
			        var ed = true;
			        that._googleMapObj.setOptions({draggable:true});
			        that._googleMapObj.setOptions({strokeWeight: ed ? visibleWeight : 0, strokeOpacity: ed ? visibleOpacity : 0});
			        that._data.scheme._viewClicked(that, e);
			        return false;
		        });
		        this._googleMapObj.addListener('mousemove', function (e) {
			        if (that._dragReset){
				        that._googleMapObj.setOptions({draggable:true});
				        that._dragReset = false;
			        }
			        return false;
		        });

		        this._googleMapObj.addListener('drag', function (e) {
                    that.setBounds(that._googleMapObj.getBounds(), true, false, true);
			        return false;
		        });
		        this._googleMapObj.addListener('dragstart', function (e) {
			        if (that._parent)
				        that._parent.setBoundsVisibility(false);
			        return false;
		        });
		        this._googleMapObj.addListener('dragend', function (e) {
			        if (that._parent)
				        that._parent.setBoundsVisibility(true);
			        return false;
		        });
	        }
            this._data.scheme._viewRendered(this);
        },

	    pointBelongsToObject: function(point){
		    return (this._googleMapObj && this._googleMapObj.getBounds().contains(point));
	    },

	    remove: function() {
		    this._super();
		    if (this._googleMapObj){
			    this._googleMapObj.setMap(null);
			    this._googleMapObj = null;
		    }
		    if (this._overlay){
                this._overlay.setMap(null);
			    this._overlay = null;
		    }
		    return this;
	    },

	    setBoundsVisibility: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setVisible(value);
	    },

        setBounds: function(bounds, forOverlay, forGoogleMap, ajustParent){
            this._data._bounds = bounds;
            if (forOverlay) {
                this._overlay.bounds_ = bounds;
                this._overlay.draw();
            }
            bounds = this._overlay.getBoundsFromDiv();
            if (forGoogleMap) {
                this._googleMapObj.setBounds(bounds);
            }
            if (ajustParent)
                this._parent.ajustCaptionPosition(bounds);
            this._data.scheme._viewMoved(this);
        },

	    ajustContainer: function(){
		    if (this._overlay)
                this.setBounds(this._overlay.getBoundsFromDiv(), false, true, false);
	    },

	    resetDraggable: function(){
		    if (this._googleMapObj) {
			    this._dragReset = true;
			    this._googleMapObj.setOptions({draggable:false});
		    }
	    },

	    setDesignMode: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setOptions({draggable:value, editable: false});
	    },

	    setVisible: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setVisible(value);
		    if (this._overlay)
			    this._overlay.setVisible(value);
	    },

        setProperty: function(data) {
            this._super(data);
	        if ((!this._element) && (this._overlay) && (this._overlay.div_)) this._element = this._overlay.div_;
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
    });
    SchemeDesigner.EntryTitleView = EntryTitleView;

    var EntryIconView = SchemeDesigner.ViewBase.extend({
        init: function(data, parent, showStatus) {
            this._super(data);
            this._status = null;
            this._parent = parent;
	        this._googleMapObj = null;
	        this._element = null;
	        this._overlay = null;
	        this._showStatus = showStatus;
        },

	    pointBelongsToObject: function(point){
		    return (this._googleMapObj && this._googleMapObj.getBounds().contains(point));
	    },

	    render: function(map, group) {
	        var that = this;
	        this._super(map, group);
	        if (!this._googleMapObj) {
		        var tmp = {
			        bounds: this._data._bounds,
			        strokeColor: "#808080",
			        strokeOpacity: this.visibleOpacity,
			        strokeWeight: this.visibleWeight,
			        fillOpacity: 0,
			        editable: false,
			        visible: true,
			        draggable: true,
			        zIndex: 100
		        };
		        this._googleMapObj = new google.maps.Rectangle(tmp);
		        this._googleMapObj.setMap(map);
		        var overlayOptions = {
			        bounds: this._data._bounds,
			        status: this._showStatus
		        };
		        this._overlay = new MapImageOverlay(tmp.bounds, this._data.url(), this._map, overlayOptions, this.ajustContainer.bind(this));
		        this._googleMapObj.addListener('click', function (e) {
			        if (!that._data.scheme.designMode()) return;
			        var ed = true;//!that._googleMapObj.getEditable();
			        //that._googleMapObj.setEditable(ed);
//			        that._googleMapObj.setOptions({draggable:true});
//			        that._googleMapObj.setVisible(true);
			        that._googleMapObj.setOptions({visible:true, draggable:true, strokeWeight: ed ? visibleWeight : 0, strokeOpacity: ed ? visibleOpacity : 0});
			        that._data.scheme._viewClicked(that, e);
			        e.stop();
			        return false;
		        });
		        this._googleMapObj.addListener('drag', function (e) {
			        that._overlay.bounds_ = that._googleMapObj.getBounds();
			        that._overlay.draw();
			        that._data._bounds = that._overlay.bounds_;
			        that._data.scheme._viewMoved(that);
			        that._parent.ajustIconPosition(that._overlay.bounds_);
			        return false;
		        });
		        this._googleMapObj.addListener('bounds_changed', function (e) {
			        return false;
		        });
		        this._overlay.addListener('bounds_changed', function (e) {
			        return false;
		        });
		        this._googleMapObj.addListener('dragstart', function (e) {
			        if (that._parent)
				        that._parent.setBoundsVisibility(false);
			        return false;
		        });
		        this._googleMapObj.addListener('dragend', function (e) {
			        if (that._parent)
				        that._parent.setBoundsVisibility(true);
			        return false;
		        });
		        this._googleMapObj.addListener('mousemove', function (e) {
			        if (that._dragReset){
				        that._googleMapObj.setOptions({draggable:that._data.scheme.designMode()});
				        that._dragReset = false;
			        }
			        return false;
		        });
		        this._googleMapObj.addListener('dblclick', function (e) {
			        if (that._parent && that._parent._data && that._parent._data._data._url && !that._data.scheme.designMode())
					   window.open(that._parent._data._data._url);
					//that._parent.toggleData();
			        //e.stop();
			        return false;
		        });
	        }
        },

	    ajustContainer: function(bounds){
		    if (this._overlay) {
			    if (!bounds) bounds = this._overlay.getBoundsFromDiv();
			    this._data._bounds = bounds;
			    this._googleMapObj.setBounds(bounds);
		    }
	    },

	    resetDraggable: function(){
		    if (this._googleMapObj) {
			    this._dragReset = true;
			    this._googleMapObj.setOptions({draggable:false});
		    }
	    },

	    setDesignMode: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setOptions({draggable:value, editable: false});
	    },
        _renderAttrs: function(snap, group) {
            var active = this._data.entry().active();
            if (active === true)
                this._status.addClass("active").removeClass("passive");
            else if (active === false)
                this._status.addClass("passive").removeClass("active");
            else if (active && active.slice(0, 1) == "#") {
                this._status.removeClass("passive").removeClass("active").attr({fill: active});
            } else
                this._status.removeClass("passive").removeClass("active");
            this._data.scheme._viewRendered(this);
        },

	    setBounds: function(bounds, forOverlay, forGoogleMap, ajustParent){
		    this._data._bounds = bounds;
		    if (forOverlay) {
			    this._overlay.bounds_ = bounds;
			    this._overlay.draw();
		    }
		    bounds = this._overlay.getBoundsFromDiv();
		    if (forGoogleMap) {
			    this._googleMapObj.setBounds(bounds);
		    }
		    this._data.scheme._viewMoved(this);
	    },

	    remove: function() {
		    this._super();
		    if (this._googleMapObj){
			    this._googleMapObj.setMap(null);
			    this._googleMapObj = null;
		    }
		    if (this._overlay){
                this._overlay.setMap(null);
			    this._overlay = null;
		    }
		    return this;
	    },

        handleKeyboard: function(e) {
            //if (this._selfDrag) return this._super(e);
            //else return this._parent.handleKeyboard(e, true);
        },

	    setBoundsVisibility: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setVisible(value);
	    },

	    setVisible: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setVisible(value);
		    if (this._overlay)
			    this._overlay.setVisible(value);
        }
    });
    SchemeDesigner.EntryIconView = EntryIconView;

	var EntrySubIconView = SchemeDesigner.ViewBase.extend({
		init: function(data, parent, bounds) {
			this._super(data);
			this._bounds = bounds;
			this._parent = parent;
			this._googleMapObj = null;
			this._overlay = null;
		},

		pointBelongsToObject: function(point){
			return (this._googleMapObj && this._googleMapObj.getBounds().contains(point));
		},

		render: function(map, group) {
			var that = this;
			this._super(map, group);
			if (!this._googleMapObj) {
				var tmp = {
					bounds: this._bounds,
					strokeColor: "transparent",
					strokeOpacity: this.visibleOpacity,
					strokeWeight: this.visibleWeight,
					fillOpacity: 0,
					editable: false,
					visible: true,
					draggable: false,
					zIndex: 100
				};
				this._googleMapObj = new google.maps.Rectangle(tmp);
				this._googleMapObj.setMap(map);
				this._overlay = new MapImageOverlay(this._bounds, "designer/css/img/info-popup.png", this._map, {});
				this._googleMapObj.addListener('click', function (e) {
					that._parent.toggleData();
					e.stop();
					return false;
				});
			}
		},

		ajustContainer: function(bounds){
			if (this._overlay) {
				if (!bounds) this._bounds = this._overlay.getBoundsFromDiv();
				this._googleMapObj.setBounds(this._bounds);
			}
		},


//		ajustContainer: function(bounds){
//			if (this._overlay) {
//				if (!bounds) bounds = this._overlay.getBoundsFromDiv();
//				this._data._bounds = bounds;
//				this._googleMapObj.setBounds(bounds);
//			}
//		},

		setBounds: function(bounds, forOverlay, forGoogleMap){
			this._bounds = bounds;
			if (forOverlay) {
				this._overlay.bounds_ = bounds;
				this._overlay.draw();
			}
			bounds = this._overlay.getBoundsFromDiv();
			if (forGoogleMap) {
				this._googleMapObj.setBounds(bounds);
			}
		},

		remove: function() {
			this._super();
			if (this._googleMapObj){
				this._googleMapObj.setMap(null);
				this._googleMapObj = null;
			}
			if (this._overlay){
				this._overlay.setMap(null);
				this._overlay = null;
			}
			return this;
		},

		handleKeyboard: function(e) {
		},

		setBoundsVisibility: function(value){
			if (this._googleMapObj) {
				this._googleMapObj.setVisible(value);
			}
			return;
		},

		setDesignMode: function(value){
			if (this._googleMapObj)
				this._googleMapObj.setOptions({draggable:false, editable: false});
		},

		setVisible: function(value){
			if (this._googleMapObj)
				this._googleMapObj.setVisible(value);
			if (this._overlay)
				this._overlay.setVisible(value);
		}
	});
	SchemeDesigner.EntrySubIconView = EntrySubIconView;

    var EntryDataView = SchemeDesigner.ViewBase.extend({
	    init: function (data, parent, showStatus) {
		    this._super(data);
		    this._overlay = null;
		    this._googleMapObj = null;
            this._parent = parent;
		    this.visibleWeight = 4;
		    this.visibleOpacity = 0.5;
		    this.showStatus_ = showStatus;
            this._hidden = data._hidden;
	    },

	    pointBelongsToObject: function(point){
		    return (this._googleMapObj && this._googleMapObj.getBounds().contains(point));
	    },

	    render: function (map, group) {
		    var that = this;
		    this._super(map, group);
		    if (!this._googleMapObj) {
			    var tmp = {
				    bounds: this._data._bounds,
				    strokeColor: "#808080",
				    strokeOpacity: this.visibleOpacity,
				    strokeWeight: this.visibleWeight,
				    fillOpacity: 0,
				    background: "white",
				    editable: true,
				    visible: !this._hidden,
				    draggable: true,
                    zIndex: 700
			    };
			    this._googleMapObj = new google.maps.Rectangle(tmp);
			    this._googleMapObj.setMap(map);
			    var overlayOptions = {
				    bounds: this._data._bounds,
				    color: "#000000",
				    fontFamily: "MS Sans Serif",
				    fontSize: "16",
				    status: this.showStatus_,
					background: this._data._background,
				    stroke: this._data._stroke,
                    hidden: this._hidden
			    };
			    this._overlay = new MapDataOverlay(tmp.bounds, this._data, this._map, overlayOptions, this.ajustContainer.bind(this));
			    this._googleMapObj.addListener('click', function (e) {
				    if (!that._data.scheme.designMode()) return;
				    that._googleMapObj.setEditable(true);
				    that._googleMapObj.setOptions({draggable:true});
				    var ed = true;
				    that._googleMapObj.setOptions({strokeWeight: ed ? this.visibleWeight : 0, strokeOpacity: ed ? this.visibleOpacity : 0});
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

			    this._googleMapObj.addListener('dragstart', function (e) {
				    that._googleMapObj.setEditable(false);
				    if (that._parent)
					    that._parent.setBoundsVisibility(false);
				    if (window.ctrlIsDown && (that._bindableToPolygon)){
					    that._data.scheme._unbindSectorFromPolygon(that._parent);
				    }
				    return false;
			    });
			    this._googleMapObj.addListener('dragend', function (e) {
				    if (that._parent)
					    that._parent.setBoundsVisibility(true);
				    if (window.ctrlIsDown && (that._bindableToPolygon)){
					    var polygon = that._data.scheme._findPolygonAtPoint(e);
					    if (polygon)
						    polygon.data().sector(that._parent);
				    }
				    return false;
			    });
			    this._googleMapObj.addListener('drag', function (e) {
				    that._overlay.bounds_ = that._googleMapObj.getBounds();
				    that._overlay.draw();
				    that._data._bounds = that._overlay.bounds_;
				    that._data.scheme._viewMoved(that);
                    that._parent.ajustDataPosition(that._overlay.bounds_);
				    return false;
			    });
			    this._skipBoundsEvent = false;
                this._googleMapObj.addListener('bounds_changed', function (e) {
	                if (!that._skipBoundsEvent) {
		                that._data._bounds = that._overlay.bounds_;
		                that._overlay.resizeByBounds(that._googleMapObj.getBounds());
		                that._parent.ajustDataPosition(that._googleMapObj.getBounds());
		                that._data.scheme._viewMoved(that);
	                }
	                that._skipBoundsEvent = false;
                    return false;
                });
		    }
		    this._data.scheme._viewRendered(this);
	    },

	    setVisible: function(value){
		    if (this._overlay)
			    this._overlay.setVisible(value);
		    if (this._googleMapObj)
			    this._googleMapObj.setVisible(value);
	    },

	    getVisible: function(){
		    return (this._overlay)? this._overlay.getVisible():false;
	    },

	    setBoundsVisibility: function(value){
		    if (this._googleMapObj) {
			    this._googleMapObj.setVisible(value && this._visible);
		    }
	    },

	    setBounds: function(bounds, forOverlay, forGoogleMap){
		    this._data._bounds = bounds;
		    if ((forOverlay)&&(this._overlay)) {
			    this._overlay.bounds_ = bounds;
			    this._overlay.draw();
		    }
		    bounds = this._overlay.getBoundsFromDiv();
		    if ((forGoogleMap)&&(this._googleMapObj)) {
			    this._googleMapObj.setBounds(bounds);
		    }
		    this._data.scheme._viewMoved(this);
	    },

	    remove: function() {
		    this._super();
		    if (this._googleMapObj){
			    this._googleMapObj.setMap(null);
			    this._googleMapObj = null;
		    }
		    if (this._overlay){
                this._overlay.setMap(null);
			    this._overlay = null;
		    }
		    return this;
	    },

	    ajustContainer: function (fromResize) {
		    if (this._overlay) {
			    var bounds = this._overlay.getBoundsFromDiv();
			    this._data._bounds = bounds;
			    this._skipBoundsEvent = fromResize;
                if (this._googleMapObj)
			        this._googleMapObj.setBounds(bounds);
			    this._skipBoundsEvent = false;
		    }
	    },

	    setDesignMode: function(value){
		    if (this._googleMapObj)
			    this._googleMapObj.setOptions({draggable:value, editable: false});
	    },

	    resetDraggable: function(){
		    if (this._googleMapObj) {
			    this._dragReset = true;
			    this._googleMapObj.setOptions({draggable:false});
		    }
	    },

	    setProperty: function(data) {
		    this._super(data);
		    if (data && data.property == "border-color") {
			    if (this._overlay)
				    this._overlay.setOptions(data);
			    this._data.stroke("#" + data.value)
		    }
		    if (data && data.property == "fill-color") {
			    if (this._overlay)
				    this._overlay.setOptions(data);
			    this._data.background("#" + data.value)
		    }
	    }

    });
    SchemeDesigner.EntryDataView = EntryDataView;

})(jQuery);
