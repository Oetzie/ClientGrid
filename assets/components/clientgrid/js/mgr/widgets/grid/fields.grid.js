ClientGrid.grid.Fields = function(config) {
    config = config || {};

    config.tbar = [{
        text        : _('clientgrid.field_create'),
        cls         : 'primary-button',
        handler     : this.createField,
        scope       : this
    }, '->', {
        xtype       : 'textfield',
        name        : 'clientgrid-filter-fields-search',
        id          : 'clientgrid-filter-fields-search',
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
        id          : 'clientgrid-filter-fields-clear',
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
            header      : _('clientgrid.label_field_name'),
            dataIndex   : 'name_formatted',
            sortable    : true,
            editable    : false,
            width       : 250
        }, {
            header      : _('clientgrid.label_field_key'),
            dataIndex   : 'key',
            sortable    : true,
            editable    : false,
            width       : 200,
            fixed       : true
        }, {
            header      : _('clientgrid.label_field_active'),
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
        }, {
            header      : _('clientgrid.label_field_tab'),
            dataIndex   : 'tab_name',
            sortable    : false,
            hidden      : true,
            editable    : false
        }]
    });
    
    Ext.applyIf(config, {
        cm          : columns,
        id          : 'clientgrid-grid-fields',
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/fields/getlist',
            grid        : config.record.id
        },
        autosave    : true,
        save_action : 'mgr/grids/fields/updatefromgrid',
        fields      : ['id', 'grid_id', 'tab_id', 'key', 'name', 'description', 'xtype', 'extra', 'required', 'searchable', 'active', 'menuindex', 'editedon', 'name_formatted', 'description_formatted', 'tab_name', 'tab_menuindex'],
        paging      : true,
        pageSize    : MODx.config.default_per_page > 30 ? MODx.config.default_per_page : 30,
        remoteSort  : true,
        enableDragDrop : true,
        ddGroup     : 'clientgrid-grid-fields',
        grouping    : true,
        groupBy     : 'tab_name',
        singleText  : _('clientgrid.field'),
        pluralText  : _('clientgrid.fields')
    });

    ClientGrid.grid.Fields.superclass.constructor.call(this, config);

    this.on('afterrender', this.sortFields, this);
};

