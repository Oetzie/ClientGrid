ClientGrid.grid.Columns = function(config) {
    config = config || {};

    config.tbar = [{
        text        : _('clientgrid.column_create'),
        cls         : 'primary-button',
        handler     : this.createColumn,
        scope       : this
    }, '->', {
        xtype       : 'textfield',
        name        : 'clientgrid-filter-columns-search',
        id          : 'clientgrid-filter-columns-search',
        emptyText   : _('search') + '...',
        listeners   : {
            'change'    : {
                fn          : this.filterSearch,
                scope       : this
            },
            'render'    : {
                fn          : function(cmp) {
                    new Ext.KeyMap(cmp.getEl(), {
                        key     : Ext.EventObject.ENTER,
                        fn      : this.blur,
                        scope   : cmp
                    });
                },
                scope       : this
            }
        }
    }, {
        xtype       : 'button',
        cls         : 'x-form-filter-clear',
        id          : 'clientgrid-filter-columns-clear',
        text        : _('filter_clear'),
        listeners   : {
            'click'     : {
                fn          : this.clearFilter,
                scope       : this
            }
        }
    }];

    var columns = new Ext.grid.ColumnModel({
        columns     : [{
            header      : _('clientgrid.label_column_name'),
            dataIndex   : 'name',
            sortable    : true,
            editable    : false,
            width       : 250
        }, {
            header      : _('clientgrid.label_column_render'),
            dataIndex   : 'render',
            sortable    : true,
            editable    : false,
            width       : 200,
            fixed       : true,
            renderer    : this.renderRender
        }, {
            header      : _('clientgrid.label_column_active'),
            dataIndex   : 'active',
            sortable    : false,
            editable    : true,
            width       : 100,
            fixed       : true,
            renderer    : this.renderBoolean,
            editor      : {
                xtype       : 'modx-combo-boolean'
            }
        }, {
            header      : _('last_modified'),
            dataIndex   : 'editedon',
            sortable    : true,
            editable    : false,
            fixed       : true,
            width       : 200,
            renderer    : this.renderDate
        }]
    });
    
    Ext.applyIf(config, {
        cm          : columns,
        id          : 'clientgrid-grid-columns',
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/columns/getlist',
            grid        : config.record.id
        },
        autosave    : true,
        save_action : 'mgr/grids/columns/updatefromgrid',
        fields      : ['id', 'grid_id', 'field_id', 'name', 'render', 'fixed', 'width', 'active', 'menuindex', 'editedon'],
        paging      : true,
        pageSize    : MODx.config.default_per_page > 30 ? MODx.config.default_per_page : 30,
        sortBy      : 'menuindex',
        enableDragDrop : true,
        ddGroup     : 'clientgrid-grid-columns'
    });

    ClientGrid.grid.Columns.superclass.constructor.call(this, config);

    this.on('afterrender', this.sortColumns, this);
};

