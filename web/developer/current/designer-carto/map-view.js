(function($){
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

// use this transport for "binary" data type
// MAP COMPATIBLE
	window.ctrlIsDown = false;

	window.onkeydown = function(e) {
		window.ctrlIsDown  = ((e.keyIdentifier == 'Control') || (e.ctrlKey == true));
	};

	window.onkeyup = function(e) {
		window.ctrlIsDown = false;
	};

	$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
        // check for conditions and support for blob / arraybuffer response type
        if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
        {
            return {
                // create new XMLHttpRequest
                send: function(headers, callback){
                    // setup all variables
                    var xhr = new XMLHttpRequest(),
                        url = options.url,
                        type = options.type,
                        async = options.async || true,
                    // blob or arraybuffer. Default is blob
                        dataType = options.responseType || "blob",
                        data = options.data || null,
                        username = options.username || null,
                        password = options.password || null;

                    xhr.addEventListener('load', function(){
                        var data = {};
                        data[options.dataType] = xhr.response;
                        // make callback and send data
                        callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                    });

                    xhr.open(type, url, async, username, password);

                    // setup custom headers
                    for (var i in headers ) {
                        xhr.setRequestHeader(i, headers[i] );
                    }

                    xhr.responseType = dataType;
                    xhr.send(data);
                },
                abort: function(){
                    jqXHR.abort();
                }
            };
        }
    });

    var ViewBase = Class.extend({
        init: function(data) {
            this._data = data;
            this._focused = false;
            this._element = null;
        },

        data: function() {
            return this._data;
        },

        focused: function(value) {
            if (value !== undefined)
                this._focused = value;
            return this._focused;
        },

        render: function(map, group) {
            this._map = map;
            this._parentGroup = group;
        },

        remove: function() {

        },

        element: function() {
            return this._element;
        },

        group: function() {
            return this._group;
        },
        /**
         * must overwrite in child class
         * @param data
         */
        setProperty: function(data) {

        },

        getCenter: function() {
            return {
                left: this._data.x(),
                top: this._data.y()
            };
        }
    });
    SchemeDesigner.ViewBase = ViewBase;

    $.widget( "custom.mapView", {
        options: {
            designMode: true,
            css: null
        },
        _create: function() {
            this._data = {};
            this._data.uniqueName = "main_data";
            this._data.services = [];
            this._data.equipments = [];
            this._data.scheme = new SchemeDesigner.SchemeViewObject({views:[]}, this);
            this._data.natures = {};
	        this._viewControls = {};
	        this._entriesGroup = {};
	        this._polyGroup = {};
	        this._graphicGroup = {};
	        this._sectorsGroup = {};
            this._zoom = 8;
            this._isSaved = true;
            this._savedPoint = null;
            var that = this;

            var el = $('<div id="map-scheme" class="scheme-container"> '+
                '<div class="tool-box"/>'+
                '<div class="right-content">'+
                '<div class="primitives-palette"/>'+
                '<div class="main-content" tabIndex="-1"><div class="scrolled-content">' +
                '</div></div>'+
                '</div>'+
                '</div>');
            this.element.empty();
            this.element.append(el);
            this._root = this.element.children();
            this._paletteEl = this._root.children(".tool-box").schemePalette({
                startDrag: function(event, data) { return that._paletteStartDrag(event, data);  },
                onCanDrag: function(event, data) { return that._paletteCanDrag(event, data);  },
                stopDrag: function(event, data) { return that._paletteDropItem(event, data);  }
            });
            this._mainViewEl = this._root.find(".main-content");
            this._primitivesPaletteEl = this._root.find(".primitives-palette").schemePrimitivePalette({
                palettePropChanged: function(e, data) {
                    var curView = that._data.scheme.cursor();
                    if (data.property == "show-sector") {
                        that.setVisibleGroup(that, data.value, SchemeDesigner.PolygonView);
	                    that.setVisibleGroup(that, data.value, SchemeDesigner.SectorView);
//                        that._polyGroup.attr({display: data.value ? "" : "none"});
//                        that._sectorsGroup.attr({display: data.value ? "" : "none"});
                    } else if (data.property == "show-graphic") {
                        that.setVisibleGroup(that, data.value, SchemeDesigner.LineView);
//                        that._graphicGroup.attr({display: data.value ? "" : "none"});
                    } else if (data.property == "show-equipments") {
	                    that.setVisibleGroup(that, data.value, SchemeDesigner.EquipmentView);
                    } else if (data.property == "zoom") {
	                    if (that._map && that._data){
		                    that._data.scheme._zoom = that._map.getZoom() + data.value;
		                    that._map.setZoom(that._data.scheme._zoom)
	                    }
                    } if (curView) {
                        curView.setProperty(data);
                        curView.render();
                    }
                },
                onDelete: function(event, data) {
                    var result = that._paletteDeleteItem(event, data);
                    return result;
                }
            });
            this.render();
            this.designMode(this.options.designMode)
        },

// MAP COMPATIBLE
        setVisibleGroup: function(scheme, value, objType){
            for (var controlId in scheme._viewControls) {
                var control = scheme._viewControls[controlId];
                if (control instanceof objType) {
                    control.setVisible(value);
                }
            }
        },
// MAP COMPATIBLE
        _getEquipment: function(id) {
            var result = null;
            for (var i = 0, len = this._data.equipments.length; i < len; i++) {
                if (this._data.equipments[i].id() == id) {
                    result = this._data.equipments[i];
                    break;
                }
            }
            return result;
        },
// MAP COMPATIBLE
        _getSector: function(id) {
            var services = this._data.services;
            for (var i = 0, len = services.length; i < len; i++) {
                var sector = services[i].getSector(id);
                if (sector) return sector;
            }
            return null;
        },

// MAP COMPATIBLE
        _getViewByDataId: function(id) {
            var viewsData = this._data.scheme.views();
            for (var i = 0, len = viewsData.length; i < len; i++) {
                var view = viewsData[i];
                if (view.data() && view.data().id() == id)
                    return this._viewControls[view.id()];
            }
            return null;
        },

        render: function() {
            var that = this;
            if (!this._map) {
                if (!this._data.scheme._center) this._data.scheme._center = {lat: 47, lng: 3};
                if (!this._data.scheme._zoom) this._data.scheme._zoom = 7;
                this._map = new google.maps.Map(this._mainViewEl[0], {
                    center: this._data.scheme._center,
                    zoom: this._data.scheme._zoom,
                    streetViewControl: false,
                    fullscreenControl: false
                });
                this._map.addListener('click',function(event) { that._click.call(that, event)});
                this._map.addListener('center_changed',function(event){ that._data.scheme._center = this.getCenter();} );
                this._map.addListener('zoom_changed',function(event){
	                that._data.scheme._zoom = this.getZoom();
	                for (var controlId in that._viewControls) {
		                var control = that._viewControls[controlId];
		                if ((control instanceof SchemeDesigner.TitleView) ||
			                (control instanceof SchemeDesigner.SectorView) ||
			                (control instanceof SchemeDesigner.EquipmentView)){
			                control.ajustContainer();
			                control.resetDraggable();
		                } else if (control instanceof SchemeDesigner.LineView) {
			                if (control._data._equipment1 && (control._data._equipment1 instanceof SchemeDesigner.EquipmentView)) control.checkEquipmentMove(control._data._equipment1);
			                if (control._data._equipment2 && (control._data._equipment2 instanceof SchemeDesigner.EquipmentView)) control.checkEquipmentMove(control._data._equipment2);
		                }
	                }
	                //google.maps.event.trigger(that._map,'dragend');
                } );
            }
            if (this._data.scheme) {
                var viewsData = this._data.scheme.views();

                for (var i = 0, len = viewsData.length; i < len; i++) {
                    var view = viewsData[i];
                    var control = this._addView(view);
                    control.render(this._map, this._getRenderGroup(control));
                };

	            for (var controlId in this._viewControls) {
		            var control = this._viewControls[controlId];
		            if (control instanceof SchemeDesigner.PolygonView){
			            if (control._data._sector && !(control._data._sector instanceof SchemeDesigner.SectorView)) {
				            control._data._sector = this._viewControls[control._data._sector];
			            }
		            } else if (control instanceof SchemeDesigner.LineView){
			            if (control._data._equipment1 && !(control._data._equipment1 instanceof SchemeDesigner.EquipmentView)) {
				            control._data._equipment1 = this._viewControls[control._data._equipment1];
				            control.checkEquipmentMove(control._data._equipment1);
			            };
			            if (control._data._equipment2 && !(control._data._equipment2 instanceof SchemeDesigner.EquipmentView)) {
				            control._data._equipment2 = this._viewControls[control._data._equipment2];
				            control.checkEquipmentMove(control._data._equipment2);
			            };
		            }
	            }
            }
            this._setPaletteMode(this._data.scheme ? this._data.scheme.cursor() : null);
        },

        _click: function(event) {
            var mode = this._primitivesPaletteEl.schemePrimitivePalette("mode");
            var data = null;
            this._primitivesPaletteEl.schemePrimitivePalette("propMode", "none");
            //this._viewClicked(null);

            if (mode == "pointer") return;
            if (mode == "polygon") {
                var tmp = SchemeDesigner.getEmptyPolygon(this._map, event);
	            tmp.id = this._guid();
	            data = new SchemeDesigner.PolygonViewObject(tmp, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {"show-sector": true}, this);
                //this._polyGroup.attr({display: data.value ? "" : ""});
                //this._sectorsGroup.attr({display: data.value ? "" : ""});
            } else if (mode == "line") {
	            var tmp = SchemeDesigner.getEmptyLine(this._map, event);
	            tmp.id = this._guid();
	            data = new SchemeDesigner.LineViewObject(tmp, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {"show-graphic": true }, this);
                //this._graphicGroup.attr({display: data.value ? "" : ""});
            } else if (mode == "text") {
                var tmp = SchemeDesigner.getEmptyTitle(this._map, event);
                tmp.id = this._guid();
                data = new SchemeDesigner.TitleViewObject(tmp, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {"show-graphic": true},this);
                //this._graphicGroup.attr({display: data.value ? "" : ""});
            } else {
                throw "Adding this type not supported";
            }
            this._primitivesPaletteEl.schemePrimitivePalette("mode", "pointer");
            this._data.scheme.views().push(data);
            var control = this._addView(data);
            this._isSaved = false;
            control.render(this._map, this._getRenderGroup(control));
        },

        _addView: function(viewData) {
            var vId = viewData.id();
            if (!(vId in this._viewControls)) {
                var vClass = viewData.className;
                if (!(vClass in SchemeDesigner))
                    throw "View for type '" + vClass + "' not found.";

                var control = new SchemeDesigner[vClass](viewData);
                this._viewControls[vId] = control;
                return control;
            } else
                return this._viewControls[vId];
        },

	    _paletteStartDrag: function(event, data) {

	    },

        _paletteCanDrag: function(event, data) {
            if (!this._data || !this._data.scheme) return false;
            if (!(data instanceof SchemeDesigner.EquipmentObject) &&
                !(data instanceof SchemeDesigner.SectorObject)) return false;
            return !(this._presentOnScheme(data));
        },

        _presentOnScheme: function(data) {
            if (!(data instanceof SchemeDesigner.EquipmentObject) &&
                !(data instanceof SchemeDesigner.SectorObject)) return false;
            var id = data.id();
            var views = this._data.scheme.views();
            for (var i = 0, len = views.length; i < len; i++) {
                var v = views[i];
                var d = v.data();
                if (d && d.id() == id) return true;
            }
            return false;
        },

	    _findPolygonAtPoint: function(event){
		    var mapLatLng = ("latLng" in event)? event.latLng: SchemeDesigner.fromPixelToLatLng(this._map, event.x, event.y);
		    for (var controlId in this._viewControls) {
			    var control = this._viewControls[controlId];
			    if ((control instanceof SchemeDesigner.PolygonView)&&(control._googleMapObj)){
				    if (google.maps.geometry.poly.containsLocation(mapLatLng, control._googleMapObj))
				        return control;
			    }
		    }
		    return null;
	    },

	    _findEquipmentAtPoint: function(point){
		    for (var controlId in this._viewControls) {
			    var control = this._viewControls[controlId];
			    if ((control instanceof SchemeDesigner.EquipmentView)&&(control.pointBelongsToEquipment(point))){
				    return control;
			    }
		    }
		    return null;
	    },

	    equipmentMoves: function(equipment){
		    for (var controlId in this._viewControls) {
			    var control = this._viewControls[controlId];
			    if (control instanceof SchemeDesigner.LineView){
				    control.checkEquipmentMove(equipment);
			    }
		    }
	    },
// !!!NOT YET MAP COMPATIBLE
        _paletteDropItem: function(event, data) {
            var view = null;
            var initData = {
                id: this._guid(),
                x: data.x,
                y: data.y,
                width: 216,
                height: 129,
                stroke: "#cbcbcb",
                background: "#ffffff"
            };

            var isSector = false;
            if (data.data instanceof SchemeDesigner.EquipmentObject) {
                initData.equipment = data.data.id();
                var imgUrl = "img/testIcon.png";
                if (data.data.nature() && this._data.natures[data.data.nature()])
                    imgUrl = this._data.natures[data.data.nature()];
                initData.icon = {
	                id: this._guid(),
                    width: null,
                    height: null,
                    x: -25,
                    y: -25,
                    url: imgUrl
                };
                initData.title = {
                    x: -25,
                    y: -41,
                    id: this._guid()
                };
                view = new SchemeDesigner.EquipmentViewObject(initData, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {"show-equipments": true});
            } else {
                isSector = true;
                initData.sector = data.data.id();
                initData.title = {
                    x: 0,
                    y: -25,
                    id: this._guid()
                };
                view = new SchemeDesigner.SectorViewObject(initData, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {"show-sector": true});
            }
            this._data.scheme.views().push(view);
            var control = this._addView(view);
            control.render(this._map, this._getRenderGroup(control));
            this._disableUsedNodes();

            if (isSector){
	            var polygon = this._findPolygonAtPoint(data);
	            if (polygon)
		            polygon.data().sector(control);
            };
            this._isSaved = false;
        },

        _paletteDeleteItem: function() {
            var curV = this._data.scheme.cursor();
            if (curV) {
                if (curV._parent) curV = curV._parent;
                var v = curV.remove();
                if (v) {
                    var vId = v.data().id();
                    if (this._viewControls[vId])
                        delete this._viewControls[vId];
                    var views = this._data.scheme.views();
                    for (var i = 0, len = views.length; i < len; i++) {
                        if (views[i] && views[i].id() == vId) {
                            views.splice(i, 1);
                            break;
                        }
                    }
                }

                this._disableUsedNodes();
                this._data.scheme.cursor(null);
                this._setPaletteMode(null);
                this._isSaved = false;
            }
        },

        _disableUsedNodes: function() {
            var views = this._data.scheme.views();
            var used = [];
            for (var i = 0, len = views.length; i < len; i++) {
                if ((views[i] instanceof SchemeDesigner.EquipmentViewObject) ||
                    (views[i] instanceof SchemeDesigner.SectorViewObject))
                    used.push(views[i].data());
            }
            this._paletteEl.schemePalette("disableUsedNodes", used);
        },

        _guid: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        },

        _setPaletteMode: function(view) {
            if (view instanceof SchemeDesigner.PolygonView) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "figure");
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "fill-color": view.data().fillColor() ? view.data().fillColor().substr(1) : "",
                    "border-color": view.data().strokeColor() ? view.data().strokeColor().substr(1) : ""
                });
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else if (view instanceof SchemeDesigner.LineView) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "line");
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
	                "fill-color": view.data().strokeColor() ? view.data().strokeColor().substr(1) : "",
                    "line-width": view.data().strokeWeight() ? view.data().strokeWeight() : 4
                });
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else if (view instanceof SchemeDesigner.EntryTitleView) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "text");
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "font-family":  view.data().fontFamily(),
                    "text-size":  view.data().fontSize(),
                    "text-color":  view.data().color() ? view.data().color().substr(1) : "",
                    "text-bold":  view.data().bold(),
                    "text-italic":  view.data().italic(),
                    "text-underline": view.data().underline()
                });
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else if (view instanceof SchemeDesigner.TitleView) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "text-edit");
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "text":  view.data().text(),
                    "font-family":  view.data().fontFamily(),
                    "text-size":  view.data().fontSize(),
                    "text-color":  view.data().color() ? view.data().color().substr(1) : "",
                    "text-bold":  view.data().bold(),
                    "text-italic":  view.data().italic(),
                    "text-underline": view.data().underline()
                });
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else if ((view instanceof SchemeDesigner.EquipmentView) ||
                (view instanceof SchemeDesigner.SectorView)) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "figure");
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "fill-color":  view.data().background() ? view.data().background().substr(1) : "",
                    "border-color": view.data().stroke() ? view.data().stroke().substr(1) : ""
                });
                if (view instanceof SchemeDesigner.EquipmentView)
                    this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
                else
                    this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else if (view instanceof SchemeDesigner.EntryIconView) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "none");
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else if (view instanceof SchemeDesigner.EntryDataView) {
	            this._primitivesPaletteEl.schemePrimitivePalette("propMode", "figure");
	            this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
		            "fill-color":  view.data().background() ? view.data().background().substr(1) : "",
		            "border-color": view.data().stroke() ? view.data().stroke().substr(1) : ""
	            });
	            this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else {
		            this._primitivesPaletteEl.schemePrimitivePalette("propMode", "none");
		            this._primitivesPaletteEl.schemePrimitivePalette("canDelete", false);
            }

