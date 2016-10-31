/**
 * Created by kiknadze on 09.12.2015.
 */

(function($){
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

    var EntryTitleView = SchemeDesigner.ViewBase.extend({
        init: function(data, parent) {
            this._super(data);
            this._dragData = null;
            this._border = null;
            this._group = null;
            this._parent = parent;
        },

        render: function(snap, group) {
            this._super(snap, group);
            var that = this;
            if (this._element == null) {
                this._parentGroup = group;
                this._element = snap.text(
                    this._data.x(),
                    this._data.y(),
                    this._data.entry().name()
                );
                this._element.attr({id: this._data.id()});
                var bb = this._element.getBBox();
                this._border = snap.rect(
                    this._data.x() - 5,
                    this._data.y() - bb.height,
                    bb.width + 10,
                    bb.height + 5
                );
                this._group = snap.group(this._border, this._element);
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

                    var bb = this._element.getBBox();
                    this._border.attr({
                        x: this._data.x() + deltaX - 5,
                        y: this._data.y() + deltaY - bb.height
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
                        var bb = this._element.getBBox();
                        this._border.attr({
                            x: this._data.x() - 5,
                            y: this._data.y() - bb.height
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
                var bb = this._element.getBBox();
                this._border.attr({
                    x: this._data.x() - 5,
                    y: this._data.y() - bb.height
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

            var bb = this._element.getBBox();
            this._border.attr({
                x: this._data.x() - 5,
                y: this._data.y() - bb.height,
                width: bb.width + 10,
                height: bb.height + 5
            });
        },

        getCenter: function() {
            var bbg = this._parentGroup.getBBox();
            var bb = this._group.getBBox();
            return {
                left: this._parent.data().x() + bb.cx,
                top: this._parent.data().y() + bb.cy
            }
        }
    });
    SchemeDesigner.EntryTitleView = EntryTitleView;

    var EntryIconView = SchemeDesigner.ViewBase.extend({
        init: function(data, selfDrag, parent) {
            this._selfDrag = selfDrag || false;
            this._super(data);
            this._element = null;
            this._dragData = null;
            this._border = null;
            this._status = null;
            this._group = null;
            this._parent = parent;
        },

        render: function(snap, group) {
            var that = this;
            this._super(snap, group);
            if (this._element == null) {
                this._element = snap.image(
                    this._data.url(),
                    this._data.x(),
                    this._data.y(),
                    this._data.width(),
                    this._data.height(),
                    function () {
                        var bb = that._element.getBBox();

                        that._border = snap.rect(
                            that._data.x(),
                            that._data.y(),
                            bb.width,
                            bb.height
                        );

                        that._status = snap.circle(that._data.x() + bb.width, that._data.y() + bb.height, 15);
                        that._status.addClass("status");

                        that._group = snap.group(that._border, that._status, that._element);
                        group.add(that._group);
                        that._border.addClass("image-border");

                        that._renderAttrs(snap, group);
                    });
                this._element.attr({id: this._data.id()});


                if (this._selfDrag) {
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
                            this._dragData = null;
                        }
                        that._data.scheme._viewMoved(that);
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }, this);
                }

                this._element.click(function(e) {
                    that._data.scheme._viewClicked(that, e);
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });

            } else {
                var bb = that._element.getBBox();
                this._element.attr({
                    x: this._data.x(),
                    y: this._data.y()
                });
                this._border.attr({
                    x: this._data.x(),
                    y: this._data.y()
                });

                this._status.attr({
                    cx: this._data.x() + bb.width,
                    cy: this._data.y() + bb.height
                });

                this._renderAttrs(snap, group);
            }


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

            if (this.focused()) {
                this._border.attr({visibility: null});
                this._element.addClass("focused");
            } else {
                this._border.attr({visibility: "hidden"});
                this._element.removeClass("focused");
            }
            this._data.scheme._viewRendered(this);
        },

        remove: function() {
            this._super();
            if (this._parent)
                return this._parent.remove();
            return null;
        },

        handleKeyboard: function(e) {
            if (this._selfDrag) return this._super(e);
            else return this._parent.handleKeyboard(e, true);
        },

        getCenter: function() {
            var bb = this._group.getBBox();
            return {
                left: this._parent.data().x() + bb.cx,
                top: this._parent.data().y() + bb.cy
            }
        }
    });
    SchemeDesigner.EntryIconView = EntryIconView;

    var EntryDataView = SchemeDesigner.ViewBase.extend({
        init: function(data) {
            this._super(data);
            this._group = null;
            this._fields = [];
        },

        render: function(snap, group, rect, visible) {
            if (visible === undefined) visible = true;
            this._super(snap, group);
            this._parentRect = rect || this._parentRect;
            var customData = this._data.data();
            if (this._group == null) {
                this._group = snap.group();
                this._group.attr({id: this._data.id()});
                this._group.attr({
                    transform: "translate(" + 15 + "," + 10 + ")"
                });

                this._parentGroup.add(this._group);


            }

            if (visible)
                this._group.attr({display: ""});
            else
                this._group.attr({display: "none"});

            var pX = this._parentRect.attr("x");
            var pY = this._parentRect.attr("y");

            this._group.attr({
                transform: "translate(" + ((+pX) + 15) + "," + (+(pY) +10) + ")"
            });

            var pW = this._parentRect.attr("width");
            var pH = this._parentRect.attr("height");

            var secColX = (pW - 30)/2;

            var gIdx = 0;
            var testText = snap.text (0, 0, "Eql");
            var bbT = testText.getBBox();
            var textHeight = bbT.height;
            var curY = textHeight;
            testText.remove(testText);
            var maxWidth = 0;
            for (var key in customData) {
                if (gIdx >= this._fields.length) {
                    this._fields[gIdx] = snap.text(0, curY, key);
                    var bb = this._fields[gIdx].getBBox();
                    maxWidth = Math.max(maxWidth, bb.width);
                    this._fields[gIdx+1] = snap.text(secColX, curY, customData[key]);
                    this._group.add(this._fields[gIdx], this._fields[gIdx+1]);
                } else {
                    this._fields[gIdx].attr({
                        x: 0,
                        y: curY,
                        text: key
                    });
                    var bb = this._fields[gIdx].getBBox();
                    maxWidth = Math.max(maxWidth, bb.width);
                    this._fields[gIdx+1].attr({
                        x: secColX,
                        y: curY,
                        text: customData[key]
                    });
                }
                gIdx += 2;
                curY += 5 + textHeight;
                if (curY + 10 > pH) break;
            }

            secColX = maxWidth + 10;


            for (var i = gIdx; i < this._fields.length; i++)
                this._fields[i].remove();

            this._fields.splice(gIdx, this._fields.length);

            for (var i = 1; i < this._fields.length; i = i +2)
                this._fields[i].attr({x: secColX});

            this._data.scheme._viewRendered(this);
        }
    });
    SchemeDesigner.EntryDataView = EntryDataView;

})(jQuery);