Ext.extend(ClientGrid.grid.Columns, MODx.grid.Grid, {
    filterSearch: function(tf, nv, ov) {
        this.getStore().baseParams.query = tf.getValue();
        
        this.getBottomToolbar().changePage(1);
    },
    clearFilter: function() {
        this.getStore().baseParams.query = '';
        
        Ext.getCmp('clientgrid-filter-columns-search').reset();
        
        this.getBottomToolbar().changePage(1);
    },
    getMenu: function() {
        return [{
            text    : '<i class="x-menu-item-icon icon icon-edit"></i>' + _('clientgrid.column_update'),
            handler : this.updateColumn,
            scope   : this
        }, '-', {
            text    : '<i class="x-menu-item-icon icon icon-times"></i>' + _('clientgrid.column_remove'),
            handler : this.removeColumn,
            scope   : this
        }];
    },
    sortColumns: function() {
        new Ext.dd.DropTarget(this.getView().mainBody, {
            ddGroup     : this.config.ddGroup,
            notifyDrop  : function(dd, e, data) {
                var index = dd.getDragData(e).rowIndex;

                if (undefined !== index) {
                    for (var i = 0; i < data.selections.length; i++) {
                        data.grid.getStore().remove(data.grid.getStore().getById(data.selections[i].id));
                        data.grid.getStore().insert(index, data.selections[i]);
                    }

                    var order = [];

                    Ext.each(data.grid.getStore().data.items, (function(record) {
                        order.push(record.id);
                    }).bind(this));

                    MODx.Ajax.request({
                        url         : ClientGrid.config.connector_url,
                        params      : {
                            action      : 'mgr/columns/sort',
                            sort        : order.join(',')
                        },
                        listeners   : {
                            'success'   : {
                                fn          : function() {

                                },
                                scope       : this
                            }
                        }
                    });
                }
            }
        });
    },
    createColumn: function(btn, e) {
        if (this.createColumnWindow) {
            this.createColumnWindow.destroy();
        }

        var record = {
            grid_id : this.record.id
        };

        this.createColumnWindow = MODx.load({
            xtype       : 'clientgrid-window-column-create',
            record      : record,
            closeAction : 'close',
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });

        this.createColumnWindow.setValues(record);
        this.createColumnWindow.show(e.target);
    },
    updateColumn: function(btn, e) {
        if (this.updateColumnWindow) {
            this.updateColumnWindow.destroy();
        }
        
        this.updateColumnWindow = MODx.load({
            xtype       : 'clientgrid-window-column-update',
            record      : this.menu.record,
            closeAction : 'close',
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });
        
        this.updateColumnWindow.setValues(this.menu.record);
        this.updateColumnWindow.show(e.target);
    },
    removeColumn: function() {
        MODx.msg.confirm({
            title       : _('clientgrid.column_remove'),
            text        : _('clientgrid.column_remove_confirm'),
            url         : ClientGrid.config.connector_url,
            params      : {
                action      : 'mgr/grids/columns/remove',
                id          : this.menu.record.id
            },
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });
    },
    renderRender: function(d, c) {
        if (ClientGrid.config.renders[d]) {
            return ClientGrid.config.renders[d];
        }

        return '';
    },
    renderBoolean: function(d, c) {
        c.css = parseInt(d) === 1 || d ? 'green' : 'red';

        return parseInt(d) === 1 || d ? _('yes') : _('no');
    },
    renderDate: function(a) {
        if (Ext.isEmpty(a)) {
            return '—';
        }
        
        return a;
    }
});

Ext.reg('clientgrid-grid-columns', ClientGrid.grid.Columns);

ClientGrid.window.CreateColumn = function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
        autoHeight  : true,
        title       : _('clientgrid.column_create'),
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/columns/create'
        },
        fields      : [{
            xtype       : 'hidden',
            name        : 'grid_id'
        }, {
            layout      : 'column',
            defaults    : {
                layout      : 'form',
                labelSeparator : ''
            },
            items       : [{
                columnWidth : .8,
                items       : [{
                    xtype       : 'clientgrid-combo-fields',
                    fieldLabel  : _('clientgrid.label_column_field'),
                    description : MODx.expandHelp ? '' : _('clientgrid.label_column_field_desc'),
                    name        : 'field_id',
                    anchor      : '100%',
                    allowBlank  : false,
                    grid        : config.record.grid_id,
                    listeners   : {
                        select      : {
                            fn          : function(tf) {
                                var name = Ext.getCmp('clientgrid-column-create-name');

                                if (name) {
                                    name.setValue(tf.getRawValue());
                                }
                            },
                            scope       : this
                        }
                    }
                }, {
                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                    html        : _('clientgrid.label_column_field_desc'),
                    cls         : 'desc-under'
                }]
            }, {
                columnWidth : .2,
                items       : [{
                    xtype       : 'checkbox',
                    fieldLabel  : _('clientgrid.label_column_active'),
                    description : MODx.expandHelp ? '' : _('clientgrid.label_column_active_desc'),
                    name        : 'active',
                    inputValue  : 1,
                    checked     : true
                }, {
                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                    html        : _('clientgrid.label_column_active_desc'),
                    cls         : 'desc-under'
                }]
            }]
        }, {
            xtype       : 'textfield',
            fieldLabel  : _('clientgrid.label_column_name'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_column_name_desc'),
            name        : 'name',
            id          : 'clientgrid-column-create-name',
            anchor      : '100%',
            allowBlank  : false
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_column_name_desc'),
            cls         : 'desc-under'
        }, {
            xtype       : 'clientgrid-combo-renders',
            fieldLabel  : _('clientgrid.label_column_render'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_column_render_desc'),
            name        : 'render',
            anchor      : '100%',
            allowBlank  : false
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_column_render_desc'),
            cls         : 'desc-under'
        }, {
            xtype       : 'checkbox',
            boxLabel   : _('clientgrid.label_column_fixed_desc'),
            name        : 'fixed',
            anchor      : '100%',
            inputValue  : 1,
            listeners   : {
                check       : {
                    fn          : function(tf) {
                        var width = Ext.getCmp('clientgrid-column-create-width');

                        if (width) {
                            if (tf.getValue()) {
                                width.show();
                            } else {
                                width.hide();
                            }
                        }
                    },
                    scope       : this
                }
            }
        }, {
            id          : 'clientgrid-column-create-width',
            layout      : 'form',
            labelSeparator : '',
            hidden      : true,
            items       : [{
                xtype       : 'numberfield',
                fieldLabel  : _('clientgrid.label_column_width'),
                description : MODx.expandHelp ? '' : _('clientgrid.label_column_width_desc'),
                name        : 'width',
                anchor      : '100%'
            }, {
                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                html        : _('clientgrid.label_column_width_desc'),
                cls         : 'desc-under'
            }]
        }]
    });

    ClientGrid.window.CreateColumn.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.CreateColumn, MODx.Window);

