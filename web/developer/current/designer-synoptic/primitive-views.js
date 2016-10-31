/**
 * Created by kiknadze on 11.12.2015.
 */
(function($) {
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

    var PolygonView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data);
            this._group = null;
            this._resizeData = null;
        },

        render: function (snap, grp) {
            this._super(snap, grp);
            var that = this;
            if (!this._group) {
                this._element = snap.polygon(this._data.points());
                this._element.node.addEventListener("contextmenu", function(e) {
                    e.preventDefault();
                }, false);
                this._element.attr({id: this._data.id()});
                this._group = snap.group(this._element);
                this._group.addClass("polygon");
                this._group.attr({
                    transform: "translate(" + this._data.x() + "," + this._data.y() + ")"
                });
                grp.add(this._group);

                this._initResize(snap);

                this._element.click(function(e) {
                    that._data.scheme._viewClicked(that, e);
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });

            } else {
                this._group.attr({
                    transform: "translate(" + this._data.x() + "," + this._data.y() + ")"
                });
            }

            this._element.attr({
                fill: this._data.background(),
                stroke: this._data.stroke()
            });

            if (this.focused())
                this._element.addClass("focused");
            else
                this._element.removeClass("focused");
            this._data.scheme._viewRendered(this);
        },

        _initResize: function(snap) {
            var that = this;
            this._element.mousemove(function(event) {
                if (!that._data.scheme.designMode()) return;
                if (!that._resizeData) {
                    that._resizeData = {
                        x: that._data.x(),
                        y: that._data.y(),
                        resizeStarted: false,
                        deltaX: 0,
                        deltaY: 0
                    };
                }

                if (that._data.sector() && that._resizeData.sectorX === undefined) {
                    var secId = that._data.sector().id();
                    var secView = that._data.scheme._getViewByDataId(secId);
                    that._resizeData.sectorX = secView.data().x();
                    that._resizeData.sectorY = secView.data().y();
                }


                if (!that._resizeData.resizeStarted)
                    that._setResizeMode(event);
                that._renderMiddles(snap, false);
            }).mouseout(function (event) {
                if (that._resizeData && !that._resizeData.resizeStarted)
                    that._resizeData = null;
                that._element.attr({cursor: "default"});
                that._renderMiddles(snap, true);
            }).drag(function (deltaX, deltaY, x, y, event) {
                if (!that._resizeData) return;
                that._resizeData.resizeStarted = true;
                that._resizeData.offsetX = event.offsetX;
                that._resizeData.offsetY = event.offsetY;
                that._handleResize(snap, deltaX, deltaY);
                that._renderMiddles(snap, false);
                that._data.scheme._viewMoved(that);
                event.stopPropagation();
                event.preventDefault();
                return false;
            }, function(x, y, event) {
                event.stopPropagation();
                event.preventDefault();
                if (!that._resizeData) return false;
                if (that._resizeData.mode == "addPoint") {
                    that._resizeData.offsetX = event.offsetX;
                    that._resizeData.offsetY = event.offsetY;
                    var ps = this._element.attr("points");

                    var leftPoint = { x: ps[that._resizeData.pointIdx], y: ps[that._resizeData.pointIdx+1]};
                    var rightPoint = null;
                    if (that._resizeData.pointIdx + 2 < ps.length)
                        rightPoint = {x: ps[that._resizeData.pointIdx+2], y: ps[that._resizeData.pointIdx+3]};
                    else
                        rightPoint = {x: ps[0], y: ps[1]};

                    var midP = this._getLineMid(leftPoint, rightPoint);
                    this._resizeData.startX = midP.x;
                    this._resizeData.startY = midP.y;
                    ps.splice(this._resizeData.pointIdx + 2, 0, midP.x);
                    ps.splice(this._resizeData.pointIdx + 3, 0, midP.y);
                    this._element.attr({"points": ps});
                    that._renderMiddles(snap, false);
                }
                that._data.scheme._viewMoved(that);
                return false;
            }, function (event) {
                event.stopPropagation();
                event.preventDefault();
                if (!(that._resizeData)) return false;
                if (event.ctrlKey) {
                    if (that._resizeData.mode == "point") {
                        var points = that._data.points();
                        points.splice(that._resizeData.pointIdx, 2);
                        that._element.attr({"points": points});
                        that._resizeData = null;
                        that._renderMiddles(snap, false);
                    }
                } else {
                    that._resizeData.offsetX = event.offsetX;
                    that._resizeData.offsetY = event.offsetY;
                    that._element.attr({cursor: "default"});
                    that._handleResize(snap, this._resizeData.deltaX, this._resizeData.deltaY, true);
                    that._resizeData = null;
                    //that._ignoreClick = true;
                    that._renderMiddles(snap, false);
                }
                that._data.scheme._viewMoved(that);
                return false;
            }, this)/*.click(function () {
                if (that._ignoreClick) {
                    that._ignoreClick = false;
                    return;
                }
                if (that._resizeData.mode == "point" && event.ctrlKey) {
                    var points = that._data.points();
                    points.splice(that._resizeData.pointIdx, 2);
                    that._element.attr({"points": points});
                    that._resizeData = null;
                    that._renderMiddles(snap, false);
                }
            })*/;
        },

        _getLineMid: function(leftPoint, rightPoint) {
            var dimX = Math.abs(leftPoint.x - rightPoint.x)/2;
            var dimY = Math.abs(leftPoint.y - rightPoint.y)/2;
            var midX = Math.min(leftPoint.x, rightPoint.x) + dimX;
            var midY = Math.min(leftPoint.y, rightPoint.y) + dimY;
            return {x: midX, y: midY};
        },

        _setResizeMode: function(event) {
            var that = this;
            var scale = this._data.scheme._getScale();

            var points = that._data.points();
            that._resizeData.mode = "move";


            that._element.attr({cursor: "default"});
            for (var i = 0; i < points.length; i = i + 2) {
                var leftPoint = { x: points[i], y: points[i+1]};
                var rightPoint = null;
                if (i + 2 < points.length)
                    rightPoint = {x: points[i+2], y: points[i+3]};
                else
                    rightPoint = {x: points[0], y: points[1]};

                var midP = that._getLineMid(leftPoint, rightPoint);
                if ((Math.abs(event.offsetX - (that._resizeData.x + midP.x)*scale) <= 5) &&
                    (Math.abs(event.offsetY - (that._resizeData.y + midP.y)*scale) <= 5)) {
                    that._element.attr({cursor: "crosshair"});
                    that._resizeData.mode = "addPoint";
                    that._resizeData.pointIdx = i;
                }
            }

            if (that._resizeData.mode == "move") {
                for (var i = 0; i < points.length; i = i + 2) {
                    if ((Math.abs(event.offsetX - (that._resizeData.x + (+points[i]))*scale) <= 5) &&
                        (Math.abs(event.offsetY - (that._resizeData.y + (+points[i+1]))*scale) <= 5)) {
                        that._element.attr({cursor: "crosshair"});
                        that._resizeData.mode = "point";
                        that._resizeData.pointIdx = i;
                        break;
                    }
                }
            }

            if (that._resizeData.mode == "move") {
                for (var i = 0; i < points.length; i = i + 2) {
                    var leftPoint = { x: points[i], y: points[i+1]};
                    var rightPoint = null;
                    if (i + 2 < points.length)
                        rightPoint = {x: points[i+2], y: points[i+3]};
                    else
                        rightPoint = {x: points[0], y: points[1]};
                    var coefs = this._getBKCoefs(leftPoint.x, leftPoint.y, rightPoint.x, rightPoint.y);
                    var mouseX = (event.offsetX/scale - that._resizeData.x);
                    var mouseY = (event.offsetY/scale - that._resizeData.y);

                    var a = Math.sqrt((leftPoint.x-mouseX)*(leftPoint.x-mouseX)+(leftPoint.y-mouseY)*(leftPoint.y-mouseY));
                    var b = Math.sqrt((rightPoint.x-mouseX)*(rightPoint.x-mouseX)+(rightPoint.y-mouseY)*(rightPoint.y-mouseY));
                    var c = Math.sqrt((leftPoint.x-rightPoint.x)*(leftPoint.x-rightPoint.x)+(leftPoint.y-rightPoint.y)*(leftPoint.y-rightPoint.y));
                    //var sin = Math.sqrt(1-(((a*a+b*b-c*c)/(a*b))*((a*a+b*b-c*c)/(a*b))));
                    var p = (a+b+c)/2

                    var d=2*Math.sqrt(p*(p-a)*(p-b)*(p-c))/c;
                    if (Math.abs(d) <= 5) {

                        if (mouseX >= Math.min(leftPoint.x, rightPoint.x)
                            && mouseX <=  Math.max(leftPoint.x, rightPoint.x)
                            && mouseY >= Math.min(leftPoint.y, rightPoint.y)
                            && mouseY <=  Math.max(leftPoint.y, rightPoint.y)) {
                            that._element.attr({cursor: "pointer"});
                            that._resizeData.mode = "line";
                            that._resizeData.pointIdx = i;
                            break;
                        }
                    }
                }
            }
        },

        _handleResize: function(snap, deltaX, deltaY, saveData) {
            var mode = this._resizeData.mode;
            if (!this._data.scheme._canDrag()) return;
            var scale = this._data.scheme._getScale();
            if (!saveData) {
                deltaX = deltaX / scale;
                deltaY = deltaY / scale;
            }

            this._resizeData.deltaX = deltaX;
            this._resizeData.deltaY = deltaY;
            var points = this._data.points();

            if (mode == "addPoint") {
                var ps = this._element.attr("points");
                ps[this._resizeData.pointIdx+2] = this._resizeData.startX + deltaX;
                ps[this._resizeData.pointIdx + 3] = this._resizeData.startY + deltaY;
                this._element.attr({"points": ps});
                if (saveData) {
                    points.splice(0, points.length);
                    for (var i=0; i < ps.length; i++)
                        points.push(+ps[i]);
                }
            } else if (mode == "point") {
                var ps = this._element.attr("points");
                ps[this._resizeData.pointIdx] = points[this._resizeData.pointIdx] + deltaX;
                ps[this._resizeData.pointIdx + 1] = points[this._resizeData.pointIdx + 1] + deltaY;
                this._element.attr("points", ps);
                if (saveData) {
                    points[this._resizeData.pointIdx] = points[this._resizeData.pointIdx] + deltaX;
                    points[this._resizeData.pointIdx + 1] = points[this._resizeData.pointIdx + 1] + deltaY;
                }
            } else if (mode == "move") {
                this._group.attr({
                    transform: "translate(" + (this._data.x() + deltaX) + "," + (this._data.y() + deltaY) + ")"
                });

                if (this._data.sector()) {
                    var secId = this._data.sector().id();
                    console.log("polygon move. Sector params", {
                        sectorX: this._resizeData.sectorX,
                        sectorY: this._resizeData.sectorY,
                        deltaX: deltaX,
                        deltaY: deltaY
                    })
                    var secView = this._data.scheme._getViewByDataId(secId);
                    secView.data().x(this._resizeData.sectorX + deltaX);
                    secView.data().y(this._resizeData.sectorY + deltaY);
                    secView.render(snap);
                }

                if (saveData) {
                    this._data.x(this._data.x() + deltaX);
                    this._data.y(this._data.y() + deltaY);
                }
            } else if (mode == "line") {
                var i = this._resizeData.pointIdx;
                var ps = this._element.attr("points");
                var rightI = 0;
                if (i + 2 < points.length)
                    rightI = i + 2;
                ps[i] = (+points[i]) + deltaX;
                ps[rightI] = (+points[rightI]) + deltaX;
                ps[i+1] = (+points[i+1]) + deltaY;
                ps[rightI+1] = (+points[rightI+1]) + deltaY;
                this._element.attr({"points": ps});
                if (saveData) {
                    points.splice(0, points.length);
                    for (var i=0; i < ps.length; i++)
                        points.push(+ps[i]);
                }
            }
        },

        _getBKCoefs: function(x1, y1, x2, y2) {
            var res = {};
            res.k = (y2 - y1)/(x2 - x1);
            res.b = y1 - res.k*x1;
            return res;
        },
        _renderMiddles: function(snap, hide) {
            var middles = null;
            if (!hide) {

                var points = this._element.attr("points");
                middles = [];
                for (var i = 0; i < points.length; i = i + 2) {
                    var leftPoint = { x: points[i], y: points[i+1]};
                    var rightPoint = null;
                    if (i + 2 < points.length)
                        rightPoint = {x: points[i+2], y: points[i+3]};
                    else
                        rightPoint = {x: points[0], y: points[1]};
                    middles.push(this._getLineMid(leftPoint, rightPoint));
                }
            }
            this._renderPoints(snap, middles, hide);
        },

        _renderPoints: function(snap, points, hide) {
            if (!this._points) this._points = [];

            for (var i = 0; i < this._points.length; i++)
                this._points[i].attr({display: (hide ? 'none' : '')});

            if (!hide) {
                for (var i = points.length; i < this._points.length; i++)
                    this._points[i].remove();
                this._points.splice(points.length);
                for (i = 0; i < points.length; i++) {
                    try {
                        if (!this._points[i]) {
                            this._points[i] = snap.circle(points[i].x, points[i].y, 5);
                            this._group.prepend(this._points[i]);
                            this._points[i].attr({
                                fill: this._data.stroke()
                            });
                        } else
                            this._points[i].attr({cx: points[i].x, cy: points[i].y});
                    } catch (e) {
                        console.warn("Render " + i + "-th point faled", points, this._element.attr("points"));
                    }
                }
            }
        },

        setProperty: function(data) {
            this._super(data);
            if (data && data.property == "border-color") {
                this._element.attr("stroke", "#" + data.value);
                this._data.stroke("#" + data.value)
            }
            if (data && data.property == "fill-color") {
                this._element.attr("fill", "#" + data.value);
                this._data.background("#" + data.value)
            }
        },

        remove: function() {
            this._super();
            this._group.remove();
            this._group = null;
            return this;
        },

        getCenter: function() {
            var bb = this._group.getBBox();
            return {
                left: bb.cx,
                top: bb.cy
            }
        }
    });
    SchemeDesigner.PolygonView = PolygonView;

    var TitleView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data);
            this._dragData = null;
            this._border = null;
            this._group = null;
        },

        render: function(snap, group) {
            this._super(snap, group);
            var that = this;
            if (this._element == null) {
                this._element = snap.text(
                    this._data.x(),
                    this._data.y(),
                    this._data.text()
                );
                this._element.attr({id: this._data.id()});
                this._border = snap.rect(
                    this._data.x() - 5,
                    this._data.y() - this._element.node.clientHeight,
                    this._element.node.clientWidth + 10,
                    this._element.node.clientHeight + 5
                );

                this._group = snap.group(this._border, this._element);
                this._group.addClass("text");
                group.add(this._group);

                this._border.addClass("image-border");

                this._element.drag(function(deltaX, deltaY, x, y, event) {
                    if (!that._data.scheme.designMode()) return;
                    var scale = this._data.scheme._getScale();
                    deltaX = deltaX / scale;
                    deltaY = deltaY / scale;
                    this._dragData = {
                        deltaX: deltaX, deltaY: deltaY, x: x, y: y
                    };
                    this._element.attr({
                        x: this._data.x() + deltaX,
                        y: this._data.y() + deltaY
                    });
                    this._border.attr({
                        x: this._data.x() + deltaX - 5,
                        y: this._data.y() + deltaY - this._element.node.clientHeight
                    });
                    that._data.scheme._viewMoved(that);
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }, function(x, y, event) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }, function(event) {
                    if (this._dragData) {
                        this._data.x(this._data.x() + this._dragData.deltaX);
                        this._data.y(this._data.y() + this._dragData.deltaY);

                        this._element.attr({
                            x: this._data.x(),
                            y: this._data.y()
                        });
                        this._border.attr({
                            x: this._data.x() - 5,
                            y: this._data.y() - this._element.node.clientHeight
                        });
                        this._dragData = null;
                    }
                    that._data.scheme._viewMoved(that);
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }, this);

                this._element.click(function(e) {
                    that._data.scheme._viewClicked(that, e);
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });
            } else {
                this._element.attr({
                    x: this._data.x(),
                    y: this._data.y()
                });
                this._border.attr({
                    x: this._data.x() - 5,
                    y: this._data.y() - this._element.node.clientHeight
                });
            }
            if (this._data.color())
                this._element.attr({fill: this._data.color()});
            else
                this._element.attr({fill: null});

            if (this._data.fontFamily())
                this._element.attr({"font-family": this._data.fontFamily()});
            else
                this._element.attr({"font-family": null});

            if (this._data.fontSize())
                this._element.attr({"font-size": this._data.fontSize()});
            else
                this._element.attr({"font-size": null});

            this._border.attr({
                x: this._data.x() - 5,
                y: this._data.y() - this._element.node.clientHeight,
                width: this._element.node.clientWidth + 10,
                height: this._element.node.clientHeight + 5
            });

            if (this.focused()) {
                this._border.attr({visibility: null});
                this._element.addClass("focused");
            } else {
                this._border.attr({visibility: "hidden"});
                this._element.removeClass("focused");
            }
            this._data.scheme._viewRendered(this);

        },

        setProperty: function(data) {
            this._super(data);
            if (data && data.property == "text") {
                this._element.attr({text: data.value});
                this._data.text(data.value);
            }
            if (data && data.property == "text-color") {
                this._element.attr("fill", "#" + data.value);
                this._data.color("#" + data.value);
            }
            if (data && data.property == "text-size") {
                this._element.attr("font-size", data.value);
                this._data.fontSize(data.value);
            }
            if (data && data.property == "font-family") {
                this._element.attr("font-family", data.value);
                this._data.fontFamily(data.value);
            }

            if (data && data.property == "text-bold") {
                this._element.attr("font-weight", data.value ? "bold" : null);
                this._data.bold(data.value);
            }

            if (data && data.property == "text-italic") {
                this._element.attr("font-style", data.value ? "italic" : null);
                this._data.italic(data.value);
            }

            if (data && data.property == "text-underline") {
                this._element.attr("text-decoration", data.value ? "underline" : null);
                this._data.underline(data.value);
            }

            this._border.attr({
                x: this._data.x() - 5,
                y: this._data.y() - this._element.node.clientHeight,
                width: this._element.node.clientWidth + 10,
                height: this._element.node.clientHeight + 5
            });
        },

        remove: function() {
            this._super();
            this._group.remove();
            this._group = null;
            return this;
        },

        getCenter: function() {
            var bb = this._group.getBBox();
            return {
                left: bb.cx,
                top: bb.cy
            }
        }
    });
    SchemeDesigner.TitleView = TitleView;

    var LineView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data);
            this._group = null;
            this._border = null;
            this._foreground = null;
            this._resizeData = null;
        },

        render: function (snap, grp) {
            this._super(snap, grp);
            var that = this;
            if (!this._group) {
                this._element = snap.polyline(this._data.points());
                this._border = snap.polyline(this._data.points());
                this._border.addClass("line-border");
                this._foreground = snap.polyline(this._data.points());
                this._foreground.addClass("foreground");

                //this._element.node.addEventListener("contextmenu", function(e) {
                //    e.preventDefault();
                //}, false);
                this._element.attr({id: this._data.id()});
                this._group = snap.group(this._border, this._element, this._foreground);
                this._group.addClass("line");
                this._group.attr({
                    transform: "translate(" + this._data.x() + "," + this._data.y() + ")"
                });
                grp.add(this._group);

                this._initResize(snap);

                this._foreground.click(function(e) {
                    that._data.scheme._viewClicked(that, e);
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });

            } else {
                this._group.attr({
                    transform: "translate(" + this._data.x() + "," + this._data.y() + ")"
                });
            }

            this._renderLineWidth();
            this._element.attr({ stroke: this._data.background() });

            if (this.focused())  this._border.addClass("focused");
            else this._border.removeClass("focused");
            this._data.scheme._viewRendered(this);
        },

        _initResize: function(snap) {
            var that = this;
            this._foreground.mousemove(function(event) {
                if (!that._data.scheme.designMode()) return;
                if (!that._resizeData) {
                    that._resizeData = {
                        x: that._data.x(),
                        y: that._data.y(),
                        resizeStarted: false,
                        deltaX: 0,
                        deltaY: 0
                    };
                }
                that._border.addClass("hover");
                that._renderLineWidth(true);

                if (!that._resizeData.resizeStarted)
                    that._setResizeMode(event);
                //that._renderMiddles(snap, false);
            }).mouseout(function (event) {
                if (that._resizeData && !that._resizeData.resizeStarted)
                    that._resizeData = null;
                that._foreground.attr({cursor: "default"});
                that._renderLineWidth(that._resizeData && that._resizeData.resizeStarted);
                if (that._resizeData && that._resizeData.resizeStarted)
                    that._border.addClass("hover");
                else
                    that._border.removeClass("hover");
                //that._renderMiddles(snap, true);
            }).drag(function (deltaX, deltaY, x, y, event) {
                event.stopPropagation();
                event.preventDefault();
                if (!that._resizeData) return false;
                that._resizeData.resizeStarted = true;
                that._resizeData.offsetX = event.offsetX;
                that._resizeData.offsetY = event.offsetY;
                that._handleResize(deltaX, deltaY);
                //that._renderMiddles(snap, false);
                that._data.scheme._viewMoved(that);
                return false;
            }, function(x, y, event) {
                /*if (!that._resizeData) return;
                if (that._resizeData.mode == "addPoint") {
                    that._resizeData.offsetX = event.offsetX;
                    that._resizeData.offsetY = event.offsetY;
                    var ps = this._element.attr("points");

                    var leftPoint = { x: ps[that._resizeData.pointIdx], y: ps[that._resizeData.pointIdx+1]};
                    var rightPoint = null;
                    if (that._resizeData.pointIdx + 2 < ps.length)
                        rightPoint = {x: ps[that._resizeData.pointIdx+2], y: ps[that._resizeData.pointIdx+3]};
                    else
                        rightPoint = {x: ps[0], y: ps[1]};

                    var midP = this._getLineMid(leftPoint, rightPoint);
                    this._resizeData.startX = midP.x;
                    this._resizeData.startY = midP.y;
                    ps.splice(this._resizeData.pointIdx + 2, 0, midP.x);
                    ps.splice(this._resizeData.pointIdx + 3, 0, midP.y);
                    this._element.attr({"points": ps});
                    //that._renderMiddles(snap, false);
                }*/
                event.stopPropagation();
                event.preventDefault();
                return false;
            }, function (event) {
                event.stopPropagation();
                event.preventDefault();
                if (!(that._resizeData)) return false;
                /*if (event.ctrlKey) {
                    if (that._resizeData.mode == "point") {
                        var points = that._data.points();
                        points.splice(that._resizeData.pointIdx, 2);
                        that._element.attr({"points": points});
                        that._resizeData = null;
                        //that._renderMiddles(snap, false);
                    }
                } else */{
                    that._resizeData.offsetX = event.offsetX;
                    that._resizeData.offsetY = event.offsetY;
                    that._foreground.attr({cursor: "default"});
                    that._handleResize(this._resizeData.deltaX, this._resizeData.deltaY, true);
                    that._resizeData = null;
                    //that._renderMiddles(snap, false);
                }
                that._renderLineWidth();
                that._data.scheme._viewMoved(that);
                return false;
            }, this);
        },

        /*_getLineMid: function(leftPoint, rightPoint) {
            var dimX = Math.abs(leftPoint.x - rightPoint.x)/2;
            var dimY = Math.abs(leftPoint.y - rightPoint.y)/2;
            var midX = Math.min(leftPoint.x, rightPoint.x) + dimX;
            var midY = Math.min(leftPoint.y, rightPoint.y) + dimY;
            return {x: midX, y: midY};
        },*/

        _setResizeMode: function(event) {
            var that = this;
            var scale = this._data.scheme._getScale();

            var points = that._data.points();
            that._resizeData.mode = "move";


            that._foreground.attr({cursor: "default"});
            /*for (var i = 0; i < points.length; i = i + 2) {
                var leftPoint = { x: points[i], y: points[i+1]};
                var rightPoint = null;
                rightPoint = {x: points[i+2], y: points[i+3]};

                var midP = that._getLineMid(leftPoint, rightPoint);
                if ((Math.abs(event.offsetX - (that._resizeData.x + midP.x)) <= 5) &&
                    (Math.abs(event.offsetY - (that._resizeData.y + midP.y)) <= 5)) {
                    that._element.attr({cursor: "crosshair"});
                    that._resizeData.mode = "addPoint";
                    that._resizeData.pointIdx = i;
                }
            }*/

            if (that._resizeData.mode == "move") {
                for (var i = 0; i < points.length - 1; i = i + 2) {
                    if ((Math.abs(event.offsetX - (that._resizeData.x + (+points[i]))*scale) <= 5) &&
                        (Math.abs(event.offsetY - (that._resizeData.y + (+points[i+1]))*scale) <= 5)) {
                        that._foreground.attr({cursor: "crosshair"});
                        that._resizeData.mode = "point";
                        that._resizeData.pointIdx = i;
                        break;
                    }
                }
            }
/*
            if (that._resizeData.mode == "move") {
                for (var i = 0; i < points.length; i = i + 2) {
                    var leftPoint = { x: points[i], y: points[i+1]};
                    var rightPoint = null;
                    if (i + 2 < points.length)
                        rightPoint = {x: points[i+2], y: points[i+3]};
                    else
                        rightPoint = {x: points[0], y: points[1]};
                    var coefs = this._getBKCoefs(leftPoint.x, leftPoint.y, rightPoint.x, rightPoint.y);
                    var mouseX = event.offsetX - that._resizeData.x;
                    var mouseY = event.offsetY - that._resizeData.y;

                    var a = Math.sqrt((leftPoint.x-mouseX)*(leftPoint.x-mouseX)+(leftPoint.y-mouseY)*(leftPoint.y-mouseY));
                    var b = Math.sqrt((rightPoint.x-mouseX)*(rightPoint.x-mouseX)+(rightPoint.y-mouseY)*(rightPoint.y-mouseY));
                    var c = Math.sqrt((leftPoint.x-rightPoint.x)*(leftPoint.x-rightPoint.x)+(leftPoint.y-rightPoint.y)*(leftPoint.y-rightPoint.y));
                    //var sin = Math.sqrt(1-(((a*a+b*b-c*c)/(a*b))*((a*a+b*b-c*c)/(a*b))));
                    var p = (a+b+c)/2

                    var d=2*Math.sqrt(p*(p-a)*(p-b)*(p-c))/c;
                    if (Math.abs(d) <= 5) {
                        that._element.attr({cursor: "pointer"});
                        that._resizeData.mode = "line";
                        that._resizeData.pointIdx = i;
                        break;
                    }
                }
            }*/
        },

        _handleResize: function(deltaX, deltaY, saveData) {
            var mode = this._resizeData.mode;
            if (!this._data.scheme._canDrag()) return;

            var scale = this._data.scheme._getScale();
            if (!saveData) {
                deltaX = deltaX / scale;
                deltaY = deltaY / scale;
            }

            this._resizeData.deltaX = deltaX;
            this._resizeData.deltaY = deltaY;
            var points = this._data.points();

            if (mode == "addPoint") {
                var ps = this._element.attr("points");
                ps[this._resizeData.pointIdx+2] = this._resizeData.startX + deltaX;
                ps[this._resizeData.pointIdx + 3] = this._resizeData.startY + deltaY;
                this._element.attr({"points": ps});
                this._border.attr({"points": ps});
                this._foreground.attr({"points": ps});
                if (saveData) {
                    points.splice(0, points.length);
                    for (var i=0; i < ps.length; i++)
                        points.push(+ps[i]);
                }
            } else if (mode == "point") {
                var ps = this._element.attr("points");
                ps[this._resizeData.pointIdx] = points[this._resizeData.pointIdx] + deltaX;
                ps[this._resizeData.pointIdx + 1] = points[this._resizeData.pointIdx + 1] + deltaY;
                this._element.attr("points", ps);
                this._border.attr("points", ps);
                this._foreground.attr("points", ps);
                if (saveData) {
                    points[this._resizeData.pointIdx] = points[this._resizeData.pointIdx] + deltaX;
                    points[this._resizeData.pointIdx + 1] = points[this._resizeData.pointIdx + 1] + deltaY;
                }
            } else if (mode == "move") {
                this._group.attr({
                    transform: "translate(" + (this._data.x() + deltaX) + "," + (this._data.y() + deltaY) + ")"
                });

                if (saveData) {
                    this._data.x(this._data.x() + deltaX);
                    this._data.y(this._data.y() + deltaY);
                }
            } else if (mode == "line") {
                var i = this._resizeData.pointIdx;
                var ps = this._element.attr("points");
                var rightI = 0;
                if (i + 2 < points.length)
                    rightI = i + 2;
                ps[i] = (+points[i]) + deltaX;
                ps[rightI] = (+points[rightI]) + deltaX;
                ps[i+1] = (+points[i+1]) + deltaY;
                ps[rightI+1] = (+points[rightI+1]) + deltaY;
                this._element.attr({"points": ps});
                this._border.attr({"points": ps});
                this._foreground.attr({"points": ps});
                if (saveData) {
                    points.splice(0, points.length);
                    for (var i=0; i < ps.length; i++)
                        points.push(+ps[i]);
                }
            }
        },

        _getBKCoefs: function(x1, y1, x2, y2) {
            var res = {};
            res.k = (y2 - y1)/(x2 - x1);
            res.b = y1 - res.k*x1;
            return res;
        },
        /*_renderMiddles: function(snap, hide) {
            var middles = null;
            if (!hide) {

                var points = this._element.attr("points");
                middles = [];
                for (var i = 0; i < points.length; i = i + 2) {
                    var leftPoint = { x: points[i], y: points[i+1]};
                    var rightPoint = null;
                    if (i + 2 < points.length)
                        rightPoint = {x: points[i+2], y: points[i+3]};
                    else
                        rightPoint = {x: points[0], y: points[1]};
                    middles.push(this._getLineMid(leftPoint, rightPoint));
                }
            }
            this._renderPoints(snap, middles, hide);
        },*/

        /*_renderPoints: function(snap, points, hide) {
            if (!this._points) this._points = [];

            for (var i = 0; i < this._points.length; i++)
                this._points[i].attr({display: (hide ? 'none' : '')});

            if (!hide) {
                for (var i = points.length; i < this._points.length; i++)
                    this._points[i].remove();
                this._points.splice(points.length);
                for (i = 0; i < points.length; i++) {
                    try {
                        if (!this._points[i]) {
                            this._points[i] = snap.circle(points[i].x, points[i].y, 5);
                            this._group.prepend(this._points[i]);
                            this._points[i].attr({
                                fill: this._data.stroke()
                            });
                        } else
                            this._points[i].attr({cx: points[i].x, cy: points[i].y});
                    } catch (e) {
                        console.warn("Render " + i + "-th point faled", points, this._element.attr("points"));
                    }
                }
            }
        },*/

        setProperty: function(data) {
            this._super(data);
            if (data) {
                if (data.property == "fill-color") {
                    this._element.attr("stroke", "#" + data.value);
                    this._data.background("#" + data.value)
                }
                if (data.property == "line-width") {
                    this._data.width(data.value);
                    this._renderLineWidth();
                }
            }
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
            this._group.remove();
            this._group = null;
            return this;
        },

        getCenter: function() {
            var bb = this._group.getBBox();
            return {
                left: bb.cx,
                top: bb.cy
            }
        }
    });
    SchemeDesigner.LineView = LineView;
})(jQuery);
