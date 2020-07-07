ClientGrid.combo.Columns = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/columns/getlist',
            grid        : config.grid,
            combo       : true
        },
        fields      : ['id', 'name'],
        hiddenName  : 'column_id',
        pageSize    : 15,
        valueField  : 'id',
        displayField : 'name'
    });

    ClientGrid.combo.Columns.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.Columns, MODx.combo.ComboBox);

Ext.reg('clientgrid-combo-columns', ClientGrid.combo.Columns);

ClientGrid.combo.Fields = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/fields/getlist',
            grid        : config.grid,
            combo       : true
        },
        fields      : ['id', 'key', 'name'],
        hiddenName  : 'field_id',
        pageSize    : 15,
        valueField  : 'id',
        displayField : 'name',
        tpl         : new Ext.XTemplate('<tpl for=".">' +
            '<div class="x-combo-list-item">' +
                '{name:htmlEncode} <em>({key:htmlEncode})</em>' +
            '</div>' +
        '</tpl>')
    });

    ClientGrid.combo.Fields.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.Fields, MODx.combo.ComboBox);

Ext.reg('clientgrid-combo-fields', ClientGrid.combo.Fields);

ClientGrid.combo.Tabs = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/tabs/getlist',
            grid        : config.grid,
            combo       : true
        },
        fields      : ['id', 'name'],
        hiddenName  : 'tab_id',
        pageSize    : 15,
        valueField  : 'id',
        displayField : 'name'
    });

    ClientGrid.combo.Tabs.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.Tabs, MODx.combo.ComboBox);

Ext.reg('clientgrid-combo-tabs', ClientGrid.combo.Tabs);

ClientGrid.combo.SortDir = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        store   : new Ext.data.ArrayStore({
            mode    : 'local',
            fields  : ['id', 'label'],
            data    : [
                ['ASC', _('clientgrid.sort_dir_asc')],
                ['DESC', _('clientgrid.sort_dir_desc')],
            ]
        }),
        remoteSort  : ['label', 'asc'],
        hiddenName  : 'sort_dir',
        valueField  : 'id',
        displayField : 'label',
        mode        : 'local'
    });

    ClientGrid.combo.SortDir.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.SortDir, MODx.combo.ComboBox);

Ext.reg('clientgrid-combo-sort-dir', ClientGrid.combo.SortDir);

ClientGrid.combo.Sortable = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        store   : new Ext.data.ArrayStore({
            mode    : 'local',
            fields  : ['id', 'label'],
            data    : [
                [0, _('no')],
                [1, _('yes')]
            ]
        }),
        remoteSort  : ['label', 'asc'],
        hiddenName  : 'sortable',
        valueField  : 'id',
        displayField : 'label',
        mode        : 'local'
    });

    ClientGrid.combo.Sortable.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.Sortable, MODx.combo.ComboBox);

Ext.reg('clientgrid-combo-sortable', ClientGrid.combo.Sortable);

ClientGrid.combo.FieldTypes = function(config) {
    config = config || {};

    var data = [];

    Ext.iterate(ClientGrid.config.xtypes, function(key, xtype) {
        data.push([key, xtype.name, xtype.type || 'custom', xtype.fields || []]);
    });

    Ext.applyIf(config, {
        store       : new Ext.data.ArrayStore({
            mode        : 'local',
            fields      : ['id', 'name', 'xtype', 'fields'],
            data        : data
        }),
        remoteSort  : ['label', 'asc'],
        hiddenName  : 'xtype',
        valueField  : 'id',
        displayField : 'name',
        mode        : 'local',
        value       : 'textfield'
    });

    ClientGrid.combo.FieldTypes.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.FieldTypes, MODx.combo.ComboBox, {
    getRecordValue: function() {
        return this.store.getAt(this.store.find(this.valueField, this.getValue()));
    }
});

Ext.reg('clientgrid-combo-xtype', ClientGrid.combo.FieldTypes);

ClientGrid.combo.ColumnRenders = function(config) {
    config = config || {};

    var data = [];

    Ext.iterate(ClientGrid.config.renders, function(render, label) {
        data.push([render, label]);
    });

    Ext.applyIf(config, {
        store       : new Ext.data.ArrayStore({
            mode        : 'local',
            fields      : ['render', 'label'],
            data        : data
        }),
        remoteSort  : ['label', 'asc'],
        hiddenName  : 'render',
        valueField  : 'render',
        displayField : 'label',
        mode        : 'local',
        value       : ''
    });

    ClientGrid.combo.ColumnRenders.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.ColumnRenders, MODx.combo.ComboBox);

