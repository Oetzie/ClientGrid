ClientGrid.panel.Home = function(config) {
    config = config || {};
    
    Ext.apply(config, {
        id          : 'clientgrid-panel-home',
        cls         : 'container',
        items       : [{
            html        : '<h2>' + _('clientgrid') + '</h2>',
            cls         : 'modx-page-header'
        }, {
            layout      : 'form',
            items       : [{
                html            : '<p>' + _('clientgrid.grids_desc') + '</p>',
                bodyCssClass    : 'panel-desc'
            }, {
                xtype           : 'clientgrid-grid-grids',
                cls             : 'main-wrapper',
                preventRender   : true
            }]
        }]
    });

    ClientGrid.panel.Home.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.panel.Home, MODx.FormPanel);

Ext.reg('clientgrid-panel-home', ClientGrid.panel.Home);