ClientGrid.panel.Grid = function(config) {
    config = config || {};

    Ext.apply(config, {
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : this.getActionParam(),
            id          : MODx.request.id
        },
        id          : 'clientgrid-panel-grid',
        cls         : 'container',
        items       : [{
            html        : '<h2>' + this.getTitlePanel(config.record.name) + '</h2>',
            cls         : 'modx-page-header'
        }, {
            xtype       : 'modx-tabs',
            items       : [{
                title       : _('clientgrid.grid'),
                items       : [{
                    html        : '<p>' + _('clientgrid.grid_desc') + '</p>',
                    bodyCssClass : 'panel-desc'
                }, {
                    xtype       : 'panel',
                    layout      : 'form',
                    labelAlign  : 'top',
                    labelSeparator : '',
                    cls         : 'main-wrapper',
                    items       : [{
                        layout      : 'column',
                        defaults    : {
                            layout      : 'form',
                            labelSeparator : ''
                        },
                        items       : [{
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'clientgrid-combo-columns',
                                fieldLabel  : _('clientgrid.label_grid_sort_column'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_grid_sort_column_desc'),
                                name        : 'sort_column',
                                hiddenName  : 'sort_column',
                                anchor      : '100%',
                                allowBlank  : false,
                                grid        : config.record.id,
                                listeners   : {
                                    change      : {
                                        fn          : function(tf) {
                                            var sortable = Ext.getCmp('clientgrid-combo-sortable');

                                            if (sortable) {
                                                if (tf.getValue() !== 0) {
                                                    sortable.setValue(0);

                                                    sortable.setDisabled(true);
                                                } else {
                                                    sortable.setDisabled(false);
                                                }
                                            }
                                        },
                                        scope       : this
                                    }
                                }
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_grid_sort_column_desc'),
                                cls         : 'desc-under'
                            }, {
                                xtype       : 'clientgrid-combo-sort-dir',
                                fieldLabel  : _('clientgrid.label_grid_sort_dir'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_grid_sort_dir_desc'),
                                name        : 'sort_dir',
                                anchor      : '100%',
                                allowBlank  : false
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_grid_sort_dir_desc'),
                                cls         : 'desc-under'
                            }, {
                                xtype       : 'clientgrid-combo-sortable',
                                fieldLabel  : _('clientgrid.label_grid_sortable'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_grid_sortable_desc'),
                                name        : 'sortable',
                                hiddenName  : 'sortable',
                                id          : 'clientgrid-combo-sortable',
                                anchor      : '100%',
                                allowBlank  : false
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_grid_sortable_desc'),
                                cls         : 'desc-under'
                            }, {
                                xtype       : 'numberfield',
                                fieldLabel  : _('clientgrid.label_grid_max_items'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_grid_max_items_desc'),
                                name        : 'max_items',
                                anchor      : '100%'
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_grid_max_items_desc'),
                                cls         : 'desc-under'
                            }]
                        }, {
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'numberfield',
                                fieldLabel  : _('clientgrid.label_grid_window_width'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_grid_window_width_desc'),
                                name        : 'window_width',
                                anchor      : '100%'
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_grid_window_width_desc'),
                                cls         : 'desc-under'
                            }, {
                                xtype       : 'fieldset',
                                fieldLabel  : _('clientgrid.label_grid_actions'),
                                cls         : 'x-form-checkboxgroup',
                                items       : [{
                                    xtype       : 'checkbox',
                                    hideLabel   : true,
                                    boxLabel    : _('clientgrid.label_grid_actions_create'),
                                    name        : 'actions[create]',
                                    inputValue  : 1,
                                    checked     : parseInt(config.record.actions.create) === 1
                                }, {
                                    xtype       : 'checkbox',
                                    hideLabel   : true,
                                    boxLabel    : _('clientgrid.label_grid_actions_update'),
                                    name        : 'actions[update]',
                                    inputValue  : 1,
                                    checked     : parseInt(config.record.actions.update) === 1
                                }, {
                                    xtype       : 'checkbox',
                                    hideLabel   : true,
                                    boxLabel    : _('clientgrid.label_grid_actions_remove'),
                                    name        : 'actions[remove]',
                                    inputValue  : 1,
                                    checked     : parseInt(config.record.actions.remove) === 1
                                }, {
                                    xtype       : 'checkbox',
                                    hideLabel   : true,
                                    boxLabel    : _('clientgrid.label_grid_actions_duplicate'),
                                    name        : 'actions[duplicate]',
                                    inputValue  : 1,
                                    checked     : parseInt(config.record.actions.duplicate) === 1
                                }, {
                                    xtype       : 'checkbox',
                                    hideLabel   : true,
                                    boxLabel    : _('clientgrid.label_grid_actions_remove_bulk'),
                                    name        : 'actions[remove_bulk]',
                                    inputValue  : 1,
                                    checked     : parseInt(config.record.actions.remove_bulk) === 1
                                }, {
                                    xtype       : 'checkbox',
                                    hideLabel   : true,
                                    boxLabel    : _('clientgrid.label_grid_actions_view_raw_output'),
                                    name        : 'actions[view_raw_output]',
                                    inputValue  : 1,
                                    checked     : parseInt(config.record.actions.view_raw_output) === 1
                                }]
                            }]
                        }]
                    }]
                }]
            }, {
                title       : _('clientgrid.columns'),
                items       : [{
                    html        : '<p>' + _('clientgrid.columns_desc') + '</p>',
                    bodyCssClass : 'panel-desc'
                }, {
                    xtype       : 'clientgrid-grid-columns',
                    cls         : 'main-wrapper',
                    preventRender : true,
                    record      : config.record
                }]
            }, {
                title       : _('clientgrid.fields'),
                items       : [{
                    html        : '<p>' + _('clientgrid.fields_desc') + '</p>',
                    bodyCssClass : 'panel-desc'
                }, {
                    xtype       : 'clientgrid-grid-fields',
                    cls         : 'main-wrapper',
                    preventRender : true,
                    record      : config.record
                }]
            }, {
                title       : _('clientgrid.tabs'),
                items       : [{
                    html        : '<p>' + _('clientgrid.tabs_desc') + '</p>',
                    bodyCssClass : 'panel-desc'
                }, {
                    xtype       : 'clientgrid-grid-tabs',
                    cls         : 'main-wrapper',
                    preventRender : true,
                    record      : config.record,
                    refreshGrid : 'clientgrid-grid-fields'
                }]
            }]
        }],
        listeners   : {
            'setup'     : {
                fn          : this.onSetup,
                scope       : this
            },
            'success'   : {
                fn          : this.onSuccess,
                scope       : this
            }
        }
    });

    ClientGrid.panel.Grid.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.panel.Grid, MODx.FormPanel, {
    initialized: false,

    onSetup: function() {
        if (!this.initialized) {
            this.getForm().setValues(this.record);

            this.initialized = true;
        }

        this.fireEvent('ready');
    },
    onSuccess: function(data) {
        if (!this.isUpdate()) {
            MODx.loadPage('?a=grid/update&manage=' + MODx.request.namespace + '&id=' + data.result.object.id);
        }
    },
    isUpdate: function() {
        return 'grid/manage' === MODx.request.a;
    },
    getActionParam: function() {
        return this.isUpdate() ? 'mgr/grids/update' : 'mgr/grids/create';
    },
    getTitlePanel: function(name) {
        if (null === name) {
            return _('clientgrid.grid_update');
        }

        return _('clientgrid.grid_update') + ': ' + name;
    }
});

Ext.reg('clientgrid-panel-grid', ClientGrid.panel.Grid);