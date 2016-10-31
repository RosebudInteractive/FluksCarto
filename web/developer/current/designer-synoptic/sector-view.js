/**
 * Created by kiknadze on 29.12.2015.
 */

(function(window){
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

    var SectorView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data)
            this._group = null;
            this._rect = null;
            this._visibleRect = null;
            this._dragData = null;
            this._resizeData = null;
            this._caption = new SchemeDesigner.EntryTitleView(data.title(), this);
            this._dataGroup = new SchemeDesigner.EntryDataView(data.data());
            this._status = null;
        },

        render: function(snap, grp)  {
            this._super(snap, grp);
            var that = this;
            if (!this._group) {
                this._visibleRect = snap.rect(
                    0,
                    0,
                    this._data.width(),
                    this._data.height()
                );

                this._rect = snap.rect(
                    0,
                    0,
                    this._data.width(),
                    this._data.height()
                );
                this._rect.node.addEventListener("contextmenu", function(e) {
                    e.preventDefault();
                }, false);

                this._rect.addClass("invisible-rect");
                this._visibleRect.addClass("data");

                this._status = snap.circle(this._data.width(), this._data.height(), 15);
                this._status.addClass("status");

                this._initResize(snap);


                this._group = snap.group(this._status);
                this._group.attr({id: this._data.id()});
                this._group.add(this._visibleRect);
                grp.add(this._group);

                this._group.attr({
                    transform: "translate(" + this._data.x() + "," + this._data.y() + ")"
                });
                this._group.addClass("sector");
                this._caption.render(snap, this._group);
                this._dataGroup.render(snap, this._group, this._rect);
                this._group.add(this._rect);


                this._rect.click(function(e) {
                    that._data.scheme._viewClicked(that, e);
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });
            } else {
                console.log("sector render", this._data.x(), this._data.y())
                this._group.attr({
                    transform: "translate(" + this._data.x() + "," + this._data.y() + ")"
                });
                this._status.attr({
                    cx: this._data.width(),
                    cy: this._data.height()
                });
                this._caption.render(snap, this._group);
                this._dataGroup.render(snap, this._group, this._rect);
            }



            var active = this._data.data().active();
            if (active === true)
                this._status.addClass("active").removeClass("passive");
            else if (active === false)
                this._status.addClass("passive").removeClass("active");
            else if (active && active.slice(0, 1) == "#") {
                this._status.removeClass("passive").removeClass("active").attr({fill: active});
            } else
                this._status.removeClass("passive").removeClass("active");

            this._visibleRect.attr({
                fill: this._data.background(),
                stroke: this._data.stroke()
            });

            if (this.focused())
                this._visibleRect.addClass("focused");
            else
                this._visibleRect.removeClass("focused");

            this._data.scheme._viewRendered(this);
        },

        _initResize: function(snap) {
            var that = this;
            this._rect.mousemove(function(event) {
                that._visibleRect.addClass("hover");
                if (!that._data.scheme.designMode()) return;
                if (!that._resizeData) {
                    that._resizeData = {
                        borderWidth: that._data.width(),
                        borderHeight: that._data.height(),
                        x: that._data.x(),
                        y: that._data.y(),
                        resizeStarted: false,
                        deltaX: 0,
                        deltaY: 0
                    };
                }

                if (!that._resizeData.resizeStarted)
                    that._setResizeMode(event);
            }).mouseout(function (event) {
                if(that._resizeData && !that._resizeData.resizeStarted) {
                    that._rect.attr({cursor: "default"});
                    that._resizeData = null;
                }
                that._visibleRect.removeClass("hover");
            }).drag(function (deltaX, deltaY, x, y, event) {
                event.stopPropagation();
                event.preventDefault();
                if (!that._resizeData) return false;
                that._resizeData.resizeStarted = true;
                that._handleResize(deltaX, deltaY, false, event);
                this._dataGroup.render(snap, this._group, this._rect);
                that._data.scheme._viewMoved(that);
                return false;
            }, function(x, y, event) {
                event.stopPropagation();
                event.preventDefault();
                return false;
            }, function (event) {
                event.stopPropagation();
                event.preventDefault();
                if (!that._resizeData) return false;
                that._rect.attr({cursor: "default"});
                that._handleResize(this._resizeData.deltaX, this._resizeData.deltaY, true, event);
                this._caption.render(snap, this._group);
                this._dataGroup.render(snap, this._group, this._rect);
                that._resizeData = null;
                that._data.scheme._viewMoved(that);
                return false;
            }, this);
        },

        _setResizeMode: function(event) {
            var that = this;
            var scale = that._data.scheme._getScale();
            if ((Math.abs(event.offsetX - that._resizeData.x*scale) <= 5) &&
                (Math.abs(event.offsetY - that._resizeData.y*scale) <= 5)) {
                that._rect.attr({cursor: "nw-resize"});
                that._resizeData.mode = "nw";
            } else if ((Math.abs(event.offsetX - (that._resizeData.x + that._resizeData.borderWidth)*scale) <= 5) &&
                (Math.abs(event.offsetY - that._resizeData.y*scale) <= 5)) {
                that._rect.attr({cursor: "ne-resize"});
                that._resizeData.mode = "ne";
            } else if ((Math.abs(event.offsetX - (that._resizeData.x + that._resizeData.borderWidth)*scale) <= 5) &&
                (Math.abs(event.offsetY - (that._resizeData.y + that._resizeData.borderHeight)*scale) <= 5)) {
                that._rect.attr({cursor: "se-resize"});
                that._resizeData.mode = "se";
            } else if ((Math.abs(event.offsetX - that._resizeData.x*scale) <= 5) &&
                (Math.abs(event.offsetY - (that._resizeData.y + that._resizeData.borderHeight*scale)) <= 5)) {
                that._rect.attr({cursor: "sw-resize"});
                that._resizeData.mode = "sw";
            } else if (Math.abs(event.offsetX - that._resizeData.x*scale) <= 5) {
                that._rect.attr({cursor: "w-resize"});
                that._resizeData.mode = "w";
            } else if (Math.abs(event.offsetX - (that._resizeData.x + that._resizeData.borderWidth)*scale) <= 5) {
                that._rect.attr({cursor: "e-resize"});
                that._resizeData.mode = "e";
            } else if (Math.abs(event.offsetY - that._resizeData.y*scale) <= 5) {
                that._rect.attr({cursor: "n-resize"});
                that._resizeData.mode = "n";
            } else if (Math.abs(event.offsetY - (that._resizeData.y + that._resizeData.borderHeight)*scale) <= 5) {
                that._rect.attr({cursor: "s-resize"});
                that._resizeData.mode = "s";
            } else {
                that._rect.attr({cursor: "default"});
                that._resizeData.mode = "drag";
            }
        },

        _handleResize: function(deltaX, deltaY, saveData, event) {
            var mode = this._resizeData.mode;
            var scale = this._data.scheme._getScale();
            if (!saveData) {
                deltaX = deltaX / scale;
                deltaY = deltaY / scale;
            }

            if (mode == "s" || mode == "se" || mode == "sw") {
                this._resizeData.deltaY = deltaY;
                this._status.attr({
                    cy: this._data.height() + deltaY
                });
                this._rect.attr({height: this._data.height() + this._resizeData.deltaY});
                this._visibleRect.attr({height: this._data.height() + this._resizeData.deltaY});
                if (saveData) {
                    this._data.height(this._data.height() + this._resizeData.deltaY);
                    this._status.attr({
                        cy: this._data.height()
                    });
                }
            }
            if (mode == "e" || mode == "ne" || mode == "se") {
                this._resizeData.deltaX = deltaX;
                this._rect.attr({width: this._data.width() + this._resizeData.deltaX});
                this._visibleRect.attr({width: this._data.width() + this._resizeData.deltaX});
                this._status.attr({
                    cx: this._data.width() + deltaX
                });
                if (saveData) {
                    this._data.width(this._data.width() + this._resizeData.deltaX);
                    this._status.attr({
                        cx: this._data.width()
                    });
                }
            }
            if (mode == "n" || mode == "ne" || mode == "nw") {
                this._resizeData.deltaY = deltaY;
                this._rect.attr({height: this._data.height() - deltaY});
                this._visibleRect.attr({height: this._data.height() - deltaY});
                this._status.attr({
                    cy: this._data.height()
                });

                this._rect.attr({y: deltaY});
                this._visibleRect.attr({y: deltaY});
                if (saveData) {
                    this._rect.attr({y: 0});
                    this._visibleRect.attr({y: 0});
                    this._group.attr({
                        transform: "translate(" + this._data.x() + "," + (this._data.y() + deltaY) + ")"
                    });
                    this._data.y(this._data.y() + deltaY);
                    this._data.height(this._data.height() - deltaY);
                    this._caption.data().y(this._caption.data().y() - deltaY);
                    this._status.attr({
                        cy: this._data.height()
                    });
                }
            }
            if (mode == "w" || mode == "nw" || mode == "sw") {
                this._resizeData.deltaX = deltaX;
                this._rect.attr({width: this._data.width() - deltaX});
                this._visibleRect.attr({width: this._data.width() - deltaX});

                this._status.attr({
                    cx: this._data.width()
                });

                this._rect.attr({x: deltaX});
                this._visibleRect.attr({x: deltaX});
                if (saveData) {
                    this._rect.attr({x: 0});
                    this._visibleRect.attr({x: 0});
                    this._group.attr({
                        transform: "translate(" + (this._data.x() + deltaX) + "," + this._data.y() + ")"
                    });
                    this._data.x(this._data.x() + deltaX);
                    this._data.width(this._data.width() - deltaX);
                    this._caption.data().x(this._caption.data().x() - deltaX);
                    this._status.attr({
                        cx: this._data.width()
                    });
                }
            }

            if (mode == "drag") {
                this._resizeData.deltaX = deltaX;
                this._resizeData.deltaY = deltaY;
                this._group.attr({
                    transform: "translate(" + (this._data.x() + deltaX) + "," + (this._data.y() + deltaY) + ")"
                });
                this._status.attr({
                    cx: this._data.width(),
                    cy: this._data.height()
                });

                this._group.attr({display: "none"});
                var dropEl = Snap.getElementByPoint(event.clientX, event.clientY);
                if (event.ctrlKey) {
                    if (this._dropTarget)
                        this._dropTarget.removeClass("drop-target");
                    if (dropEl.node.localName == "polygon") {
                        this._dropTarget = dropEl;
                        dropEl.addClass("drop-target");
                    }
                }

                if (saveData) {
                    this._data.x(this._data.x() + deltaX);
                    this._data.y(this._data.y() + deltaY);

                    if (event.ctrlKey)
                        this._data.scheme._unbindSectorFromPolygon(this._data.data());

                    if (dropEl.node.localName == "polygon") {
                        var pId = dropEl.node.id;
                        if (event.ctrlKey) {
                            this._data.scheme._bindSectorToPolygon(pId, this._data.data());
                            if (this._dropTarget) {
                                this._dropTarget.removeClass("drop-target");
                                this._dropTarget = null;
                            }
                        }
                    }


                }
                this._group.attr({display: ""});
            }

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
            this._group.remove();
            this._group = null;
            this._data.scheme._unbindSectorFromPolygon(this._data.data());
            return this;
        },

        getCenter: function() {
            var bbg = this._group.getBBox();
            var bb = this._visibleRect.getBBox();
            return {
                left: this._data.x() + bb.cx,
                top: this._data.y() + bb.cy
            }
        }
    });

    window.SchemeDesigner.SectorView = SectorView;

})(window);