Ext.reg('clientgrid-window-column-create', ClientGrid.window.CreateColumn);

ClientGrid.window.UpdateColumn = function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
        autoHeight  : true,
        title       : _('clientgrid.column_update'),
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/columns/update'
        },
        fields      : [{
            xtype       : 'hidden',
            name        : 'id'
        }, {
            xtype       : 'hidden',
            name        : 'grid_id'
        }, {
            layout      : 'column',
            defaults    : {
                layout      : 'form',
                labelSeparator : ''
            },
            items       : [{
                columnWidth : .8,
                items       : [{
                    xtype       : 'clientgrid-combo-fields',
                    fieldLabel  : _('clientgrid.label_column_field'),
                    description : MODx.expandHelp ? '' : _('clientgrid.label_column_field_desc'),
                    name        : 'field_id',
                    anchor      : '100%',
                    allowBlank  : false,
                    grid        : config.record.grid_id,
                    listeners   : {
                        select      : {
                            fn          : function(tf) {
                                var name = Ext.getCmp('clientgrid-column-update-name');

                                if (name) {
                                    name.setValue(tf.getRawValue());
                                }
                            },
                            scope       : this
                        }
                    }
                }, {
                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                    html        : _('clientgrid.label_column_field_desc'),
                    cls         : 'desc-under'
                }]
            }, {
                columnWidth : .2,
                items       : [{
                    xtype       : 'checkbox',
                    fieldLabel  : _('clientgrid.label_column_active'),
                    description : MODx.expandHelp ? '' : _('clientgrid.label_column_active_desc'),
                    name        : 'active',
                    inputValue  : 1,
                    checked     : true
                }, {
                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                    html        : _('clientgrid.label_column_active_desc'),
                    cls         : 'desc-under'
                }]
            }]
        }, {
            xtype       : 'textfield',
            fieldLabel  : _('clientgrid.label_column_name'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_column_name_desc'),
            name        : 'name',
            id          : 'clientgrid-column-update-name',
            anchor      : '100%',
            allowBlank  : false
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_column_name_desc'),
            cls         : 'desc-under'
        }, {
            xtype       : 'clientgrid-combo-renders',
            fieldLabel  : _('clientgrid.label_column_render'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_column_render_desc'),
            name        : 'render',
            anchor      : '100%',
            allowBlank  : false
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_column_render_desc'),
            cls         : 'desc-under'
        }, {
            xtype       : 'checkbox',
            boxLabel   : _('clientgrid.label_column_fixed_desc'),
            name        : 'fixed',
            anchor      : '100%',
            inputValue  : 1,
            listeners   : {
                check       : {
                    fn          : function(tf) {
                        var width = Ext.getCmp('clientgrid-column-update-width');

                        if (width) {
                            if (tf.getValue()) {
                                width.show();
                            } else {
                                width.hide();
                            }
                        }
                    },
                    scope       : this
                }
            }
        }, {
            id          : 'clientgrid-column-update-width',
            layout      : 'form',
            labelSeparator : '',
            hidden      : !config.record.fixed,
            items       : [{
                xtype       : 'numberfield',
                fieldLabel  : _('clientgrid.label_column_width'),
                description : MODx.expandHelp ? '' : _('clientgrid.label_column_width_desc'),
                name        : 'width',
                anchor      : '100%'
            }, {
                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                html        : _('clientgrid.label_column_width_desc'),
                cls         : 'desc-under'
            }]
        }]
    });

    ClientGrid.window.UpdateColumn.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.UpdateColumn, MODx.Window);

Ext.reg('clientgrid-window-column-update', ClientGrid.window.UpdateColumn);