Ext.extend(ClientGrid.grid.Fields, MODx.grid.Grid, {
    filterSearch: function(tf, nv, ov) {
        this.getStore().baseParams.query = tf.getValue();
        
        this.getBottomToolbar().changePage(1);
    },
    clearFilter: function() {
        this.getStore().baseParams.query = '';
        
        Ext.getCmp('clientgrid-filter-fields-search').reset();
        
        this.getBottomToolbar().changePage(1);
    },
    getMenu: function() {
        return [{
            text    : '<i class="x-menu-item-icon icon icon-edit"></i>' + _('clientgrid.field_update'),
            handler : this.updateField,
            scope   : this
        }, '-', {
            text    : '<i class="x-menu-item-icon icon icon-times"></i>' + _('clientgrid.field_remove'),
            handler : this.removeField,
            scope   : this
        }];
    },
    sortFields: function() {
        new Ext.dd.DropTarget(this.getView().mainBody, {
            ddGroup     : this.config.ddGroup,
            notifyOver  : function(dd, e, data) {
                var index       = dd.getDragData(e).rowIndex,
                    minIndex    = null,
                    maxIndex    = null;

                Ext.each(data.grid.getStore().data.items, (function(record, recordIndex) {
                    if (record.data.tab_id === data.selections[0].data.tab_id) {
                        if (recordIndex <= minIndex || minIndex === null) {
                            minIndex = recordIndex;
                        }

                        if (recordIndex >= maxIndex || maxIndex === null) {
                            maxIndex = recordIndex;
                        }
                    }
                }).bind(this));

                return index >= minIndex && index <= maxIndex ? this.dropAllowed : this.dropNotAllowed;
            },
            notifyDrop  : function(dd, e, data) {
                if (this.dropAllowed === this.notifyOver(dd, e, data)) {
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
                                action      : 'mgr/fields/sort',
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
            }
        });
    },
    createField: function(btn, e) {
        if (this.createFieldWindow) {
            this.createFieldWindow.destroy();
        }

        var record = {
            grid_id : this.record.id
        };

        this.createFieldWindow = MODx.load({
            xtype       : 'clientgrid-window-field-create',
            record      : record,
            closeAction : 'close',
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });

        this.createFieldWindow.setValues(record);
        this.createFieldWindow.show(e.target);
    },
    updateField: function(btn, e) {
        if (this.updateFieldWindow) {
            this.updateFieldWindow.destroy();
        }
        
        this.updateFieldWindow = MODx.load({
            xtype       : 'clientgrid-window-field-update',
            record      : this.menu.record,
            closeAction : 'close',
            listeners   : {
                'success'   : {
                    fn          : this.refresh,
                    scope       : this
                }
            }
        });
        
        this.updateFieldWindow.setValues(this.menu.record);
        this.updateFieldWindow.show(e.target);
    },
    removeField: function() {
        MODx.msg.confirm({
            title       : _('clientgrid.field_remove'),
            text        : _('clientgrid.field_remove_confirm'),
            url         : ClientGrid.config.connector_url,
            params      : {
                action      : 'mgr/grids/fields/remove',
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

Ext.reg('clientgrid-grid-fields', ClientGrid.grid.Fields);

ClientGrid.window.CreateField = function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
        autoHeight  : true,
        width       : 800,
        title       : _('clientgrid.field_create'),
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/fields/create'
        },
        bodyStyle   : 'padding: 0',
        fields      : [{
            xtype       : 'hidden',
            name        : 'grid_id'
        }, {
            xtype       : 'modx-vtabs',
            deferredRender : false,
            hideMode    : 'offsets',
            items       : [{
                title       : _('clientgrid.default_settings'),
                items       : [{
                    layout      : 'column',
                    defaults    : {
                        layout      : 'form',
                        labelSeparator : ''
                    },
                    items       : [{
                        columnWidth : .5,
                        items       : [{
                            layout      : 'column',
                            defaults    : {
                                layout      : 'form',
                                labelSeparator : ''
                            },
                            items       : [{
                                columnWidth : .8,
                                items       : [{
                                    xtype       : 'textfield',
                                    fieldLabel  : _('clientgrid.label_field_key'),
                                    description : MODx.expandHelp ? '' : _('clientgrid.label_field_key_desc'),
                                    name        : 'key',
                                    anchor      : '100%',
                                    allowBlank  : false
                                }, {
                                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                    html        : _('clientgrid.label_field_key_desc'),
                                    cls         : 'desc-under'
                                }]
                            }, {
                                columnWidth : .2,
                                items       : [{
                                    xtype       : 'checkbox',
                                    fieldLabel  : _('clientgrid.label_field_active'),
                                    description : MODx.expandHelp ? '' : _('clientgrid.label_field_active_desc'),
                                    name        : 'active',
                                    inputValue  : 1,
                                    checked     : true
                                }, {
                                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                    html        : _('clientgrid.label_field_active_desc'),
                                    cls         : 'desc-under'
                                }]
                            }]
                        }, {
                            xtype       : 'textfield',
                            fieldLabel  : _('clientgrid.label_field_name'),
                            description : MODx.expandHelp ? '' : _('clientgrid.label_field_name_desc'),
                            name        : 'name',
                            anchor      : '100%',
                            allowBlank  : false
                        }, {
                            xtype       : MODx.expandHelp ? 'label' : 'hidden',
                            html        : _('clientgrid.label_field_name_desc'),
                            cls         : 'desc-under'
                        }, {
                            xtype       : 'textarea',
                            fieldLabel  : _('clientgrid.label_field_description'),
                            description : MODx.expandHelp ? '' : _('clientgrid.label_field_description_desc'),
                            name        : 'description',
                            anchor      : '100%'
                        }, {
                            xtype       : MODx.expandHelp ? 'label' : 'hidden',
                            html        : _('clientgrid.label_field_description_desc'),
                            cls         : 'desc-under'
                        }]
                    }, {
                        columnWidth : .5,
                        items       : [{
                            xtype       : 'clientgrid-combo-xtype',
                            fieldLabel  : _('clientgrid.label_field_xtype'),
                            description : MODx.expandHelp ? '' : _('clientgrid.label_field_xtype_desc'),
                            name        : 'xtype',
                            anchor      : '100%',
                            allowBlank  : false,
                            listeners   : {
                                render      : {
                                    fn          : this.onHandleXtype,
                                    scope       : this
                                },
                                select      : {
                                    fn          : this.onHandleXtype,
                                    scope       : this
                                }
                            }
                        }, {
                            xtype       : MODx.expandHelp ? 'label' : 'hidden',
                            html        : _('clientgrid.label_field_tab_desc'),
                            cls         : 'desc-under'
                        }, {
                            xtype       : 'clientgrid-combo-tabs',
                            fieldLabel  : _('clientgrid.label_field_tab'),
                            description : MODx.expandHelp ? '' : _('clientgrid.label_field_tab_desc'),
                            name        : 'tab_id',
                            anchor      : '100%'
                        }, {
                            xtype       : MODx.expandHelp ? 'label' : 'hidden',
                            html        : _('clientgrid.label_field_xtype_desc'),
                            cls         : 'desc-under'
                        }, {
                            xtype       : 'checkbox',
                            hideLabel   : true,
                            boxLabel    : _('clientgrid.label_field_required_desc'),
                            name        : 'required',
                            inputValue  : 1
                        }, {
                            xtype       : 'checkbox',
                            hideLabel   : true,
                            boxLabel    : _('clientgrid.label_field_searchable_desc'),
                            name        : 'searchable',
                            inputValue  : 1
                        }]
                    }]
                }]
            }, {
                title       : _('clientgrid.extra_settings'),
                items       : [{
                    id          : 'clientgrid-extra-default-create',
                    items       : [{
                        html    : '<p>' + _('clientgrid.no_extra_settings') + '</p>'
                    }]
                }, {
                    id          : 'clientgrid-extra-datefield-create',
                    items       : [{
                        layout      : 'column',
                        defaults    : {
                            layout      : 'form',
                            labelSeparator : ''
                        },
                        items       : [{
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'datefield',
                                fieldLabel  : _('clientgrid.label_field_mindate'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_mindate_desc'),
                                name        : 'minDateValue',
                                anchor      : '100%',
                                format      : MODx.config.manager_date_format,
                                startDay    : parseInt(MODx.config.manager_week_start)
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_mindate_desc'),
                                cls         : 'desc-under'
                            }]
                        }, {
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'datefield',
                                fieldLabel  : _('clientgrid.label_field_maxdate'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_maxdate_desc'),
                                name        : 'maxDateValue',
                                anchor      : '100%',
                                format      : MODx.config.manager_date_format,
                                startDay    : parseInt(MODx.config.manager_week_start)
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_maxdate_desc'),
                                cls         : 'desc-under'
                            }]
                        }]
                    }]
                }, {
                    id          : 'clientgrid-extra-timefield-create',
                    items       : [{
                        layout      : 'column',
                        defaults    : {
                            layout      : 'form',
                            labelSeparator : ''
                        },
                        items       : [{
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'timefield',
                                fieldLabel  : _('clientgrid.label_field_mintime'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_mintime_desc'),
                                name        : 'minTimeValue',
                                anchor      : '100%',
                                format      : MODx.config.manager_time_format
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_mintime_desc'),
                                cls         : 'desc-under'
                            }]
                        }, {
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'timefield',
                                fieldLabel  : _('clientgrid.label_field_maxtime'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_maxtime_desc'),
                                name        : 'maxTimeValue',
                                anchor      : '100%',
                                format      : MODx.config.manager_time_format
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_maxtime_desc'),
                                cls         : 'desc-under'
                            }]
                        }]
                    }]
                }, {
                    id          : 'clientgrid-extra-combo-create',
                    layout      : 'form',
                    labelSeparator : '',
                    items       : [{
                        xtype       : 'clientgrid-combo-values',
                        fieldLabel  : _('clientgrid.label_field_values')
                    }, {
                        xtype       : 'textarea',
                        fieldLabel  : _('clientgrid.label_field_binded_values'),
                        description : MODx.expandHelp ? '' : _('clientgrid.label_field_binded_values_desc'),
                        name        : 'bindedValues',
                        anchor      : '100%'
                    }, {
                        xtype       : MODx.expandHelp ? 'label' : 'hidden',
                        html        : _('clientgrid.label_field_binded_values_desc'),
                        cls         : 'desc-under'
                    }]
                }, {
                    id          : 'clientgrid-extra-browser-create',
                    items       : [{
                        layout      : 'column',
                        defaults    : {
                            layout      : 'form',
                            labelSeparator : ''
                        },
                        items       : [{
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'modx-combo-source',
                                fieldLabel  : _('clientgrid.label_field_source'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_source_desc'),
                                name        : 'source',
                                anchor      : '100%',
                                value       : MODx.config.default_media_source
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_source_desc'),
                                cls         : 'desc-under'
                            }, {
                                xtype       : 'textfield',
                                fieldLabel  : _('clientgrid.label_field_filetypes'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_filetypes_desc'),
                                name        : 'allowedFileTypes',
                                anchor      : '100%',
                                value       : ''
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_filetypes_desc'),
                                cls         : 'desc-under'
                            }]
                        }, {
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'textfield',
                                fieldLabel  : _('clientgrid.label_field_opento'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_opento_desc'),
                                name        : 'openTo',
                                anchor      : '100%',
                                value       : '/'
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        :  _('clientgrid.label_field_opento_desc'),
                                cls         : 'desc-under'
                            }]
                        }]
                    }]
                }, {
                    id          : 'clientgrid-extra-tinymce-create',
                    layout      : 'form',
                    labelSeparator : '',
                    items       : [{
                        xtype       : 'tinymce-combo-config',
                        fieldLabel  : _('clientgrid.label_setting_tinymce_config'),
                        description : MODx.expandHelp ? '' : _('clientgrid.label_setting_tinymce_config_desc'),
                        hiddenName  : 'tinymceConfig',
                        anchor      : '100%'
                    }, {
                        xtype       : MODx.expandHelp ? 'label' : 'hidden',
                        html        : _('clientgrid.label_setting_tinymce_config_desc'),
                        cls         : 'desc-under'
                    }]
                }, {
                    id          : 'clientgrid-extra-clientgrid-create',
                    layout      : 'form',
                    labelSeparator : '',
                    items       : [{
                        xtype       : 'clientgrid-combo-config',
                        fieldLabel  : _('clientgrid.label_setting_clientgrid_config'),
                        description : MODx.expandHelp ? '' : _('clientgrid.label_setting_clientgrid_config_desc'),
                        hiddenName  : 'gridConfig',
                        anchor      : '100%'
                    }, {
                        xtype       : MODx.expandHelp ? 'label' : 'hidden',
                        html        : _('clientgrid.label_setting_clientgrid_config_desc'),
                        cls         : 'desc-under'
                    }]
                }]
            }]
        }]
    });

    ClientGrid.window.CreateField.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.CreateField, MODx.Window, {
    onHandleXtype: function(event) {
        var elements = {
            default         : false,
            datefield       : false,
            timefield       : false,
            datetimefield   : false,
            combo           : false,
            browser         : false,
            tinymce         : false,
            clientgrid      : false
        };

        switch (event.getValue()) {
            case 'datefield':
                elements.datefield  = true;

                break;
            case 'timefield':
                elements.timefield  = true;

                break;
            case 'datetimefield':
                elements.datefield  = true;
                elements.timefield  = true;

                break;
            case 'combo':
            case 'radiogroup':
            case 'checkboxgroup':
                elements.combo      = true;

                break;
            case 'browser':
                elements.browser    = true;

                break;
            case 'tinymce':
                elements.tinymce    = true;

                break;
            case 'clientgrid':
                elements.clientgrid = true;

                break;
            default:
                elements.default    = true;

                break;
        }

        Ext.iterate(elements, function(element, value) {
            var tab = Ext.getCmp('clientgrid-extra-' + element + '-create');

            if (tab) {
                if (value) {
                    tab.show();
                } else {
                    tab.hide();
                }
            }
        });
    }
});