//            if (this._data.scheme) {
//                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
//                    "back-color":  this._data.scheme.background() ? this._data.scheme.background().substr(1) : "",
//                    "background-url": this._data.scheme.backgroundImage() ? this._data.scheme.backgroundImage() : ""
//                });
//            }
        },
// MAP COMPATIBLE
	    _getRenderGroup: function(control) {
		    var grp = this._entriesGroup;
		    if (control instanceof SchemeDesigner.PolygonView)
			    grp = this._polyGroup;
		    else if (control instanceof SchemeDesigner.LineView || control instanceof SchemeDesigner.TitleView)
			    grp = this._graphicGroup;
		    else if (control instanceof SchemeDesigner.SectorView)
			    grp = this._sectorsGroup;
		    return grp;
	    },
// MAP COMPATIBLE
        _canDrag: function(view) {
            var mode = this._primitivesPaletteEl.schemePrimitivePalette("mode");
            return mode == "pointer";
        },
// MAP COMPATIBLE
        _viewClicked: function(view, e) {
            this._mainViewEl.focus();
            var mode = this._primitivesPaletteEl.schemePrimitivePalette("mode");
            if (view && mode != "pointer") {
                this._click(e);
                return;
            }
            var curV = this._data.scheme.cursor();
            if (curV != view) {
                this._data.scheme.cursor(view);
                if (curV) {
                    curV.focused(false);
                    curV.render(this._map, this._getRenderGroup(curV));
                }

                if (view) {
                    view.focused(true);
                    view.render(this._map, this._getRenderGroup(view));
                }
            }

	        this._setPaletteMode(view);

            if (view) {
                this._trigger("onClick", e, {
                    type: view.data().className,
                    data: view.data(),
                    element: view.group(),
                    map: this._map
                });
            }
        },