Ext.reg('clientgrid-combo-renders', ClientGrid.combo.ColumnRenders);

ClientGrid.combo.Values = function(config) {
    config = config || {};

    var id = Ext.id();

    Ext.applyIf(config, {
        id          : config.id || id,
        cls         : 'clientgrid-extra-combo',
        layout      : 'form',
        labelSeparator  : '',
        items       : [{
            xtype       : 'hidden',
            name        : config.name || 'values',
            id          : (config.id || id) + '-value',
            value       : config.value || '[]',
            anchor      : '100%'
        }],
        listeners   : {
            afterrender : {
                fn          : this.decodeData,
                scope       : this
            }
        }
    });

    ClientGrid.combo.Values.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.Values, MODx.Panel, {
    decodeData: function() {
        var textfield = Ext.getCmp(this.config.id + '-value');

        if (textfield) {
            var data = Ext.decode(textfield.getValue() || '[]');

            if (data && data.length >= 1) {
                for (var i = 0; i < data.length; i++) {
                    this.addElement(i + 1, data[i]);
                }
            } else {
                this.addElement(1, {});
            }
        }
    },
    encodeData: function() {
        var textfield = Ext.getCmp(this.config.id + '-value');

        if (textfield) {
            var data = [];
            var values = {
                value : [],
                label : []
            };

            this.findByType('textfield').forEach(function(element) {
                if (element.xtype === 'textfield') {
                    values[element.type].push(element.getValue());
                }
            });

            values.value.forEach(function(value, index) {
                data.push({
                    value : value,
                    label : values.label[index] || ''
                });
            });

            textfield.setValue(Ext.encode(data));
        }
    },
    addElement: function(index, data) {
        this.insert(index, this.getElement(index, data));
        this.doLayout();

        this.encodeData();
    },
    removeElement: function(index) {
        this.remove(index);
        this.doLayout();

        this.encodeData();
    },
    getElement: function(index, data) {
        var id = Ext.id();

        var nextBtn = {
            xtype       : 'box',
            autoEl      : {
                tag         : 'a',
                html        : '<i class="icon icon-plus"></i>',
                cls         : 'x-btn x-btn-clientgrid',
                current     : this.config.id + '-' + id
            },
            listeners   : {
                render      : {
                    fn          : function(button) {
                        button.getEl().on('click', (function(event) {
                            var index = this.items.findIndexBy(function(item) {
                                return item.id === button.autoEl.current;
                            });

                            this.addElement(index + 1, {});
                        }).bind(this));
                    },
                    scope       : this
                }
            }
        };

        var prevBtn = {
            xtype       : 'box',
            autoEl      : {
                tag         : 'a',
                html        : '<i class="icon icon-minus"></i>',
                cls         : 'x-btn x-btn-clientgrid',
                current     : this.config.id + '-' + id
            },
            listeners   : {
                render      : {
                    fn          : function(button) {
                        button.getEl().on('click', (function(event) {
                            var index = this.items.findIndexBy(function(item) {
                                return item.id === button.autoEl.current;
                            });

                            this.removeElement(index);
                        }).bind(this));
                    },
                    scope       : this
                }
            }
        };

        return {
            layout      : 'column',
            id          : this.config.id + '-' + id,
            cls         : 'clientgrid-extra-combo-item',
            defaults    : {
                layout      : 'form',
                hideLabels  : true
            },
            items       : [{
                columnWidth : .42,
                items       : [{
                    xtype       : 'textfield',
                    anchor      : '100%',
                    emptyText   : _('clientgrid.value'),
                    type        : 'value',
                    value       : data.value || '',
                    listeners   : {
                        blur        : {
                            fn          : this.encodeData,
                            scope       : this
                        }
                    }
                }]
            }, {
                columnWidth : .42,
                items       : [{
                    xtype       : 'textfield',
                    anchor      : '100%',
                    emptyText   : _('clientgrid.label'),
                    type        : 'label',
                    value       : data.label || '',
                    listeners   : {
                        blur        : {
                            fn          : this.encodeData,
                            scope       : this
                        }
                    }
                }]
            }, {
                columnWidth : .16,
                items       : index === 1 ? [nextBtn] : [nextBtn, prevBtn]
            }]
        };
    }
});

Ext.reg('clientgrid-combo-values', ClientGrid.combo.Values);