Ext.reg('clientgrid-window-field-create', ClientGrid.window.CreateField);

ClientGrid.window.UpdateField = function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
        autoHeight  : true,
        width       : 800,
        title       : _('clientgrid.field_update'),
        url         : ClientGrid.config.connector_url,
        baseParams  : {
            action      : 'mgr/grids/fields/update'
        },
        bodyStyle   : 'padding: 0',
        fields      : [{
            xtype       : 'hidden',
            name        : 'id'
        }, {
            xtype       : 'hidden',
            name        : 'grid_id'
        }, {
            xtype       : 'hidden',
            name        : 'key'
        }, {
            xtype       : 'modx-vtabs',
            deferredRender : false,
            hideMode    : 'offsets',
            items       : [{
                title       : _('clientgrid.default_settings'),
                items       : [{
                    layout      : 'column',
                    defaults    : {
                        layout      : 'form',
                        labelSeparator : ''
                    },
                    items       : [{
                        columnWidth : .5,
                        items       : [{
                            layout      : 'column',
                            defaults    : {
                                layout      : 'form',
                                labelSeparator : ''
                            },
                            items       : [{
                                columnWidth : .8,
                                items       : [{
                                    xtype       : 'statictextfield',
                                    fieldLabel  : _('clientgrid.label_field_key'),
                                    description : MODx.expandHelp ? '' : _('clientgrid.label_field_key_desc'),
                                    name        : 'key',
                                    anchor      : '100%',
                                    allowBlank  : false,
                                    value       : config.record.key
                                }, {
                                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                    html        : _('clientgrid.label_field_key_desc'),
                                    cls         : 'desc-under'
                                }]
                            }, {
                                columnWidth : .2,
                                items       : [{
                                    xtype       : 'checkbox',
                                    fieldLabel  : _('clientgrid.label_field_active'),
                                    description : MODx.expandHelp ? '' : _('clientgrid.label_field_active_desc'),
                                    name        : 'active',
                                    inputValue  : 1,
                                    checked     : true
                                }, {
                                    xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                    html        : _('clientgrid.label_field_active_desc'),
                                    cls         : 'desc-under'
                                }]
                            }]
                        }, {
                            xtype       : 'textfield',
                            fieldLabel  : _('clientgrid.label_field_name'),
                            description : MODx.expandHelp ? '' : _('clientgrid.label_field_name_desc'),
                            name        : 'name',
                            anchor      : '100%',
                            allowBlank  : false
                        }, {
                            xtype       : MODx.expandHelp ? 'label' : 'hidden',
                            html        : _('clientgrid.label_field_name_desc'),
                            cls         : 'desc-under'
                        }, {
                            xtype       : 'textarea',
                            fieldLabel  : _('clientgrid.label_field_description'),
                            description : MODx.expandHelp ? '' : _('clientgrid.label_field_description_desc'),
                            name        : 'description',
                            anchor      : '100%'
                        }, {
                            xtype       : MODx.expandHelp ? 'label' : 'hidden',
                            html        : _('clientgrid.label_field_description_desc'),
                            cls         : 'desc-under'
                        }]
                    }, {
                        columnWidth : .5,
                        items       : [{
                            xtype       : 'clientgrid-combo-xtype',
                            fieldLabel  : _('clientgrid.label_field_xtype'),
                            description : MODx.expandHelp ? '' : _('clientgrid.label_field_xtype_desc'),
                            name        : 'xtype',
                            anchor      : '100%',
                            allowBlank  : false,
                            listeners   : {
                                render      : {
                                    fn          : this.onHandleXtype,
                                    scope       : this
                                },
                                select      : {
                                    fn          : this.onHandleXtype,
                                    scope       : this
                                }
                            }
                        }, {
                            xtype       : MODx.expandHelp ? 'label' : 'hidden',
                            html        : _('clientgrid.label_field_xtype_desc'),
                            cls         : 'desc-under'
                        }, {
                            xtype       : 'clientgrid-combo-tabs',
                            fieldLabel  : _('clientgrid.label_field_tab'),
                            description : MODx.expandHelp ? '' : _('clientgrid.label_field_tab_desc'),
                            name        : 'tab_id',
                            anchor      : '100%'
                        }, {
                            xtype       : MODx.expandHelp ? 'label' : 'hidden',
                            html        : _('clientgrid.label_field_tab_desc'),
                            cls         : 'desc-under'
                        }, {
                            xtype       : 'checkbox',
                            hideLabel   : true,
                            boxLabel    : _('clientgrid.label_field_required_desc'),
                            name        : 'required',
                            inputValue  : 1
                        }, {
                            xtype       : 'checkbox',
                            hideLabel   : true,
                            boxLabel    : _('clientgrid.label_field_searchable_desc'),
                            name        : 'searchable',
                            inputValue  : 1
                        }]
                    }]
                }]
            }, {
                title       : _('clientgrid.extra_settings'),
                items       : [{
                    id          : 'clientgrid-extra-default-update',
                    items       : [{
                        html    : '<p>' + _('clientgrid.no_extra_settings') + '</p>'
                    }]
                }, {
                    id          : 'clientgrid-extra-datefield-update',
                    items       : [{
                        layout      : 'column',
                        defaults    : {
                            layout      : 'form',
                            labelSeparator : ''
                        },
                        items       : [{
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'datefield',
                                fieldLabel  : _('clientgrid.label_field_mindate'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_mindate_desc'),
                                name        : 'minDateValue',
                                anchor      : '100%',
                                format      : MODx.config.manager_date_format,
                                startDay    : parseInt(MODx.config.manager_week_start),
                                value       : config.record.extra.minDateValue
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_mindate_desc'),
                                cls         : 'desc-under'
                            }]
                        }, {
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'datefield',
                                fieldLabel  : _('clientgrid.label_field_maxdate'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_maxdate_desc'),
                                name        : 'maxDateValue',
                                anchor      : '100%',
                                format      : MODx.config.manager_date_format,
                                startDay    : parseInt(MODx.config.manager_week_start),
                                value       : config.record.extra.maxDateValue
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_maxdate_desc'),
                                cls         : 'desc-under'
                            }]
                        }]
                    }]
                }, {
                    id          : 'clientgrid-extra-timefield-update',
                    items       : [{
                        layout      : 'column',
                        defaults    : {
                            layout      : 'form',
                            labelSeparator : ''
                        },
                        items       : [{
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'timefield',
                                fieldLabel  : _('clientgrid.label_field_mintime'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_mintime_desc'),
                                name        : 'minTimeValue',
                                anchor      : '100%',
                                format      : MODx.config.manager_time_format,
                                value       : config.record.extra.minTimeValue
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_mintime_desc'),
                                cls         : 'desc-under'
                            }]
                        }, {
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'timefield',
                                fieldLabel  : _('clientgrid.label_field_maxtime'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_maxtime_desc'),
                                name        : 'maxTimeValue',
                                anchor      : '100%',
                                format      : MODx.config.manager_time_format,
                                value       : config.record.extra.maxTimeValue
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_maxtime_desc'),
                                cls         : 'desc-under'
                            }]
                        }]
                    }]
                }, {
                    id          : 'clientgrid-extra-combo-update',
                    layout      : 'form',
                    labelSeparator : '',
                    items       : [{
                        xtype       : 'clientgrid-combo-values',
                        fieldLabel  : _('clientgrid.label_field_values'),
                        value       : Ext.encode(config.record.extra.values) || '[]'
                    }, {
                        xtype       : 'textarea',
                        fieldLabel  : _('clientgrid.label_field_binded_values'),
                        description : MODx.expandHelp ? '' : _('clientgrid.label_field_binded_values_desc'),
                        name        : 'bindedValues',
                        anchor      : '100%',
                        value       : config.record.extra.bindedValues || ''
                    }, {
                        xtype       : MODx.expandHelp ? 'label' : 'hidden',
                        html        : _('clientgrid.label_field_binded_values_desc'),
                        cls         : 'desc-under'
                    }]
                }, {
                    id          : 'clientgrid-extra-browser-update',
                    items       : [{
                        layout      : 'column',
                        defaults    : {
                            layout      : 'form',
                            labelSeparator : ''
                        },
                        items       : [{
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'modx-combo-source',
                                fieldLabel  : _('clientgrid.label_field_source'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_source_desc'),
                                name        : 'source',
                                anchor      : '100%',
                                value       : MODx.config.default_media_source,
                                value       : config.record.extra.source || MODx.config.default_media_source
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_source_desc'),
                                cls         : 'desc-under'
                            }, {
                                xtype       : 'textfield',
                                fieldLabel  : _('clientgrid.label_field_filetypes'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_filetypes_desc'),
                                name        : 'allowedFileTypes',
                                anchor      : '100%',
                                value       : config.record.extra.allowedFileTypes || ''
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        : _('clientgrid.label_field_filetypes_desc'),
                                cls         : 'desc-under'
                            }]
                        }, {
                            columnWidth : .5,
                            items       : [{
                                xtype       : 'textfield',
                                fieldLabel  : _('clientgrid.label_field_opento'),
                                description : MODx.expandHelp ? '' : _('clientgrid.label_field_opento_desc'),
                                name        : 'openTo',
                                anchor      : '100%',
                                value       : config.record.extra.openTo || '/'
                            }, {
                                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                                html        :  _('clientgrid.label_field_opento_desc'),
                                cls         : 'desc-under'
                            }]
                        }]
                    }]
                }, {
                    id          : 'clientgrid-extra-tinymce-update',
                    layout      : 'form',
                    labelSeparator : '',
                    items       : [{
                        xtype       : 'tinymce-combo-config',
                        fieldLabel  : _('clientgrid.label_setting_tinymce_config'),
                        description : MODx.expandHelp ? '' : _('clientgrid.label_setting_tinymce_config_desc'),
                        hiddenName  : 'tinymceConfig',
                        anchor      : '100%',
                        value       : config.record.extra.tinymceConfig || ''
                    }, {
                        xtype       : MODx.expandHelp ? 'label' : 'hidden',
                        html        : _('clientgrid.label_setting_tinymce_config_desc'),
                        cls         : 'desc-under'
                    }]
                }, {
                    id          : 'clientgrid-extra-clientgrid-update',
                    layout      : 'form',
                    labelSeparator : '',
                    items       : [{
                        xtype       : 'clientgrid-combo-config',
                        fieldLabel  : _('clientgrid.label_setting_clientgrid_config'),
                        description : MODx.expandHelp ? '' : _('clientgrid.label_setting_clientgrid_config_desc'),
                        hiddenName  : 'gridConfig',
                        anchor      : '100%',
                        value       : config.record.extra.gridConfig || ''
                    }, {
                        xtype       : MODx.expandHelp ? 'label' : 'hidden',
                        html        : _('clientgrid.label_setting_clientgrid_config_desc'),
                        cls         : 'desc-under'
                    }]
                }]
            }]
        }]
    });

    ClientGrid.window.UpdateField.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.UpdateField, MODx.Window, {
    onHandleXtype: function(event) {
        var elements = {
            default         : false,
            datefield       : false,
            timefield       : false,
            datetimefield   : false,
            combo           : false,
            browser         : false,
            tinymce         : false,
            clientgrid      : false
        };

        switch (event.getValue()) {
            case 'datefield':
                elements.datefield  = true;

                break;
            case 'timefield':
                elements.timefield  = true;

                break;
            case 'datetimefield':
                elements.datefield  = true;
                elements.timefield  = true;

                break;

            case 'combo':
            case 'radiogroup':
            case 'checkboxgroup':
                elements.combo      = true;

                break;
            case 'browser':
                elements.browser    = true;

                break;
            case 'tinymce':
                elements.tinymce    = true;

                break;
            case 'clientgrid':
                elements.clientgrid = true;

                break;
            default:
                elements.default    = true;

                break;
        }

        Ext.iterate(elements, function(element, value) {
            var tab = Ext.getCmp('clientgrid-extra-' + element + '-update');

            if (tab) {
                if (value) {
                    tab.show();
                } else {
                    tab.hide();
                }
            }
        });
    }
});

Ext.reg('clientgrid-window-field-update', ClientGrid.window.UpdateField);