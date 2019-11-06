ClientGrid.grid.Grids = function(config) {
    config = config || {};

    config.tbar = [{
        text        : _('clientgrid.grid_create'),
        cls         : 'primary-button',
        handler     : this.createGrid,
        scope       : this
    }, '->', {
        xtype       : 'textfield',
        name        : 'clientgrid-filter-grids-search',
        id          : 'clientgrid-filter-grids-search',
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
        id          : 'clientgrid-filter-grids-clear',
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
            header      : _('clientgrid.label_grid_name'),
            dataIndex   : 'name',
            sortable    : true,
            editable    : false,
            width       : 250,
            fixed       : true
        }, {
            header      : _('clientgrid.label_grid_description'),
            dataIndex   : 'description',
            sortable    : false,
            editable    : false,
            width       : 250
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
        id          : 'clientgrid-grid-grids',
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/getlist'
        },
        fields      : ['id', 'name', 'description', 'sort_column', 'sort_dir', 'sortable', 'editedon'],
        paging      : true,
        pageSize    : MODx.config.default_per_page > 30 ? MODx.config.default_per_page : 30,
        sortBy      : 'name'
    });

    ClientGrid.grid.Grids.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.grid.Grids, MODx.grid.Grid, {
    filterSearch: function(tf, nv, ov) {
        this.getStore().baseParams.query = tf.getValue();
        
        this.getBottomToolbar().changePage(1);
    },
    clearFilter: function() {
        this.getStore().baseParams.query = '';
        
        Ext.getCmp('clientgrid-filter-grids-search').reset();
        
        this.getBottomToolbar().changePage(1);
    },
    getMenu: function() {
        return [{
            text    : '<i class="x-menu-item-icon icon icon-edit"></i>' + _('clientgrid.grid_update'),
            handler : this.updateGrid,
            scope   : this
        }, '-', {
            text    : '<i class="x-menu-item-icon icon icon-cogs"></i>' + _('clientgrid.grid_manage'),
            handler : this.manageGrid,
            scope   : this
        }, '-', {
            text    : '<i class="x-menu-item-icon icon icon-times"></i>' + _('clientgrid.grid_remove'),
            handler : this.removeGrid,
            scope   : this
        }];
    },
    createGrid: function(btn, e) {
        if (this.createGridWindow) {
            this.createGridWindow.destroy();
        }
        
        this.createGridWindow = MODx.load({
            xtype       : 'clientgrid-window-grid-create',
            closeAction : 'close',
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });
        
        this.createGridWindow.show(e.target);
    },
    updateGrid: function(btn, e) {
        if (this.updateGridWindow) {
            this.updateGridWindow.destroy();
        }
        
        this.updateGridWindow = MODx.load({
            xtype       : 'clientgrid-window-grid-update',
            record      : this.menu.record,
            closeAction : 'close',
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });
        
        this.updateGridWindow.setValues(this.menu.record);
        this.updateGridWindow.show(e.target);
    },
    manageGrid: function() {
        MODx.loadPage('?a=grid/manage&namespace=' + MODx.request.namespace + '&id=' + this.menu.record.id);
    },
    removeGrid: function() {
        MODx.msg.confirm({
            title       : _('clientgrid.grid_remove'),
            text        : _('clientgrid.grid_remove_confirm'),
            url         : ClientGrid.config.connector_url,
            params      : {
                action      : 'mgr/grids/remove',
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
    renderDate: function(a) {
        if (Ext.isEmpty(a)) {
            return '—';
        }
        
        return a;
    }
});

Ext.reg('clientgrid-grid-grids', ClientGrid.grid.Grids);

ClientGrid.window.CreateGrid = function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
        autoHeight  : true,
        title       : _('clientgrid.grid_create'),
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/create'
        },
        fields      : [{
            xtype       : 'textfield',
            fieldLabel  : _('clientgrid.label_grid_name'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_grid_name_desc'),
            name        : 'name',
            anchor      : '100%',
            allowBlank  : false
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_grid_name_desc'),
            cls         : 'desc-under'
        }, {
            xtype       : 'textarea',
            fieldLabel  : _('clientgrid.label_grid_description'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_grid_description_desc'),
            name        : 'description',
            anchor      : '100%'
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_grid_description_desc'),
            cls         : 'desc-under'
        }]
    });

    ClientGrid.window.CreateGrid.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.CreateGrid, MODx.Window);

Ext.reg('clientgrid-window-grid-create', ClientGrid.window.CreateGrid);

ClientGrid.window.UpdateGrid = function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
        autoHeight  : true,
        title       : _('clientgrid.grid_update'),
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/update'
        },
        fields      : [{
            xtype       : 'hidden',
            name        : 'id'
        }, {
            xtype       : 'textfield',
            fieldLabel  : _('clientgrid.label_grid_name'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_grid_name_desc'),
            name        : 'name',
            anchor      : '100%',
            allowBlank  : false
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_grid_name_desc'),
            cls         : 'desc-under'
        }, {
            xtype       : 'textarea',
            fieldLabel  : _('clientgrid.label_grid_description'),
            description : MODx.expandHelp ? '' : _('clientgrid.label_grid_description_desc'),
            name        : 'description',
            anchor      : '100%'
        }, {
            xtype       : MODx.expandHelp ? 'label' : 'hidden',
            html        : _('clientgrid.label_grid_description_desc'),
            cls         : 'desc-under'
        }]
    });

    ClientGrid.window.UpdateGrid.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.UpdateGrid, MODx.Window);

Ext.reg('clientgrid-window-grid-update', ClientGrid.window.UpdateGrid);