/**
 * User: kiknadze
 * Date: 01.12.2015
 * Time: 11:56
 */
(function($){
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

// use this transport for "binary" data type
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

        render: function(snap, group) {
            this._snap = snap;
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

        handleKeyboard: function(e) {
            if (!this._data) return true;
            // keyCode == 37, 38, 39, 40
            var scale = this._data.scheme._getScale();
            var notHandled = true;

            if (e.keyCode == 37) {
                this._data.x(this._data.x() - 1/scale);
                notHandled = false;
            } else if (e.keyCode == 38) {
                this._data.y(this._data.y() - 1/scale);
                notHandled = false;
            } else if (e.keyCode == 39) {
                this._data.x(this._data.x() + 1/scale);
                notHandled = false;
            } else if (e.keyCode == 40) {
                this._data.y(this._data.y() + 1/scale);
                notHandled = false;
            }

            if (!notHandled) {
                this.render(this._snap, this._parentGroup);
                this._data.scheme._viewMoved(this);
            }
            return notHandled;
        },

        getCenter: function() {
            return {
                left: this._data.x(),
                top: this._data.y()
            };
        }
    });
    SchemeDesigner.ViewBase = ViewBase;



    $.widget( "custom.synopticView", {
        options: {
            designMode: true,
            css: null
        },
        _create: function() {
            this._data = {};
            this._data.services = [];
            this._data.equipments = [];
            this._curScale = 1;
            this._isSaved = true;
            this._savedPoint = null;
            var that = this;

            var el = $('<div id="synoptic-scheme" class="scheme-container"> '+
                '<div class="tool-box"/>'+
                '<div class="right-content">'+
                '<div class="primitives-palette"/>'+
                '<div class="main-content" tabIndex="-1"><div class="scrolled-content">' +
                '<svg><defs></defs></svg>'+
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
                    if (data.property == "back-color") {
                        that._data.scheme.background(data.value ? "#" + data.value : null);
                        that.render();
                    } if (data.property == "scale") {
                        that._scaleScheme(data.value);
                        /*that._snap.zoomTo(data.value / 100, 200,  mina.easein, function() {
                            that._snap.zpd("callback", function (o, data) {
                                that._setSize(data);
                            });
                        });*/
                    } if (data.property == "show-sector") {
                        that._polyGroup.attr({display: data.value ? "" : "none"});
                        that._sectorsGroup.attr({display: data.value ? "" : "none"});
                    } if (data.property == "show-graphic") {
                        that._graphicGroup.attr({display: data.value ? "" : "none"});
                    } if (data.property == "show-equipments") {
                        that._entriesGroup.attr({display: data.value ? "" : "none"});
                    } if (data.property == "background-url") {
                        that._data.scheme.backgroundImage(data.value);
                        that.render();
                        that._snap.zpd("callback", function (o, data) {
                            that._setSize(data);
                        });
                    } else if (curView) {
                        curView.setProperty(data);
                        curView.render(that._snap);
                    }
                },
                onDelete: function(event, data) {
                    var result = that._paletteDeleteItem(event, data);
                    that._snap.zpd("callback", function (o, data) {
                        that._setSize(data);
                    });
                    return result;
                }
            });
            this.render();
            this.designMode(this.options.designMode)
        },

        _scaleScheme: function(val) {
            if (this._scaleInProgress) return false;
            this._scaleInProgress = true;

            var that = this;
            var oldScale = that._curScale;
            var centerPoint = that._getScrollCenter();
            that._curScale = val / 100;

            that._snap.zpd("callback", function (o, data) {
                var zpdElement = data.element;
                Snap.animate(oldScale, that._curScale, function(value) {
                    zpdElement.node.setAttribute('transform',
                        'matrix(' + value + ',0,0,' + value + ',0,0)');
                    that._setSize(data);
                    var p = that._mainViewEl;
                    var width = p[0].clientWidth;
                    var height = p[0].clientHeight;
                    var scrollX = centerPoint.left*value - width/2;
                    var scrollY = centerPoint.top*value - height/2;
                    //that._mainViewEl.animate(
                    //    {scrollTop: scrollY, scrollLeft: scrollX},
                    //    { duration: 50, queue: false });
                    that._mainViewEl.scrollTop(scrollY);
                    that._mainViewEl.scrollLeft(scrollX);
                }, 100, mina.easein, function() {
                    that._scaleInProgress = false;

                    that._setSize(data);
                });
            });
            return true;
        },

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

        _getSector: function(id) {
            var services = this._data.services;
            for (var i = 0, len = services.length; i < len; i++) {
                var sector = services[i].getSector(id);
                if (sector) return sector;
            }

            return null;
        },

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
            if (this._data.scheme) {
                var viewsData = this._data.scheme.views();
                var init = false;
                if (this._snap == null) {
                    init = true;
                    this._snap = Snap(this._mainViewEl.find("svg")[0]);
                    if (this.options.css) {
                        var css = this._snap.el("style", {type: "text/css"});
                        css.toDefs();
                        $.ajax({
                            url: this.options.css,
                            dataType: "html",
                            success: function(result) {
                                css.node.innerHTML = result;
                            }
                        })
                    }
                    this._global = this._snap.group();

                    this._backGroup = this._snap.group();
                    this._polyGroup = this._snap.group();
                    this._graphicGroup = this._snap.group();
                    this._entriesGroup = this._snap.group();
                    this._sectorsGroup = this._snap.group();

                    this._global.add(
                        this._backGroup,
                        this._polyGroup,
                        this._graphicGroup,
                        this._sectorsGroup,
                        this._entriesGroup
                    );

                    this._zpd = this._snap.zpd({
                        drag: false,
                        pan: false,
                        onScaleChange: function(oldCTM, k, newCTM, bBox, clientBounds) {
                            if (newCTM.a < 0.2) {
                                newCTM.a = 0.2;
                                newCTM.d = 0.2;
                            } else if (newCTM.a > 5) {
                                newCTM.a = 5;
                                newCTM.d = 5;
                            }
                            if (that._scaleScheme(newCTM.a * 100))
                                that._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                                    "scale":  Math.floor(that._curScale * 100)
                                });

                            return null;
                        },
                        afterScaleChange: function(oldCTM, k, newCTM, bBox, clientBounds) {
                            return null;
                        }
                    }, function() {
                    });

                    this._backGroup.attr({role: "background"});
                    this._polyGroup.attr({role: "polygon"});
                    this._graphicGroup.attr({role: "graphic"});
                    this._entriesGroup.attr({role: "entries"});
                    this._sectorsGroup.attr({role: "sectors"});

                    var p = that._mainViewEl;
                    this._snap.attr({
                        width: p.width() + "px",
                        height: p.height() + "px"
                    });

                    this._mainViewEl.find(".scrolled-content").draggable({
                        drag: function(event, ui) {
                            that._mainViewEl.scrollTop(that._mainViewEl.scrollTop() - ui.position.top);
                            that._mainViewEl.scrollLeft(that._mainViewEl.scrollLeft() - ui.position.left);

                            ui.position.left = 0;
                            ui.position.top = 0;
                        }
                    });

                    this._setBackgroundImage(function(img) {
                        that._backgroundImage = that._snap.image(
                            img,
                            0,
                            0,
                            null,
                            null,
                            null
                        );

                        that._backgroundImage.__url__ = that._data.scheme.backgroundImage();
                        that._backGroup.add(that._backgroundImage);
                        that._snap.zpd("callback", function (o, data) {
                            that._setSize(data);
                        });
                    });

                    this._background = this._snap.rect(
                        0,
                        0,
                        //p.width(),
                        //p.height()
                        0,
                        0
                    );
                    this._backGroup.add(this._background);

                    $(window).resize(function () {
                        that._snap.zpd("callback", function (o, data) {
                            that._setSize(data);
                        });
                    });

                    this._mainViewEl.bind("keydown", function(e) {
                        if (!that._data.scheme.cursor()) return true;
                        return that._data.scheme.cursor().handleKeyboard(e);
                    });

                } else {
                    if (this._backgroundImage && this._backgroundImage.__url__ != this._data.scheme.backgroundImage()) {
                        this._setBackgroundImage(function(img) {
                            that._backgroundImage.remove();
                            that._backgroundImage = that._snap.image(

                                img,
                                0,
                                0,
                                null,
                                null,
                                null
                            );
                            that._backgroundImage.__url__ = that._data.scheme.backgroundImage();
                            that._backGroup.add(that._backgroundImage);
                            that._snap.zpd("callback", function (o, data) {
                                that._setSize(data);
                            });
                        });
                    }
                }

                this._background.attr("fill", this._data.scheme.background() || "transparent");

                for (var i = 0, len = viewsData.length; i < len; i++) {
                    var view = viewsData[i];
                    var control = this._addView(view)
                    control.render(this._snap, this._getRenderGroup(control));
                };

                if (init) {
                    that._snap.zpd("callback", function (o, data) {
                        that._setSize(data);
                    });
                }

                this._snap.click(function (event) {
                    that._onSVGClick(event);
                });
                this._snap.dblclick(function (event) {
                    that._savedPoint = {
                        left: event.offsetX/that._curScale,
                        top: event.offsetY/that._curScale
                    };
                });
            }
            this._setPaletteMode(this._data.scheme ? this._data.scheme.cursor() : null);
        },

        _setBackgroundImage: function(callback) {
            if (this._data.scheme.backgroundImage()) {
                $.ajax({
                    url: this._data.scheme.backgroundImage(),
                    type: "GET",
                    dataType: "binary",
                    processData: false,
                    success: function(blob) {

                        var reader = new window.FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = function() {
                            var base64data = reader.result;
                            callback(base64data);
                        }
                    }
                }).fail(function() {
                    callback(null);
                });
            }
        },

        _getScrollCenter: function() {
            var curV = this._data.scheme.cursor();
            if (curV)
                return curV.getCenter();
            else if (this._savedPoint) {
                return this._savedPoint;
            }
            else {
                var p = this._mainViewEl;
                var width = p[0].clientWidth;
                var height = p[0].clientHeight;

                return {
                    left: (p.scrollLeft() + width / 2) / this._curScale,
                    top: (p.scrollTop() + height / 2) / this._curScale
                }
            }
        },

        _setSize: function(data) {
            var that = this;
            var p = that._mainViewEl;

            that._background.attr({
                width: 0,
                height: 0
            });
            var bb = data.element.getBBox();

            var width = Math.max(p[0].clientWidth, bb.width)
            var height = Math.max(p[0].clientHeight, bb.height);

            //that._backgroundImage.attr({
            //    width: width,
            //    height: height
            //});
            that._background.attr({
                width: width,
                height: height
            });

            that._snap.attr({
                width: width,
                height: height
            });
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

        _paletteDropItem: function(event, data) {

            var view = null;
            var initData = {
                id: this._guid(),
                x: data.x/this._curScale,
                y: data.y/this._curScale,
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
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "show-equipments": true
                });
                this._entriesGroup.attr({display: data.value ? "" : ""});
            } else {
                isSector = true;
                initData.sector = data.data.id();
                initData.title = {
                    x: 0,
                    y: -5,
                    id: this._guid()
                };
                view = new SchemeDesigner.SectorViewObject(initData, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "show-sector": true
                });
                this._polyGroup.attr({display: data.value ? "" : ""});
                this._sectorsGroup.attr({display: data.value ? "" : ""});
            }

            this._data.scheme.views().push(view);
            var control = this._addView(view);

            control.render(this._snap, this._getRenderGroup(control));
            this._disableUsedNodes();

            if (isSector && data.originalEvent.target.nodeName == "polygon") {
                var polygonId = data.originalEvent.target.id;
                var polygon = this._viewControls[polygonId];
                polygon.data().sector(view.data());
            }
            this._isSaved = false;
        },

        _paletteDeleteItem: function() {
            var curV = this._data.scheme.cursor();
            if (curV) {
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

        _onSVGClick: function(event) {
            var mode = this._primitivesPaletteEl.schemePrimitivePalette("mode");
            var data = null;
            this._primitivesPaletteEl.schemePrimitivePalette("propMode", "none");
            this._viewClicked(null);

            if (mode == "pointer") return;
            if (mode == "polygon") {
                data = new SchemeDesigner.PolygonViewObject({
                    id: this._guid(),
                    x: event.offsetX/this._curScale, y: event.offsetY/this._curScale,
                    background: "#00ff00",
                    stroke: "#00cb00",
                    points: [
                        0, 0,
                        50, 0,
                        80, 20,
                        60, 70,
                        0, 70
                    ]
                }, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "show-sector": true
                });
                this._polyGroup.attr({display: data.value ? "" : ""});
                this._sectorsGroup.attr({display: data.value ? "" : ""});
            } else if (mode == "line") {
                data = new SchemeDesigner.LineViewObject({
                    id: this._guid(),
                    x: event.offsetX/this._curScale, y: event.offsetY/this._curScale,
                    background: "#00ff00",
                    stroke: "#00cb00",
                    width: 4,
                    points: [
                        0, 0,
                        50, 0
                    ]
                }, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "show-graphic": true
                });
                this._graphicGroup.attr({display: data.value ? "" : ""});
            } else if (mode == "text") {
                data = new SchemeDesigner.TitleViewObject({
                    id: this._guid(),
                    x: event.offsetX/this._curScale, y: event.offsetY/this._curScale,
                    color: "#000000",
                    fontFamily: "Times New Roman",
                    fontSize: "16",
                    text: "New text"
                }, this);
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "show-graphic": true
                });
                this._graphicGroup.attr({display: data.value ? "" : ""});
            } else {
                throw "Adding this type not supported";
            }
            this._primitivesPaletteEl.schemePrimitivePalette("mode", "pointer");
            this._data.scheme.views().push(data);
            var control = this._addView(data);
            this._isSaved = false;
            control.render(this._snap, this._getRenderGroup(control));
        },

        _setPaletteMode: function(view) {
            if (view instanceof SchemeDesigner.PolygonView) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "figure");
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "fill-color": view.data().background() ? view.data().background().substr(1) : "",
                    "border-color": view.data().stroke() ? view.data().stroke().substr(1) : ""
                });
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else if (view instanceof SchemeDesigner.LineView) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "line");
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "fill-color":  view.data().background() ? view.data().background().substr(1) : "",
                    "line-width": view.data().width() ? view.data().width() : 4
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
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", false);
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
                    this._primitivesPaletteEl.schemePrimitivePalette("canDelete", false);
                else
                    this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else if (view instanceof SchemeDesigner.EntryIconView) {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "none");
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", true);
            } else {
                this._primitivesPaletteEl.schemePrimitivePalette("propMode", "none");
                this._primitivesPaletteEl.schemePrimitivePalette("canDelete", false);
            }

            if (this._data.scheme) {
                this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                    "back-color":  this._data.scheme.background() ? this._data.scheme.background().substr(1) : "",
                    "background-url": this._data.scheme.backgroundImage() ? this._data.scheme.backgroundImage() : ""
                });
            }
        },

        _canDrag: function(view) {
            var mode = this._primitivesPaletteEl.schemePrimitivePalette("mode");
            return mode == "pointer";
        },

        _viewClicked: function(view, e) {
            this._mainViewEl.focus();
            var mode = this._primitivesPaletteEl.schemePrimitivePalette("mode");
            if (view && mode != "pointer") {
                this._onSVGClick(e);
                return;
            }
            var curV = this._data.scheme.cursor();
            if (curV != view) {
                this._data.scheme.cursor(view);
                if (curV) {
                    curV.focused(false);
                    curV.render(this._snap, this._getRenderGroup(curV));
                }

                if (view) {
                    view.focused(true);
                    view.render(this._snap, this._getRenderGroup(view));
                }

                this._setPaletteMode(view);
            }

            if (view) {
                this._trigger("onClick", e, {
                    type: view.data().className,
                    data: view.data(),
                    element: view.group(),
                    snap: this._snap
                });
            }
        },

        _viewRendered: function(view) {
            if (view) {
                this._trigger("onRender", null, {
                    type: view.data().className,
                    data: view.data(),
                    element: view.group(),
                    snap: this._snap
                });
            }
        },

        _viewMoved: function(view) {
            var that = this;
            that._snap.zpd("callback", function (o, data) {
                that._setSize(data);
            });
            this._isSaved = false;
        },

        _bindSectorToPolygon: function(polygonId, sector) {
            var polygon = this._viewControls[polygonId];

            this._unbindSectorFromPolygon(sector);
            polygon.data().sector(sector);
            this._isSaved = false;
        },

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

        _getScale: function () {
            return this._curScale;
        },

        _setOption: function( key, value ) {
            if ( key === "designMode" ) {
                if (value) {
                    this._primitivesPaletteEl.show();
                    this._paletteEl.show();
                } else {
                    this._primitivesPaletteEl.hide();
                    this._paletteEl.hide();
                }
                var that = this;
                if (this._snap)
                    this._snap.zpd("callback", function (o, data) {
                        that._setSize(data);
                    });

                this._primitivesPaletteEl.schemePrimitivePalette("mode", "pointer");
            }

            this._super( key, value );
        },

        _getNatures: function() {
            return this._data.natures;
        },

        loadData: function(data) {
            this._data.services = [];
            this._data.equipments = [];
            this._data.scheme = new SchemeDesigner.SchemeViewObject({views:[]}, this);
            this._data.natures = {};
            if (data.data.natures) this._data.natures = data.data.natures;

            if (this._snap) {
                this._snap.zpd("destroy");
                this._snap.clear();
                this._curScale = 1;
            }
            this._snap = null;
            this._backGroup = null;
            this._polyGroup = null;
            this._graphicGroup = null;
            this._entriesGroup = null;
            this._sectorsGroup = null;
            this._backgroundImage = null;
            this._background = null;
            this._viewControls = {};

            if (!data) return;

            if (data.data) {
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
        },

        loadScheme: function(data) {
            if (data && data.data.scheme) {
                this._viewControls = {};
                if (this._snap) {
                    this._snap.zpd("destroy");
                    this._snap.clear();
                    this._curScale = 1;
                }
                this._data.scheme = new SchemeDesigner.SchemeViewObject(data.data.scheme, this);
            }
            this._disableUsedNodes();
            this._primitivesPaletteEl.schemePrimitivePalette("setPropValues", {
                "scale":  100,
                "show-sector": true,
                "show-graphic": true,
                "show-equipments": true
            });
            var that = this;
        },

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

        setEquipmentData: function(id, data) {
            var equipment = this._getEquipment(id);
            if (equipment) {
                equipment.data(data);
                var control = this._getViewByDataId(id);
                if (control) control.render(this._snap, this._getRenderGroup(control));
                return true;
            }
            return false;
        },

        setSectorData: function(id, data) {
            var sector = this._getSector(id);
            if (sector) {
                sector.data(data);
                var control = this._getViewByDataId(id);
                if (control) control.render(this._snap, this._getRenderGroup(control));
                return true;
            }
            return false;
        },

        isSaved: function() {
            return this._isSaved;
        },

        designMode: function(on) {
            if (on !== undefined) this._setOption( "designMode", on );
            return this.options.designMode;
        },

        setNatureIcons: function(data) {
            this._data.natures = data;
        },

        savePNG: function(callback) {
            var that = this;
            this._mainViewEl.find(".invisible-rect").hide();
            this._mainViewEl.children()[0].toDataURL("image/png", {
                callback : function(data) {
                    that._mainViewEl.find(".invisible-rect").show();
                    // Convert image to 'octet-stream' (Just a download, really)
                    if (callback) {
                        callback(data);
                    } else {
                        var image = data.replace("image/png", "image/octet-stream");

                        var link = document.createElement('a');
                        link.download = "scheme.png";
                        link.href = image;
                        link.click();
                        //window.location.href = image;
                    }
                }
            });
        }
    });
})(jQuery);