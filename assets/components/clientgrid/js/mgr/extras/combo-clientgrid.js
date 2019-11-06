ClientGrid.combo.Config = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/getlist',
            combo       : true
        },
        fields      : ['id', 'name', 'description'],
        hiddenName  : 'grid_config',
        pageSize    : 15,
        valueField  : 'id',
        displayField : 'name',
        tpl         : new Ext.XTemplate('<tpl for=".">' +
            '<div class="x-combo-list-item">' +
                '<span style="font-weight: bold;">{name:htmlEncode}</span>' +
                '<br />{description:htmlEncode}' +
            '</div>' +
        '</tpl>')
    });

    ClientGrid.combo.Config.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.combo.Config, MODx.combo.ComboBox);

Ext.reg('clientgrid-combo-config', ClientGrid.combo.Config);