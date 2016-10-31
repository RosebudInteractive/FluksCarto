/**
 * User: kiknadze
 * Date: 01.12.2015
 * Time: 13:20
 */

(function () {
    $(document).ready(function() {
        $(window).resize(function() {
            $(".demo-container").height($(window).height());
        });
        $(".demo-container").height($(window).height());

        var view = $("#widget-container").synopticView({
            designMode: true,
            css: "designer/css/picture.css",
            onSave: function (e, data) {
                console.log("onSave", arguments);
                setTimeout(function() {
                    // some custom code which must be executed for saving data
                    data.callback(true);
                }, 0);
                return false;
            },
            onClick: function() {
                console.log("onClick", arguments);
            },
            onRender: function() {
                console.log("onRender", arguments);
            }
        });

        $("#example-text").val(JSON.stringify(window["ex3"]));
        $("#select-example").change(function () {
            var valueSelected = this.value;
            $("#example-text").val(JSON.stringify(window[valueSelected]));
        });

        $("#import-btn").click(function() {
            var j = JSON.parse($("#example-text").val());
            view.synopticView("loadData", j);
            view.synopticView("render");
        });
        $("#export-btn").click(function() {
            var obj = view.synopticView("getJSON", true);
            var str = JSON.stringify(obj);
            $("#example-text").val(str);
        });


        var d = {
            Property1: "value 1",
            Property2: "value 2",
            Property3: "value 3"
        };
        $("#equipment-id").val("10");
        $("#equipment-data-text").val(JSON.stringify(d));
        $("#equipment-data-btn").click(function () {
            var id = $("#equipment-id").val();
            var data = JSON.parse($("#equipment-data-text").val());
            view.synopticView("setEquipmentData", id, data);
        });

        var sd = {
            "Sector Prop 1": "value 1",
            "Sector Prop 2": "value 2",
            "Sector Prop 3": "value 3"
        };
        $("#sector-id").val("s1");
        $("#sector-data-text").val(JSON.stringify(sd));
        $("#sector-data-btn").click(function () {
            var id = $("#sector-id").val();
            var data = JSON.parse($("#sector-data-text").val());
            view.synopticView("setSectorData", id, data);
        });

        $("#design-mode").click(function () {
            var val = $(this).prop("checked") || false;
            view.synopticView("option", "designMode", val);
        });
        $("#save-png-browser").click(function () {
            view.synopticView("savePNG");
        });
        $("#save-png-callback").click(function () {
            view.synopticView("savePNG", function(image) {
                console.log(image);
            });
        });
    });
})();