// MAP COMPATIBLE
        _viewRendered: function(view) {
            if (view) {
                this._trigger("onRender", null, {
                    type: view.data().className,
                    data: view.data(),
                    element: view.group(),
                    map: this._map
                });
            }
        },
// MAP COMPATIBLE
        _viewMoved: function(view) {
            this._isSaved = false;
        },
// MAP COMPATIBLE
        _bindSectorToPolygon: function(polygonId, sector) {
            var polygon = this._viewControls[polygonId];
            this._unbindSectorFromPolygon(sector);
            polygon.data().sector(sector);
            this._isSaved = false;
        },
// MAP COMPATIBLE
        _unbindSectorFromPolygon: function(sector) {
            for (var controlId in this._viewControls) {
                var control = this._viewControls[controlId];
                if (control instanceof SchemeDesigner.PolygonView) {
                    if (control.data().sector() == sector) {
                        control.data().sector(null);
                        this._isSaved = false;
                        break;
                    }
                }
            }
        },
// !!!NOT YET MAP COMPATIBLE
        _setOption: function( key, value ) {
            if ( key === "designMode" ) {
                if (value) {
                    this._primitivesPaletteEl.show();
                    this._paletteEl.show();
                } else {
                    this._primitivesPaletteEl.hide();
                    this._paletteEl.hide();
                }
                this._primitivesPaletteEl.schemePrimitivePalette("mode", "pointer");

	            if (value !== undefined) {
		            for (var controlId in this._viewControls) {
			            var control = this._viewControls[controlId];
			            if (control) control.setDesignMode(value);
		            }
	            }
            }
            this._super( key, value );
        },
