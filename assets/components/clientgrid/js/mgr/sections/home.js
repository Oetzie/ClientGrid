Ext.onReady(function() {
    MODx.load({
        xtype : 'clientgrid-page-home'
    });
});

ClientGrid.page.Home = function(config) {
    config = config || {};

    config.buttons = [];

    if (ClientGrid.config.branding_url) {
        config.buttons.push({
            text        : 'ClientGrid ' + ClientGrid.config.version,
            cls         : 'x-btn-branding',
            handler     : this.loadBranding
        });
    }

    if (ClientGrid.config.branding_url_help) {
        config.buttons.push('-', {
            text        : _('help_ex'),
            handler     : MODx.loadHelpPane,
            scope       : this
        });
    }

    Ext.applyIf(config, {
        components  : [{
            xtype       : 'clientgrid-panel-home',
            renderTo    : 'clientgrid-panel-home-div'
        }]
    });

    ClientGrid.page.Home.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.page.Home, MODx.Component, {
    loadBranding: function(btn) {
        window.open(ClientGrid.config.branding_url);
    }
});

Ext.reg('clientgrid-page-home', ClientGrid.page.Home);