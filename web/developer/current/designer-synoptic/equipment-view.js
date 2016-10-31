/**
 * Created by kiknadze on 04.12.2015.
 */
(function(window){
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

    var EquipmentView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data)
            this._group = null;
            this._rect = null;
            this._visibleRect = null;
            this._dragData = null;
            this._resizeData = null;
            this._dataVisible = false;

            var imgUrl = data.icon().url();
            var natures = this._data.scheme._getNatures();
            if (!imgUrl && natures && natures[this._data.data().nature()])
                imgUrl = natures[this._data.data().nature()];
            data.icon().url(imgUrl);

            this._caption = new SchemeDesigner.EntryTitleView(data.title(), this);
            this._icon = new SchemeDesigner.EntryIconView(data.icon(), false, this);
            this._dataGroup = new SchemeDesigner.EntryDataView(data.data());
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
                this._rect.addClass("invisible-rect");
                this._visibleRect.addClass("data");
                this._initResize(snap);

                this._group = snap.group(this._visibleRect);
                grp.add(this._group);
                this._group.attr({id: this._data.id()});
                this._group.attr({
                    transform: "translate(" + this._data.x() + "," + this._data.y() + ")"
                });
                this._group.addClass("equipment");
                this._caption.render(snap, this._group);
                this._icon.render(snap, this._group);
                this._dataGroup.render(snap, this._group, this._rect, this._dataVisible);

                this._group.add(this._rect);

                this._icon.element().drag(function(deltaX, deltaY, x, y, event) {
                    if (!that._data.scheme.designMode()) return;
                    var scale = this._data.scheme._getScale();
                    deltaX = deltaX / scale;
                    deltaY = deltaY / scale;
                    this._dragData = {
                        deltaX: deltaX, deltaY: deltaY, x: x, y: y
                    };
                    this._group.attr({
                        transform: "translate(" + (this._data.x() + deltaX) + "," + (this._data.y() + deltaY) + ")"
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
                        this._group.attr({
                            transform: "translate(" + (this._data.x() + this._dragData.deltaX) + "," + (this._data.y() + this._dragData.deltaY) + ")"
                        });
                        this._data.x(this._data.x() + this._dragData.deltaX);
                        this._data.y(this._data.y() + this._dragData.deltaY);
                        this._dragData = null;
                        this._dataGroup.render(snap, this._group, this._rect, this._dataVisible);
                    }
                    that._data.scheme._viewMoved(that);
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }, this).dblclick(function() {
                    that._dataVisible = !that._dataVisible;
                    that._dataGroup.render(snap, that._group, that._rect, that._dataVisible);
                    that._visibleRect.attr({display: that._dataVisible ? "" : "none"});
                    that._rect.attr({display: that._dataVisible ? "" : "none"});
                });
                this._rect.click(function(e) {
                    that._data.scheme._viewClicked(that, e);
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });
            } else {
                this._group.attr({
                    transform: "translate(" + (this._data.x()) + "," + (this._data.y()) + ")"
                });
                this._caption.render(snap, this._group);
                this._icon.render(snap, this._group);
                this._dataGroup.render(snap, this._group, this._rect, this._dataVisible);
            }

            this._visibleRect.attr({
                fill: this._data.background(),
                stroke: this._data.stroke()
            });

            if (this.focused())
                this._visibleRect.addClass("focused");
            else
                this._visibleRect.removeClass("focused");

            this._visibleRect.attr({display: this._dataVisible ? "" : "none"});
            this._rect.attr({display: this._dataVisible ? "" : "none"});

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
                if (!that._resizeData) return;
                that._resizeData.resizeStarted = true;
                that._handleResize(deltaX, deltaY);
                this._dataGroup.render(snap, this._group, this._rect, this._dataVisible);
                that._data.scheme._viewMoved(that);
                event.stopPropagation();
                event.preventDefault();
                return false;
            }, function(x, y, event) {
                event.stopPropagation();
                event.preventDefault();
                return false;
            }, function (event) {
                that._rect.attr({cursor: "default"});
                if (!that._resizeData) return;
                that._handleResize(this._resizeData.deltaX, this._resizeData.deltaY, true);
                this._caption.render(snap, this._group);
                this._icon.render(snap, this._group);
                this._dataGroup.render(snap, this._group, this._rect, this._dataVisible);
                that._resizeData = null;
                that._data.scheme._viewMoved(that);
                event.stopPropagation();
                event.preventDefault();
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
                (Math.abs(event.offsetY - (that._resizeData.y + that._resizeData.borderHeight)*scale) <= 5)) {
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

        _handleResize: function(deltaX, deltaY, saveData) {
            var mode = this._resizeData.mode;
            var scale = this._data.scheme._getScale();
            if (!saveData) {
                deltaX = deltaX / scale;
                deltaY = deltaY / scale;
            }

            if (mode == "s" || mode == "se" || mode == "sw") {
                this._resizeData.deltaY = deltaY;
                this._rect.attr({height: this._data.height() + this._resizeData.deltaY});
                this._visibleRect.attr({height: this._data.height() + this._resizeData.deltaY});
                if (saveData)
                    this._data.height(this._data.height() + this._resizeData.deltaY);

            }
            if (mode == "e" || mode == "ne" || mode == "se") {
                this._resizeData.deltaX = deltaX;
                this._rect.attr({width: this._data.width() + this._resizeData.deltaX});
                this._visibleRect.attr({width: this._data.width() + this._resizeData.deltaX});
                if (saveData)
                    this._data.width(this._data.width() + this._resizeData.deltaX);
            }
            if (mode == "n" || mode == "ne" || mode == "nw") {
                this._resizeData.deltaY = deltaY;
                this._rect.attr({height: this._data.height() - deltaY, y: deltaY});
                this._visibleRect.attr({height: this._data.height() - deltaY, y: deltaY});
                if (saveData) {
                    this._rect.attr({y: 0});
                    this._visibleRect.attr({y: 0});
                    this._group.attr({
                        transform: "translate(" + this._data.x() + "," + (this._data.y() + deltaY) + ")"
                    });
                    this._data.y(this._data.y() + deltaY);
                    this._data.height(this._data.height() - deltaY);
                    this._caption.data().y(this._caption.data().y() - deltaY);
                    this._icon.data().y(this._icon.data().y() - deltaY);
                }
            }
            if (mode == "w" || mode == "nw" || mode == "sw") {
                this._resizeData.deltaX = deltaX;
                this._rect.attr({width: this._data.width() - deltaX, x: deltaX});
                this._visibleRect.attr({width: this._data.width() - deltaX, x: deltaX});

                if (saveData) {
                    this._rect.attr({x: 0});
                    this._visibleRect.attr({x: 0});
                    this._group.attr({
                        transform: "translate(" + (this._data.x() + deltaX) + "," + this._data.y() + ")"
                    });
                    this._data.x(this._data.x() + deltaX);
                    this._data.width(this._data.width() - deltaX);
                    this._caption.data().x(this._caption.data().x() - deltaX);
                    this._icon.data().x(this._icon.data().x() - deltaX);
                }
            }

            if (mode == "drag") {
                this._resizeData.deltaX = deltaX;
                this._resizeData.deltaY = deltaY;
                this._rect.attr({x: deltaX, y: deltaY});
                this._visibleRect.attr({x: deltaX, y: deltaY});
                if (saveData) {
                    this._rect.attr({x: 0, y: 0});
                    this._visibleRect.attr({x: 0, y: 0});
                    this._group.attr({
                        transform: "translate(" + (this._data.x() + deltaX) + "," + (this._data.y() + deltaY) + ")"
                    });
                    this._data.x(this._data.x() + deltaX);
                    this._data.y(this._data.y() + deltaY);
                    this._caption.data().x(this._caption.data().x() - deltaX);
                    this._caption.data().y(this._caption.data().y() - deltaY);
                    this._icon.data().x(this._icon.data().x() - deltaX);
                    this._icon.data().y(this._icon.data().y() - deltaY);
                }
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
            return this;
        },

        handleKeyboard: function(e, fromIcon) {
            if (!this._data) return true;
            // keyCode == 37, 38, 39, 40
            var scale = this._data.scheme._getScale();
            var notHandled = true;

            if (e.keyCode == 37) {
                this._data.x(this._data.x() - 1/scale);
                if (!fromIcon) {
                    this._caption.data().x(this._caption.data().x() + 1 / scale);
                    this._icon.data().x(this._icon.data().x() + 1 / scale);
                }
                notHandled = false;
            } else if (e.keyCode == 38) {
                this._data.y(this._data.y() - 1/scale);
                if (!fromIcon) {
                    this._caption.data().y(this._caption.data().y() + 1 / scale);
                    this._icon.data().y(this._icon.data().y() + 1 / scale);
                }
                notHandled = false;
            } else if (e.keyCode == 39) {
                this._data.x(this._data.x() + 1/scale);
                if (!fromIcon) {
                    this._caption.data().x(this._caption.data().x() - 1 / scale);
                    this._icon.data().x(this._icon.data().x() - 1 / scale);
                }
                notHandled = false;
            } else if (e.keyCode == 40) {
                this._data.y(this._data.y() + 1/scale);
                if (!fromIcon) {
                    this._caption.data().y(this._caption.data().y() - 1 / scale);
                    this._icon.data().y(this._icon.data().y() - 1 / scale);
                }
                notHandled = false;
            }

            if (!notHandled) {
                this.render(this._snap, this._parentGroup);
                this._data.scheme._viewMoved(this);
            }
            return notHandled;
        }
    });
    window.SchemeDesigner.EquipmentView = EquipmentView;

})(window);