// MAP COMPATIBLE
        _getNatures: function() {
            return this._data.natures;
        },

        loadData: function(data) {
            this._data.services = [];
            this._data.equipments = [];
            this._data.natures = {};
            this._data.scheme = new SchemeDesigner.SchemeViewObject({views:[]}, this);
            this._map = null;
            this._backGroup = null;
            this._polyGroup = null;
            this._graphicGroup = null;
            this._entriesGroup = null;
            this._sectorsGroup = null;
            this._viewControls = {};

            if (!data) return;

            if (data.data) {
                if (data.data.natures)
                    this._data.natures = data.data.natures;
                if (data.data.equipments) {
                    var eq = data.data.equipments;
                    for (var i = 0, len = eq.length; i < len; i++) {
                        var equipment = new SchemeDesigner.EquipmentObject(eq[i], this);
                        this._data.equipments.push(equipment);
                    }
                }
                if (data.data.services) {
                    var sr = data.data.services;
                    for (var i = 0, len = sr.length; i < len; i++) {
                        var service = new SchemeDesigner.ServiceObject(sr[i], this);
                        this._data.services.push(service);
                    }
                }
            }
            this._paletteEl.schemePalette("loadData", this._data, true);

            this.loadScheme(data);

//
//	        for (var controlId in this._viewControls) {
//		        var control = this._viewControls[controlId];
//		        if (control instanceof SchemeDesigner.PolygonView) {
//			        if (control.data().sector()) {
//				        control.data().sector(this._viewControls[control.data().sector()]);
//				        this._isSaved = false;
//				        break;
//			        }
//		        } else if (control instanceof SchemeDesigner.LineView) {
//			        if (control.data().equipment1()) {
//				        control.data().sector(this._viewControls[control.data().sector()]);
//				        this._isSaved = false;
//				        break;
//			        }
//		        }
//	        }

        },

        loadScheme: function(data) {
            if (data && data.data && data.data.scheme) {
                this._viewControls = {};
                this._data.scheme = new SchemeDesigner.SchemeViewObject(data.data.scheme, this);
            }
            this._disableUsedNodes();
            this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                "zoom":  8,
                "show-sector": true,
                "show-graphic": true,
                "show-equipments": true
            });
        },

