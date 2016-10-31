(function () {
    $(document).ready(function() {
        $(window).resize(function() {
            $(".demo-container").height($(window).height());
        });
        $(".demo-container").height($(window).height());
//        $(".demo-container").width($(window).width());

        var view = $("#widget-container").mapView({
            designMode: true,
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
            view.mapView("loadData", j);
            view.mapView("render");
        });
        $("#export-btn").click(function() {
            var obj = view.mapView("getJSON", true);
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
            view.mapView("setEquipmentData", id, data);
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
            view.mapView("setSectorData", id, data);
        });

        $("#design-mode").click(function () {
            var val = $(this).prop("checked") || false;
            view.mapView("option", "designMode", val);
        });
        $("#save-png-browser").click(function () {
            view.mapView("savePNG");
        });
        $("#save-png-callback").click(function () {
            view.mapView("savePNG", function(image) {
                console.log(image);
            });
        });
    });
})();
