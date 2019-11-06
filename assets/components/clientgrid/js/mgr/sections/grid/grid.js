Ext.onReady(function() {
    MODx.load({
        xtype : 'clientgrid-page-grid'
    });
});

ClientGrid.page.Grid = function(config) {
    config = config || {};

    config.buttons = [];

    if (ClientGrid.config.branding_url) {
        config.buttons.push({
            text        : 'ClientGrid ' + ClientGrid.config.version,
            cls         : 'x-btn-branding',
            handler     : this.loadBranding
        });
    }

    config.buttons.push({
        text        : '<i class="icon icon-arrow-left"></i>' + _('clientgrid.back_to_grids'),
        handler     : this.toGridsView,
        scope       : this
    }, {
        text        : _('save'),
        cls         : 'primary-button',
        method      : 'remote',
        process     : 'mgr/grids/manage',
        keys        : [{
            ctrl        : true,
            key         : MODx.config.keymap_save || 's'
        }]
    });

    config.buttons.push({
        text        : _('delete'),
        handler     : this.removeGrid,
        scope       : this
    });

    config.buttons.push({
        text        : _('cancel'),
        process     : 'cancel',
        params      : {
            a           : 'home',
            namespace   : MODx.request.namespace
        }
    });

    if (ClientGrid.config.branding_url_help) {
        config.buttons.push({
            text        : _('help_ex'),
            handler     : MODx.loadHelpPane,
            scope       : this
        });
    }

    Ext.applyIf(config, {
        formpanel   : 'clientgrid-panel-grid',
        components  : [{
            xtype       : 'clientgrid-panel-grid',
            record      : ClientGrid.config.record
        }]
    });

    ClientGrid.page.Grid.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.page.Grid, MODx.Component, {
    loadBranding: function(btn) {
        window.open(ClientGrid.config.branding_url);
    },
    toGridsView: function() {
        MODx.loadPage('home', 'namespace=' + MODx.request.namespace);
    },
    removeGrid: function() {
        MODx.msg.confirm({
            title       : _('clientgrid.grid_remove'),
            text        : _('clientgrid.grid_remove_confirm'),
            url         : ClientGrid.config.connector_url,
            params      : {
                action      : 'mgr/girds/remove',
                id          : ClientGrid.config.record.id
            },
            listeners   : {
                'success'   : {
                    fn          : function() {
                        MODx.loadPage('?a=home&namespace=' + MODx.request.namespace);
                    },
                    scope       : this
                }
            }
        });
    }
});

Ext.reg('clientgrid-page-grid', ClientGrid.page.Grid);