// MAP COMPATIBLE
        getJSON: function(withEquipments) {
            withEquipments = withEquipments === undefined ? true : withEquipments;
            var res = {data: {}}
            var schemeData = this._data.scheme;
            if (withEquipments) {
                res.data.services = [];
                for (var i = 0, len = this._data.services.length; i < len; i++)
                    res.data.services.push(this._data.services[i].getJSON());
                res.data.equipments = [];
                for (var i = 0, len = this._data.equipments.length; i < len; i++)
                    res.data.equipments.push(this._data.equipments[i].getJSON());
            }
            res.data.scheme = schemeData.getJSON();
            var that = this;
            var evRes = this._trigger("onSave", null, {
                JSON: res,
                callback: function(success) {
                    that._isSaved = success;
                }});
            if (evRes)
                that._isSaved = true;
            return res;
        },
// MAP COMPATIBLE
        setEquipmentData: function(id, data) {
            var equipment = this._getEquipment(id);
            if (equipment) {
                equipment.data(data);
                var control = this._getViewByDataId(id);
                if (control) control.render(this._map, this._getRenderGroup(control));
                return true;
            }
            return false;
        },
// MAP COMPATIBLE
        setSectorData: function(id, data) {
            var sector = this._getSector(id);
            if (sector) {
                sector.data(data);
                var control = this._getViewByDataId(id);
                if (control) control.render(this._map, this._getRenderGroup(control));
                return true;
            }
            return false;
        },
// MAP COMPATIBLE
        isSaved: function() {
            return this._isSaved;
        },
// MAP COMPATIBLE
        designMode: function(on) {
            if (on !== undefined) this._setOption( "designMode", on );
            return this.options.designMode;
        },
// MAP COMPATIBLE
        setNatureIcons: function(data) {
            this._data.natures = data;
        }
    });
})(jQuery);
