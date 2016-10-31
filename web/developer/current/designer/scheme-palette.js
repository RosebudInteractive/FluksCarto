/**
 * User: kiknadze
 * Date: 01.12.2015
 * Time: 17:17
 */
(function($){
    $.widget( "custom.schemePalette", {
            options: {

            },
            _create: function() {
                this._dataIndex = {};
                var that = this;
                var el = $('<div class="palette-container"><div class="palette-header">'+
                    '<div class="palette-header-control"><input type="button" value="Hide"/></div>'+
                    '</div>'+
                    '<div class="palette-tree"><div/></div></div>');
                this.element.append(el);
                this._treeEl = this.element.find(".palette-tree").children().jstree({
                    'core': {
                        'themes': {'dots': false},
                        'check_callback': true,
                        "check_callback" : function(operation, node, node_parent, node_position, more) {
                            if (operation == 'move_node') {
                                return false;
                            }
                        }
                    },
                    "plugins": ["dnd", "crrm"],
                    "dnd": {
                        "is_draggable": function(nodes) {
                            if (nodes.length == 0) return false;
                            return that._trigger("onCanDrag", null, nodes[0].data);
                        }
                    }
                }).on("move_node.jstree", function(event, data) {
                    return false;
                });
                $(document).on('dnd_start.vakata',function(event,data){
                    if (!data.data.nodes || data.data.nodes.length == 0) return;
                    var node = that._treeEl.jstree("get_node", data.data.nodes[0]);
                    that._trigger("startDrag", event, node.data);
                }).on("dnd_stop.vakata", function(event,data) {
                    if (!data.data.nodes || data.data.nodes.length == 0) return;
                    var node = that._treeEl.jstree("get_node", data.data.nodes[0]);
                    that._trigger("stopDrag", event, {
                        data: node.data,
                        x: data.event.offsetX,
                        y: data.event.offsetY,
                        originalEvent: data.event
                    });
                }).on("dnd_move.vakata", function(event,data) {
                    if (!data.data.nodes || data.data.nodes.length == 0) return;
                    var t = $(data.event.target);
                    if(!t.closest('.jstree').length) {
                        var node = that._treeEl.jstree("get_node", data.data.nodes[0]);
                        if(t.closest('div').length && that._trigger("moveDrag", event, node.data)) {
                            data.helper.find('.jstree-icon').removeClass('jstree-er').addClass('jstree-ok');
                        }
                        else {
                            data.helper.find('.jstree-icon').removeClass('jstree-ok').addClass('jstree-er');
                        }
                    }
                });
            },

            loadData: function(data, openAll) {
                this._nodeEnumerator = 0;
                this._dataIndex = {};

                var root = this._treeEl.jstree("get_node", "#");
                if (root.children) {
                    for (var i = 0; i < root.children.length; i++)
                        this._treeEl.jstree("delete_node", root.children[i]);
                }

                var treeData = [];
                for (var i = 0, len = data.services.length; i < len; i++) {
                    treeData.push(this._prepareData(data.services[i]));
                }

                for (var i = 0, len = treeData.length; i < len; i++) {
                    this._treeEl.jstree('create_node', "#", treeData[i]);
                    this._treeEl.jstree("open_node", "#");
                }
                if (openAll)
                    this._treeEl.jstree('open_all');
            },

            _prepareData: function(node) {
                var n = {};
                n.id = this._nodeEnumerator++;
                n.text = node.name();
                n.data = node;
                n.data = node;
                if (!this._dataIndex[node.id()])
                    this._dataIndex[node.id()] = [];
                this._dataIndex[node.id()].push(n.id);
                if (node.className == "Equipment") n.children = false;
                else if (node.className == "Sector") {
                    var equipments = node.equipments();
                    if (equipments.length == 0) n.children = false;
                    else {
                        n.children = [];
                        for (var i = 0, len = equipments.length; i < len; i++)
                            n.children.push(this._prepareData(equipments[i]));
                    }
                } else {
                    var equipments = node.equipments();
                    var sectors = node.sectors();
                    var services = node.services();
                    if (equipments.length == 0 && sectors.length == 0 && services.length == 0) n.children = false;
                    else {
                        n.children = [];
                        for (var i = 0, len = services.length; i < len; i++)
                            n.children.push(this._prepareData(services[i]))
                        for (var i = 0, len = sectors.length; i < len; i++)
                            n.children.push(this._prepareData(sectors[i]))
                        for (var i = 0, len = equipments.length; i < len; i++)
                            n.children.push(this._prepareData(equipments[i]))
                    }
                }

                return n;
            },

            disableUsedNodes: function(data) {
                this._treeEl.find(".jstree-node").each(function() {
                    $(this).removeClass("used-node");
                });

                for (var i = 0, len = data.length; i < len; i++) {
                    var id = data[i].id();
                    var nodeIds = this._dataIndex[id];
                    for (var j = 0; j < nodeIds.length; j++) {
                        $("#" + nodeIds[j]).addClass("used-node");
                    }
                }
            }
        }
    );
})(jQuery);
