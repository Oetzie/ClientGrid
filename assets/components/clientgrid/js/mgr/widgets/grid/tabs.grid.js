ClientGrid.grid.Tabs = function(config) {
    config = config || {};

    config.tbar = [{
        text        : _('clientgrid.tab_create'),
        cls         : 'primary-button',
        handler     : this.createTab,
        scope       : this
    }, '->', {
        xtype       : 'textfield',
        name        : 'clientgrid-filter-tabs-search',
        id          : 'clientgrid-filter-tabs-search',
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
        id          : 'clientgrid-filter-tabs-clear',
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
            header      : _('clientgrid.label_tab_name'),
            dataIndex   : 'name',
            sortable    : true,
            editable    : false,
            width       : 250
        }, {
            header      : _('clientgrid.label_tab_active'),
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
        id          : 'clientgrid-grid-tabs',
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/tabs/getlist',
            grid        : config.record.id
        },
        autosave    : true,
        save_action : 'mgr/grids/tabs/updatefromgrid',
        fields      : ['id', 'grid_id', 'name', 'description', 'active', 'menuindex', 'editedon'],
        paging      : true,
        pageSize    : MODx.config.default_per_page > 30 ? MODx.config.default_per_page : 30,
        sortBy      : 'menuindex',
        enableDragDrop : true,
        ddGroup     : 'clientgrid-grid-tabs',
        refreshGrid : ''
    });

    ClientGrid.grid.Tabs.superclass.constructor.call(this, config);

    this.on('afterrender', this.sortTabs, this);
};

Ext.extend(ClientGrid.grid.Tabs, MODx.grid.Grid, {
    filterSearch: function(tf, nv, ov) {
        this.getStore().baseParams.query = tf.getValue();
        
        this.getBottomToolbar().changePage(1);
    },
    clearFilter: function() {
        this.getStore().baseParams.query = '';
        
        Ext.getCmp('clientgrid-filter-tabs-search').reset();
        
        this.getBottomToolbar().changePage(1);
    },
    refreshGrids: function() {
        if (typeof this.config.refreshGrid === 'string') {
            Ext.getCmp(this.config.refreshGrid).refresh();
        } else {
            this.config.refreshGrid.forEach(function(grid) {
                Ext.getCmp(grid).refresh();
            });
        }
    },
    getMenu: function() {
        return [{
            text    : '<i class="x-menu-item-icon icon icon-edit"></i>' + _('clientgrid.tab_update'),
            handler : this.updateTab,
            scope   : this
        }, '-', {
            text    : '<i class="x-menu-item-icon icon icon-times"></i>' + _('clientgrid.tab_remove'),
            handler : this.removeTab,
            scope   : this
        }];
    },
    sortTabs: function() {
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
                            action      : 'mgr/tabs/sort',
                            sort        : order.join(',')
                        },
                        listeners   : {
                            'success'   : {
                                fn          : function() {
                                    data.grid.refreshGrids();
                                },
                                scope       : this
                            }
                        }
                    });
                }
            }
        });
    },
    createTab: function(btn, e) {
        if (this.createTabWindow) {
            this.createTabWindow.destroy();
        }

        var record = {
            grid_id : this.record.id
        };

        this.createTabWindow = MODx.load({
            xtype       : 'clientgrid-window-tab-create',
            record      : record,
            closeAction : 'close',
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });

        this.createTabWindow.setValues(record);
        this.createTabWindow.show(e.target);
    },
    updateTab: function(btn, e) {
        if (this.updateTabWindow) {
            this.updateTabWindow.destroy();
        }
        
        this.updateTabWindow = MODx.load({
            xtype       : 'clientgrid-window-tab-update',
            record      : this.menu.record,
            closeAction : 'close',
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });
        
        this.updateTabWindow.setValues(this.menu.record);
        this.updateTabWindow.show(e.target);
    },
    removeTab: function() {
        MODx.msg.confirm({
            title       : _('clientgrid.tab_remove'),
            text        : _('clientgrid.tab_remove_confirm'),
            url         : ClientGrid.config.connector_url,
            params      : {
                action      : 'mgr/grids/tabs/remove',
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

Ext.reg('clientgrid-grid-tabs', ClientGrid.grid.Tabs);

ClientGrid.window.CreateTab = function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
        autoHeight  : true,
        title       : _('clientgrid.tab_create'),
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/tabs/create'
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
                    xtype       : 'textfield',
                    fieldLabel  : _('clientgrid.label_tab_name'),
                    description : MODx.expandHelp ? '' : _('clientgrid.label_tab_name_desc'),
                    name        : 'name',
                    anchor      : '100%',
                    allowBlank  : false
                }, {
                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                    html        : _('clientgrid.label_tab_name_desc'),
                    cls         : 'desc-under'
                }]
            }, {
                columnWidth : .2,
                items       : [{
                    xtype       : 'checkbox',
                    fieldLabel  : _('clientgrid.label_tab_active'),
                    description : MODx.expandHelp ? '' : _('clientgrid.label_tab_active_desc'),
                    name        : 'active',
                    inputValue  : 1,
                    checked     : true
                }, {
                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                    html        : _('clientgrid.label_tab_active_desc'),
                    cls         : 'desc-under'
                }]
            }]
        }, {
            xtype       : 'textarea',
            fieldLabel  : _('clientgrid.label_tab_description'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_tab_description_desc'),
            name        : 'description',
            anchor      : '100%'
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_tab_description_desc'),
            cls         : 'desc-under'
        }]
    });

    ClientGrid.window.CreateTab.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.CreateTab, MODx.Window);

Ext.reg('clientgrid-window-tab-create', ClientGrid.window.CreateTab);

ClientGrid.window.UpdateTab = function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
        autoHeight  : true,
        title       : _('clientgrid.tab_update'),
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/tabs/update'
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
                    xtype       : 'textfield',
                    fieldLabel  : _('clientgrid.label_tab_name'),
                    description : MODx.expandHelp ? '' : _('clientgrid.label_tab_name_desc'),
                    name        : 'name',
                    anchor      : '100%',
                    allowBlank  : false
                }, {
                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                    html        : _('clientgrid.label_tab_name_desc'),
                    cls         : 'desc-under'
                }]
            }, {
                columnWidth : .2,
                items       : [{
                    xtype       : 'checkbox',
                    fieldLabel  : _('clientgrid.label_tab_active'),
                    description : MODx.expandHelp ? '' : _('clientgrid.label_tab_active_desc'),
                    name        : 'active',
                    inputValue  : 1,
                    checked     : true
                }, {
                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                    html        : _('clientgrid.label_tab_active_desc'),
                    cls         : 'desc-under'
                }]
            }]
        }, {
            xtype       : 'textarea',
            fieldLabel  : _('clientgrid.label_tab_description'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_tab_description_desc'),
            name        : 'description',
            anchor      : '100%'
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_tab_description_desc'),
            cls         : 'desc-under'
        }]
    });

    ClientGrid.window.UpdateTab.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.UpdateTab, MODx.Window);

Ext.reg('clientgrid-window-tab-update', ClientGrid.window.UpdateTab);