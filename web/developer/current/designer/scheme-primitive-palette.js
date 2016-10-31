/**
 * User: kiknadze
 * Date: 01.12.2015
 * Time: 17:36
 */

(function($){
    $.widget( "custom.schemePrimitivePalette", {
        options: {
            //propMode: "none"   //"text" | "figure" | "none" | null
        },
        _create: function() {
            this._mode = "pointer";
            this.options.propMode |=  "none";
            var el = $('<div class="tool-panel primitives">'+
                '<div class="icon pointer active" role="pointer" title="Select mode"><div/></div>'+
                '<div class="icon polygon" role="polygon" title="Draw polygon"><div/></div>'+
                '<div class="icon line" role="line" title="Draw line"><div/></div>'+
                '<div class="icon text" role="text" title="Add label"><div/></div>'+
                '</div>');
            this.element.append(el);

            el = $('<div class="tool-panel" role="text-props">' +
                '    <div class="tool-panel-control">'+
                '        <select role="font-family">'+
                '        </select>'+
                '    </div>'+
                '    <div class="tool-panel-control">'+
                '        <select role="text-size">'+
                '           <option value="8">8pt</option>'+
                '           <option value="10">10pt</option>'+
                '           <option value="12" selected>12pt</option>'+
                '           <option value="14">14pt</option>'+
                '           <option value="16">16pt</option>'+
                '           <option value="18">18pt</option>'+
                '           <option value="20">20pt</option>'+
                '           <option value="22">22pt</option>'+
                '           <option value="24">24pt</option>'+
                '           <option value="26">26pt</option>'+
                '           <option value="28">28pt</option>'+
                '       </select>'+
                '    </div>'+
                '    <div class="tool-panel-control">' +
                '       <div class="label">Color</div>'+
                '    </div>'+
                '    <div class="tool-panel-control">' +
                '        <input class="color-picker" role="text-color" type="text"/>' +
                '    </div>'+
                '<div class="icon bold toggle-button" role="text-bold"><div/></div>'+
                '<div class="icon italic toggle-button" role="text-italic"><div/></div>'+
                '<div class="icon underline toggle-button" role="text-underline"><div/></div>'+
                '    <div class="tool-panel-control">' +
                '        <input class="text" role="text" type="text"/>' +
                '    </div>'+
                '</div>');
            this.element.append(el);

            el = $('<div class="tool-panel" role="figure-props">'+
                '    <div class="tool-panel-control">' +
                '       <div class="label">Fill</div>'+
                '    </div>'+
                '    <div class="tool-panel-control">' +
                '        <input role="fill-color" class="color-picker" type="text"/>' +
                '    </div>'+
                '    <div class="tool-panel-control">' +
                '       <div class="label">Border</div>'+
                '    </div>'+
                '    <div class="tool-panel-control">' +
                '        <input role="border-color" class="color-picker" type="text"/>' +
                '    </div>'+
                '    <div class="tool-panel-control">' +
                '       <div class="label">Width</div>'+
                '    </div>'+
                '    <div class="tool-panel-control">' +
                '        <input role="line-width" class="text" type="number" style="width: 25px"/>' +
                '    </div>'+
                '</div>');
            this.element.append(el);

            el = $('<div class="tool-panel" role="scheme-props">'+
                '    <div class="icon zoom-in" role="zoom-in"><div/></div>'+
                '    <div class="icon zoom-out" role="zoom-out"><div/></div>'+
                '    <div class="icon delete"><div/></div>'+
                '    <div class="icon toggle-button layer show-sector" role="show-sector" title="Show sectors"><div/></div>'+
                '    <div class="icon toggle-button layer show-graphic" role="show-graphic" title="Show graphic"><div/></div>'+
                '    <div class="icon toggle-button layer show-equipments" role="show-equipments" title="Show equipments"><div/></div>'+
                '</div>');
            this.element.append(el);

            var that = this;
            this.element.find(".primitives .icon").click(function () {
                that._onPrimitiveClick($(this));
            });
            this.element.find(".delete.icon").click(function () {
                if ($(this).hasClass("disabled")) return;
                that._onDeleteClick($(this));
            });

            this.element.find("input.color-picker").ColorPicker({
                    onSubmit: function(hsb, hex, rgb, el) {
                        $(el).val(hex);
                        $(el).ColorPickerHide();

                        var role = $(el).attr("role");
                        that._trigger("palettePropChanged", null, {property: role, value: hex})
                    },
                    onBeforeShow: function () {
                        $(this).ColorPickerSetColor(this.value);
                    }
                })
                .bind('keyup', function(e){
                    $(this).ColorPickerSetColor(this.value);
                    if (e.which == 13) {
                        var role = $(this).attr("role");
                        that._trigger("palettePropChanged", null, {property: role, value: $(this).val()})
                    }
                });

            this.element.find("[role='text-size'], [role='font-family']").change(function(e) {
                var role = $(this).attr("role");
                that._trigger("palettePropChanged", null, {property: role, value: $(this).val()})
            });
            this.element.find("[role='zoom-in'], [role='zoom-out']").click(function() {
                var role = $(this).attr("role");
                that._trigger("palettePropChanged", null, {property: "zoom", value: (role == "zoom-in")?1:-1});
                return false;
            });

                this.element.find("[role='text'], [role='line-width'], [role='background-url']").change(function(e) {
                var role = $(this).attr("role");
                var val = $(this).val();
                if (role == "line-width") {
                    if (!$.isNumeric(val)) return;
                    if (val <= 0) {
                        val = 1;
                        $(this).val(val);
                    }
                }
                that._trigger("palettePropChanged", null, {property: role, value: val})
            });

            var ff = this.element.find("[role='font-family']");
            var det = new Detector();
            var fList = det.getAll();
            for (var i = 0; i < fList.length; i++)
                ff.append($('<option value="' + fList[i] + '" style="font-family: ' + fList[i] + '">' + fList[i] + '</option></optgroup>'));

            this.element.find(".toggle-button").click(function() {
                $(this).toggleClass("pressed");
                var role = $(this).attr("role");

                that._trigger("palettePropChanged", null, {property: role, value: $(this).hasClass("pressed")});
            });

            this.element.find(".url-dialog").hide();
            this.element.find(".icon.background-url").click(function () {
                $(this).find(".url-dialog").show();
            });
            var that = this;
            this.element.find(".icon.background-url").find("input[type='button']").click(function () {
                that.element.find(".icon.background-url").find(".url-dialog").hide();
                return false;
            });
        },

        _onPrimitiveClick: function(icon) {
            this.element.find(".primitives .icon").removeClass("active");
            icon.addClass("active");
            this._mode = icon.attr("role");
        },

        _onDeleteClick: function() {
            this._trigger("onDelete");
        },

        mode: function(value) {
            if (value) {
                this.element.find(".primitives .icon").removeClass("active");
                var active = this.element.find(".primitives .icon[role='"+value+"']");
                active.addClass("active");
                if (active.length > 0)
                    this._mode = value;
            }
            return this._mode;
        },

        propMode: function(value) {
            value = value ||"none";
            if (value !==  "text" && value !== "figure" && value !== "none" &&
                value !== "text-edit" && value !== "line")
                value = "none";
            this._setPropertiesMode(value);
        },

        canDelete: function(value) {
            var el = this.element.find(".delete.icon");
            if (value) el.removeClass("disabled");
            else el.addClass("disabled");
            el.prop("disabled", !value);
        },

        setPropValues: function(data) {
            if (!data) return;

            for (var item in data) {
                var ctrl = this.element.find("[role='" + item + "']");
                if (ctrl.length > 0) {
                    if (item == "fill-color" || item == "border-color" || item == "text-color" || item == "text" ||
                        item == "line-width" || item == "back-color" || item == "scale" || item == "background-url")
                        ctrl.val(data[item]);
                    else if (item == "font-family" || item == "text-size") {
                        ctrl.val(data[item]);
                    } else if (item == "text-bold" || item == "text-italic" || item == "text-underline" ||
                        item == "show-sector" || item == "show-graphic" || item == "show-equipments") {
                        if (data[item]) ctrl.addClass("pressed");
                        else ctrl.removeClass("pressed");
                    }

                }
            }
        },

        /**
         * set visibility for properties buttons
         * @param value {string} - "text" | "figure" | "none"
         */
        _setPropertiesMode: function(value) {
            if (value == "none") {
                this.element.children("[role='text-props'], [role='figure-props']").hide();
            } else if (value == "text" || value == "text-edit") {
                this.element.children("[role='text-props']").show();
                this.element.children("[role='figure-props']").hide();
                if (value == "text")
                    this.element.children("[role='text-props']").find(".tool-panel-control input.text").parent().hide();
                else
                    this.element.children("[role='text-props']").find(".tool-panel-control input.text").parent().show();
            } else if (value == "figure" || value == "line") {
                this.element.children("[role='text-props']").hide();
                this.element.children("[role='figure-props']").show();
                if (value == "line") {
                    this.element.find("[role='border-color']").parent().hide();
                    this.element.find("[role='border-color']").parent().prev().hide();

                    this.element.find("[role='line-width']").parent().show();
                    this.element.find("[role='line-width']").parent().prev().show();
                } else {
                    this.element.find("[role='border-color']").parent().show();
                    this.element.find("[role='border-color']").parent().prev().show();

                    this.element.find("[role='line-width']").parent().hide();
                    this.element.find("[role='line-width']").parent().prev().hide();
                }
            }
        }
    });
})(jQuery);

