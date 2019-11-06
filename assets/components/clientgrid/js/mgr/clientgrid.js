var ClientGrid = function(config) {
    config = config || {};

    ClientGrid.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid, Ext.Component, {
    page    : {},
    window  : {},
    grid    : {},
    tree    : {},
    panel   : {},
    combo   : {},
    config  : {}
});

Ext.reg('clientgrid', ClientGrid);

ClientGrid = new ClientGrid();