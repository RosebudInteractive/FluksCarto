/**
 * User: kiknadze
 * Date: 01.12.2015
 * Time: 23:10
 */
(function (window) {
    if (!window.SchemeDesigner)
        window.SchemeDesigner = {};

    var DataObject = Class.extend({
        className: "DataObject",
        init: function(data, scheme) {
            this.scheme = scheme;
            if (data) this._load(data);
        },
        _load: function(data) {
            for(var propName in data) {
                if (typeof data[propName] == "array") continue;
                if (propName in this)
                    this[propName](data[propName]);
            }
        },

        _property: function(name, value) {
            if (value !== undefined) this["_" + name] = value;
            return this["_" + name];
        },

        getJSON: function() {
            return {};
        }
    });
    window.SchemeDesigner.DataObject = DataObject;

    var EntryObject = DataObject.extend({
        className: "EntryObject",
        init: function(data, scheme) {
            this._id = null;
            this._name = null;
            this._description = null;
            this._data = null;
            this._super(data, scheme);
        },

        id: function(value) {
            return this._property("id", value);
        },

        name: function(value) {
            return this._property("name", value);
        },

        description: function(value) {
            return this._property("description", value);
        },

        data: function(value) {
            return this._property("data", value);
        },

        getJSON: function() {
            var res = this._super();
            res.id = this._id;
            res.name = this._name;
            res.description = this._description;
            res.data = this._data;
            return res;
        }
    });
    window.SchemeDesigner.EntryObject = EntryObject;

    var ServiceObject = EntryObject.extend({
        className: "Service",
        init: function(data, scheme) {
            this._equipments = [];
            this._services = [];
            this._sectors = [];
            this._super(data, scheme);
        },

        _load: function(data) {
            if (!data) return;
            this._super(data);
            this._equipments = [];
            this._services = [];
            this._sectors = [];

            if (data.services) {
                var sr = data.services;
                for (var i = 0, len = sr.length; i < len; i++) {
                    var service = new SchemeDesigner.ServiceObject(sr[i], this.scheme);
                    this._services.push(service);
                }
            }
            if (data.sectors) {
                var sr = data.sectors;
                for (var i = 0, len = sr.length; i < len; i++) {
                    var sector = new SchemeDesigner.SectorObject(sr[i], this.scheme);
                    this._sectors.push(sector);
                }
            }
            if (data.equipments) {
                var eq = data.equipments;
                for (var i = 0, len = eq.length; i < len; i++) {
                    var equipment = this.scheme._getEquipment(eq[i], this.scheme);
                    if (equipment)
                        this._equipments.push(equipment);
                }
            }
        },

        equipments: function() {
            return this._equipments;
        },

        services: function() {
            return this._services;
        },

        sectors: function() {
            return this._sectors;
        },

        getSector: function(id) {
            for (var i = 0, len = this._sectors.length; i < len; i++) {
                if (id == this._sectors[i].id())
                    return this._sectors[i];
            }

            var services = this._services;
            for (i = 0, len = services.length; i < len; i++) {
                var sector = services[i].getSector(id);
                if (sector) return sector;
            }

            return null;
        },

        getJSON: function() {
            var res = this._super();
            res.services = [];
            for (var i = 0, len = this._services.length; i < len; i++)
                res.services.push(this._services[i].getJSON());
            res.sectors = [];
            for (var i = 0, len = this._sectors.length; i < len; i++)
                res.sectors.push(this._sectors[i].getJSON());
            res.equipments = [];
            for (var i = 0, len = this._equipments.length; i < len; i++)
                res.equipments.push(this._equipments[i].id());

            return res;
        }
    });
    window.SchemeDesigner.ServiceObject = ServiceObject;

    var EquipmentObject = EntryObject.extend({
        className: "Equipment",
        init: function(data, scheme) {
            this._nature = null;
            this._coordinates = null;
            this._active = null;
            this._super(data, scheme);
        },

        active: function(value) {
            return this._property("active", value);
        },

        nature: function(value) {
            return this._property("nature", value);
        },

        coordinates: function(value) {
            return this._property("coordinates", value);
        },

        getJSON: function() {
            var res = this._super();
            res.nature = this._nature;
            res.active = this._active;
            res.coordinates = this._coordinates;
            return res;
        }
    });
    window.SchemeDesigner.EquipmentObject = EquipmentObject;

    var SectorObject = EntryObject.extend({
        className: "Sector",
        init: function(data, scheme) {
            this._equipments = [];
            this._active = null;
            this._super(data, scheme);
        },

        _load: function(data) {
            if (!data) return;
            this._equipments = [];
            this._super(data);
            if (data.equipments) {
                var eq = data.equipments;
                for (var i = 0, len = eq.length; i < len; i++) {
                    var equipment = this.scheme._getEquipment(eq[i]);
                    if (equipment)
                        this._equipments.push(equipment);
                }
            }
        },

        equipments: function() {
            return this._equipments;
        },

        active: function(value) {
            return this._property("active", value);
        },

        getJSON: function() {
            var res = this._super();
            res.equipments = [];
            for (var i = 0, len = this._equipments.length; i < len; i++)
                res.equipments.push(this._equipments[i].id());
            res.active = this._active;
            return res;
        }
    });
    window.SchemeDesigner.SectorObject = SectorObject;

    var ViewObject = DataObject.extend({
        className: "View",
        init: function(data, scheme) {
            this._x = null;
            this._y = null;
            this._id = null;
            this._data = null;
            this._super(data, scheme);
        },

        id: function(value) {
            return this._property("id", value);
        },

        data: function (value) {
            return this._property("data", value);
        },

        x: function(value) {
            return this._property("x", value);
        },

        y: function(value) {
            return this._property("y", value);
        },

        getJSON: function () {
            var result = this._super();
            result.id = this._id;
            result.x = this._x;
            result.y = this._y;
            return result;
        }

    });
    window.SchemeDesigner.ViewObject = ViewObject;

    var EntryTitleViewObject = ViewObject.extend({
        className: "EntryTitleView",
        init: function(data, scheme, entry) {
            this._fontFamily = null;
            this._fontSize = null;
            this._color = null;
            this._entry = entry;
            this._super(data, scheme);
            this._bold = false;
            this._italic = false;
            this._underline = false;
            this._x = this._x == null ? 10 : this._x;
            this._y = this._y == null ? 20 : this._y;
        },

        _load: function(data) {
            if (!data) return;
            this._super(data);
        },

        fontFamily: function(value) {
            return this._property("fontFamily", value);
        },

        fontSize: function (value) {
            return this._property("fontSize", value);
        },

        color: function (value) {
            return this._property("color", value);
        },

        bold: function (value) {
            return this._property("bold", value);
        },

        italic: function (value) {
            return this._property("italic", value);
        },

        underline: function (value) {
            return this._property("underline", value);
        },

        entry: function() {
            return this._entry;
        },

        getJSON: function () {
            var result = this._super();
            result.fontFamily = this._fontFamily;
            result.fontSize = this._fontSize;
            result.color = this._color;
            result.bold = this._bold;
            result.italic = this._italic;
            result.underline = this._underline;
            return result;
        }
    });
    window.SchemeDesigner.EntryTitleViewObject = EntryTitleViewObject;

    var TitleViewObject = ViewObject.extend({
        className: "TitleView",
        init: function(data, scheme, entry) {
            this._fontFamily = null;
            this._fontSize = null;
            this._color = null;
            this._bold = false;
            this._italic = false;
            this._underline = false;
            this._text = null;
            this._super(data, scheme);
            this._x = this._x == null ? 10 : this._x;
            this._y = this._y == null ? 20 : this._y;
        },

        _load: function(data) {
            if (!data) return;
            this._super(data);
        },

        fontFamily: function(value) {
            return this._property("fontFamily", value);
        },

        fontSize: function (value) {
            return this._property("fontSize", value);
        },

        color: function (value) {
            return this._property("color", value);
        },

        bold: function (value) {
            return this._property("bold", value);
        },

        italic: function (value) {
            return this._property("italic", value);
        },

        underline: function (value) {
            return this._property("underline", value);
        },

        text: function (value) {
            return this._property("text", value);
        },

        getJSON: function () {
            var result = this._super();
            result.viewType = this.className.replace("Object", "");
            result.fontFamily = this._fontFamily;
            result.fontSize = this._fontSize;
            result.color = this._color;
            result.bold = this._bold;
            result.italic = this._italic;
            result.underline = this._underline;
            result.text = this._text;
            return result;
        }
    });
    window.SchemeDesigner.TitleViewObject = TitleViewObject;

    var EntryIconViewObject = ViewObject.extend({
        className: "EntryIconView",
        init: function(data, scheme, entry) {
            this._width = null;
            this._height = null;
            this._url = null;
            this._entry = entry;
            this._super(data, scheme);
            this._x = this._x == null ? 120 : this._x;
            this._y = this._y == null ? 15 : this._y;

        },

        _load: function(data) {
            if (!data) return;
            this._super(data);
        },

        width: function(value) {
            return this._property("width", value);
        },

        height: function(value) {
            return this._property("height", value);
        },

        url: function(value) {
            return this._property("url", value);
        },

        entry: function() {
            return this._entry;
        },

        getJSON: function () {
            var result = this._super();
            result.width = this._width;
            result.height = this._height;
            result.url = this._url;
            return result;
        }
    });
    window.SchemeDesigner.EntryIconViewObject = EntryIconViewObject;

    var EquipmentViewObject = ViewObject.extend({
        className: "EquipmentView",
        init: function(data, scheme) {
            this._width = null;
            this._height = null;
            this._title = null;
            this._background = null;
            this._stroke = null;
            this._super(data, scheme);
        },

        _load: function(data) {
            if (!data) return;
            this._super(data);
            this._data = this.scheme._getEquipment(data.equipment);
            this._title = new EntryTitleViewObject(data.title, this.scheme, this._data);
            this._icon = new EntryIconViewObject(data.icon, this.scheme, this._data);
        },

        width: function(value) {
            return this._property("width", value);
        },

        height: function(value) {
            return this._property("height", value);
        },

        title: function(value) {
            return this._property("title", value);
        },

        icon: function(value) {
            return this._property("icon", value);
        },

        background: function(value) {
            return this._property("background", value);
        },

        stroke: function(value) {
            return this._property("stroke", value);
        },

        getJSON: function () {
            var result = this._super();
            result.viewType = this.className.replace("Object", "");
            result.width = this._width;
            result.height = this._height;
            result.background = this._background;
            result.stroke = this._stroke;
            result.equipment = this._data.id();
            result.title = this._title.getJSON();
            result.icon = this._icon.getJSON();
            return result;
        }
    });
    window.SchemeDesigner.EquipmentViewObject = EquipmentViewObject;

    var SchemeViewObject = DataObject.extend({
        className: "SchemeView",
        init: function(data, scheme) {
            this._backgroundImage = null;
            this._background = null;
            this._cursor = null;
            this._views = [];
            this._super(data, scheme);
        },

        views: function() {
            return this._views;
        },

        backgroundImage: function(value) {
            return this._property("backgroundImage", value);
        },

        background: function(value) {
            return this._property("background", value);
        },

        cursor: function(view) {
            if (view !== undefined)
                this._cursor = view;
            return this._cursor;
        },

        _load: function(data) {
            if (!data) return;
            this._super(data, this.scheme);
            this._views = [];
            if (data.views) {
                var vs = data.views;
                for (var i = 0, len = vs.length; i < len; i++) {
                    var v = vs[i];
                    if (v.viewType + "Object" in window.SchemeDesigner) {
                        var vo = new window.SchemeDesigner[v.viewType  + "Object"](v, this.scheme);
                        this._views.push(vo);
                    }
                }
            }
        },

        getJSON: function() {
            var result = this._super();
            result.backgroundImage = this._backgroundImage;
            result.background = this._background;
            result.views = [];
            for (var i = 0; i < this._views.length; i++) {
                result.views.push(this._views[i].getJSON());
            }
            return result;
        }
    });
    window.SchemeDesigner.SchemeViewObject = SchemeViewObject;

    var LineViewObject = ViewObject.extend({
        className: "LineView",
        init: function(data, scheme) {
            this._points = [];
            this._background = null;
            this._width = null;
            this._super(data, scheme);
        },

        _load: function(data) {
            if (!data) return;
            this._super(data);
        },

        points: function (value) {
            return this._property("points", value);
        },

        background: function (value) {
            return this._property("background", value);
        },

        width: function (value) {
            return this._property("width", value);
        },

        getJSON: function() {
            var result = this._super();
            result.viewType = this.className.replace("Object", "");
            result.background = this._background;
            result.points = this._points;
            result.width = this._width;
            return result;
        }
    });
    window.SchemeDesigner.LineViewObject = LineViewObject;

    var PolygonViewObject = ViewObject.extend({
        className: "PolygonView",
        init: function(data, scheme) {
            this._points = [];
            this._background = null;
            this._sector = null;
            this._stroke = null;
            this._super(data, scheme);
        },

        _load: function(data) {
            if (!data) return;
            this._super(data);
            this._sector = this.scheme._getSector(data.sector);
        },

        sector: function (value) {
            return this._property("sector", value);
        },

        points: function (value) {
            return this._property("points", value);
        },

        background: function (value) {
            return this._property("background", value);
        },

        stroke: function (value) {
            return this._property("stroke", value);
        },

        getJSON: function() {
            var result = this._super();
            result.points = this._points;
            result.viewType = this.className.replace("Object", "");
            result.stroke = this._stroke;
            result.background = this._background;
            result.sector = this._sector ? this._sector.id() : null;
            return result;
        }
    });
    window.SchemeDesigner.PolygonViewObject = PolygonViewObject;

    var SectorViewObject = ViewObject.extend({
        className: "SectorView",
        init: function(data, scheme) {
            this._width = null;
            this._height = null;
            this._title = null;
            this._background = null;
            this._stroke = null;
            this._super(data, scheme);
        },

        _load: function(data) {
            if (!data) return;
            this._super(data);
            this._data = this.scheme._getSector(data.sector);
            this._title = new EntryTitleViewObject(data.title, this.scheme, this._data);
        },

        width: function(value) {
            return this._property("width", value);
        },

        height: function(value) {
            return this._property("height", value);
        },

        title: function(value) {
            return this._property("title", value);
        },

        background: function(value) {
            return this._property("background", value);
        },

        stroke: function(value) {
            return this._property("stroke", value);
        },

        getJSON: function () {
            var result = this._super();
            result.viewType = this.className.replace("Object", "");
            result.width = this._width;
            result.height = this._height;
            result.background = this._background;
            result.stroke = this._stroke;
            result.sector = this.data().id();
            result.title = this._title.getJSON();
            return result;
        }
    });
    window.SchemeDesigner.SectorViewObject = SectorViewObject;
})(window);
