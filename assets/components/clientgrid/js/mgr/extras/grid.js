ClientGrid.panel.GridView = function(config) {
    config = config || {};

    Ext.apply(config, {
        layout  : 'anchor',
        items   : this.getItems(config)
    });

    ClientGrid.panel.GridView.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.panel.GridView, Ext.Panel, {
    getItems: function(config) {
        if (ClientGrid.config.grids[config.grid]) {
            var hiddenField = 'clientgrid-grid-gridvalue-' + Ext.id();

            return [{
                xtype       : 'hidden',
                id          : hiddenField,
                name        : config.name,
                value       : config.value,
                anchor      : '100%'
            }, {
                xtype       : 'clientgrid-grid-gridview',
                grid        : ClientGrid.config.grids[config.grid],
                value       : Ext.decode(config.value || '[]'),
                hiddenField : hiddenField,
                anchor      : '100%'
            }];
        }

        return [{
            html    : '<p>' + _('clientgrid.no_valid_grid') + '</p>',
            cls     : 'modx-config-error'
        }];
    }
});

Ext.reg('clientgrid-panel-gridview', ClientGrid.panel.GridView);

ClientGrid.grid.GridView = function(config) {
    config = config || {};

    config.id = Ext.id();

    config.tbar = [];

    if (parseInt(config.grid.actions.create) === 1) {
        config.tbar.push({
            text    : _('clientgrid.gridview_create_item'),
            id      : 'clientgrid-panel-' + config.id + '-create',
            cls     :'primary-button',
            handler : this.createItem,
            scope   : this
        });
    }

    if (parseInt(config.grid.actions.remove_bulk) === 1) {
        config.tbar.push({
            text    : _('bulk_actions'),
            menu    : [{
                text    : '<i class="x-menu-item-icon icon icon-times"></i>' + _('clientgrid.gridview_remove_selected_items'),
                handler : this.removeSelectedItems,
                scope   : this
            }]
        });
    }

    if (ClientGrid.config.has_permission || parseInt(config.grid.actions.view_raw_output) === 1) {
        config.tbar.push('->', {
            text    :  '<i class="icon icon-eye"></i>' + _('clientgrid.gridview_view_raw'),
            handler : this.viewRawData,
            scope   : this
        });
    }

    if (this.hasSearch(config.grid.fields)) {
        config.tbar.push({
            xtype       : 'textfield',
            name        : 'clientgrid-panel-filter-' + config.id + '-search',
            id          : 'clientgrid-panel-filter-' + config.id + '-search',
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
            id          : 'clientgrid-panel-filter-' + config.id + '-clear',
            text        : _('filter_clear'),
            listeners   : {
                'click'     : {
                    fn          : this.filterClear,
                    scope       : this
                }
            }
        });
    }

    var sm      = new Ext.grid.CheckboxSelectionModel();
    var columns = null;

    if (parseInt(config.grid.actions.remove_bulk) === 1) {
        columns = new Ext.grid.ColumnModel({
            columns     : [sm].concat(this.getColumns(config.grid.columns))
        });
    } else {
        columns = new Ext.grid.ColumnModel({
            columns     : this.getColumns(config.grid.columns)
        });
    }

    Ext.applyIf(config, {
        sm              : sm,
        cm              : columns,
        id              : 'clientgrid-panel-grid-' + config.id,
        url             : ClientGrid.config.connector_url,
        baseParams      : {
            action          : 'mgr/format',
            id              : config.grid.id,
            data            : Ext.encode(config.value)
        },
        fields          : this.getColumnsFields(config.grid.columns, config.grid.fields),
        enableDragDrop  : config.grid.sortable,
        ddGroup         : 'clientgrid-panel-grid-' + config.id,
        primaryKey      : 'idx',
        createDisabled  : false,
        limit           : config.grid.max_items,
        json            : []
    });

    ClientGrid.grid.GridView.superclass.constructor.call(this, config);

    this.getStore().on('load', this.updateJson, this);

    this.on('afterrender', this.sortItems, this);
};

Ext.extend(ClientGrid.grid.GridView, MODx.grid.Grid, {
    updateJson: function(store, data) {
        this.createDisabled = this.limit >= 1 && data.length >= this.limit;

        var button = Ext.getCmp('clientgrid-panel-' + this.id + '-create');

        if (button) {
            button.setDisabled(this.createDisabled);
        }

        store.filterBy(function(record) {
            return !record.json.idx_hidden;
        });

        var json = [];

        data.forEach(function(value, index) {
            var newValue = value.json;

            delete newValue.idx_hidden;

            json.push(newValue);
        });

        var hiddenField = Ext.getCmp(this.hiddenField);

        if (hiddenField) {
            hiddenField.setValue(Ext.encode(json));
        }

        this.json = json;
    },
    updateStore: function(method, data, load) {
        var json = this.json;

        if (method === 'create') {
            json.push(data);
        }

        if (method === 'update') {
            json.forEach(function (value, index) {
                if (parseInt(value.idx) === parseInt(data.idx)) {
                    json[index] = data;
                }
            });
        }

        if (method === 'remove') {
            json.forEach(function (value, index) {
                if (parseInt(value.idx) === parseInt(data)) {
                    delete json[index];
                }
            });
        }

        if (method === 'remove-bulk') {
            data = data.map(function (value) {
                return parseInt(value);
            });

            json.forEach(function (value, index) {
                if (data.indexOf(parseInt(value.idx)) !== -1) {
                    delete json[index];
                }
            });
        }

        if (method === 'sort') {
            json = data;
        }

        this.getStore().load({
            params  : {
                data    : Ext.encode(json)
            }
        });
    },
    filterSearch: function(tf, nv, ov) {
        this.getStore().baseParams.query = tf.getValue();

        this.getStore().load({
            params  : {
                data    : Ext.encode(this.json)
            }
        });
    },
    filterClear: function() {
        this.getStore().baseParams.query = '';

        Ext.getCmp('clientgrid-panel-filter-' + this.id + '-search').reset();

        this.getStore().load({
            params  : {
                data    : Ext.encode(this.json)
            }
        });
    },
    hasSearch: function(fields) {
        var search = false;

        fields.forEach((function(tab) {
            tab.fields.forEach(function(field) {
                if (parseInt(field.searchable) === 1) {
                    search = true;
                }
            });
        }).bind(this));

        return search;
    },
    getColumns: function(columns) {
        var data = [{
            dataIndex   : 'idx',
            header      : 'ID',
            sortable    : false,
            editable    : false,
            fixed       : true,
            width       : '20px',
            hidden      : true
        }];

        columns.forEach((function(column) {
            var element = {
                dataIndex   : column.key,
                header      : column.name,
                sortable    : false,
                editable    : false,
                fixed       : false
            };

            if (parseInt(column.fixed) === 1) {
                element = Ext.applyIf({
                    fixed       : true,
                    width       : parseInt(column.width)
                }, element);
            }

            switch(column.render) {
                case 'image':
                    element = Ext.applyIf({
                        renderer    : this.renderImage
                    }, element);

                    break;
                case 'youtube':
                    element = Ext.applyIf({
                        renderer    : this.renderYoutube
                    }, element);

                    break;
                case 'url':
                    element = Ext.applyIf({
                        renderer    : this.renderUrl
                    }, element);

                    break;
                case 'tag':
                    element = Ext.applyIf({
                        renderer    : this.renderTag
                    }, element);

                    break;
                case 'boolean':
                    element = Ext.applyIf({
                        renderer    : this.renderBoolean
                    }, element);

                    break;
                case 'date':
                    element = Ext.applyIf({
                        renderer    : this.renderDate
                    }, element);

                    break;
                case 'password':
                    element = Ext.applyIf({
                        renderer    : this.renderPassword
                    }, element);

                    break;
                case 'resource':
                    element = Ext.applyIf({
                        renderer    : this.renderResource
                    }, element);

                    break;
            }

            data.push(element);
        }).bind(this));

        return data;
    },
    getColumnsFields: function(columns, fields) {
        var data = [];

        this.getColumns(columns).forEach(function(column) {
            data.push(column.dataIndex);
        });

        fields.forEach(function(tab) {
            tab.fields.forEach(function(field) {
                if (data.indexOf(field.key) === -1) {
                    data.push(field.key);
                }

                if (['resource', 'browser'].indexOf(field.xtype) !== -1) {
                    if (data.indexOf(field.key + '_replace') === -1) {
                        data.push(field.key + '_replace');
                    }
                }
            });
        });

        return data;
    },
    sortItems: function() {
        new Ext.dd.DropTarget(this.getView().mainBody, {
            ddGroup     : this.ddGroup,
            notifyDrop  : (function(dd, e, data) {
                var index = dd.getDragData(e).rowIndex;

                if (undefined !== index) {
                    for (var i = 0; i < data.selections.length; i++) {
                        data.grid.getStore().remove(data.grid.getStore().getById(data.selections[i].id));
                        data.grid.getStore().insert(index, data.selections[i]);
                    }
                }

                var json = [];

                data.grid.getStore().data.items.forEach(function(value, index) {
                    json.push(value.json);
                });

                this.updateStore('sort', json);
            }).bind(this)
        });
    },
    getMenu: function() {
        var menu = [];

        if (parseInt(this.config.grid.actions.update) === 1) {
            menu.push({
                text    : '<i class="x-menu-item-icon icon icon-edit"></i>' + _('clientgrid.gridview_update_item'),
                handler : this.updateItem,
                scope   : this
            });
        }

        if (parseInt(this.config.grid.actions.duplicate) === 1 && !this.createDisabled) {
            menu.push({
                text    : '<i class="x-menu-item-icon icon icon-copy"></i>' + _('clientgrid.gridview_duplicate_item'),
                handler : this.duplicateItem,
                scope   : this
            });
        }

        if (menu.length >= 1 && parseInt(this.config.grid.actions.remove) === 1) {
            menu.push('-');
        }

        if (parseInt(this.config.grid.actions.remove) === 1) {
            menu.push({
                text    : '<i class="x-menu-item-icon icon icon-times"></i>' + _('clientgrid.gridview_remove_item'),
                handler : this.removeItem,
                scope   : this
            });
        }

        return menu;
    },
    viewRawData: function(btn, e) {
        if (this.viewRawDataWindow) {
            this.viewRawDataWindow.destroy();
        }

        var record = {
            data : Ext.encode(this.json)
        };

        this.viewRawDataWindow = MODx.load({
            xtype       : 'clientgrid-grid-gridview-view-raw',
            closeAction : 'close',
            record      : record,
            buttons     : [{
                text        : _('ok'),
                cls         : 'primary-button',
                handler     : function() {
                    this.viewRawDataWindow.close();
                },
                scope       : this
            }]
        });

        this.viewRawDataWindow.setValues(record);
        this.viewRawDataWindow.show(e.target);
    },
    createItem: function(btn, e) {
        if (this.createItemWindow) {
            this.createItemWindow.destroy();
        }

        this.createItemWindow = MODx.load({
            xtype       : 'clientgrid-grid-gridview-create-item',
            id          : 'clientgrid-grid-gridview-create-item-' + Ext.id(),
            closeAction : 'close',
            grid        : this.grid,
            listeners   : {
                'success'   : {
                    fn          : function(data) {
                        this.updateStore('create', data.getValues());
                    },
                    scope       : this
                }
            }
        });

        this.createItemWindow.show(e.target);
    },
    updateItem: function(btn, e) {
        if (this.updateItemWindow) {
            this.updateItemWindow.destroy();
        }

        this.updateItemWindow = MODx.load({
            xtype       : 'clientgrid-grid-gridview-update-item',
            id          : 'clientgrid-grid-gridview-update-item-' + Ext.id(),
            record      : this.menu.record,
            closeAction : 'close',
            grid        : this.grid,
            listeners   : {
                'success'   : {
                    fn          : function(data) {
                        this.updateStore('update', data.getValues());
                    },
                    scope       : this
                }
            }
        });

        this.updateItemWindow.setValues(this.menu.record);
        this.updateItemWindow.show(e.target);
    },
    duplicateItem: function(btn, e) {
        var data = this.menu.record;

        data[this.fields[1]] = _('clientgrid.duplicate_name') + ' ' + data[this.fields[1]];

        this.updateStore('create', this.menu.record);
    },
    removeItem: function(btn, e) {
        Ext.MessageBox.confirm(_('clientgrid.gridview_remove_item'), _('clientgrid.gridview_remove_item_confirm'), function(event) {
            if (event === 'yes') {
                this.updateStore('remove', this.menu.record.idx);
            }
        }, this);
    },
    removeSelectedItems: function(btn, e) {
        Ext.MessageBox.confirm(_('clientgrid.gridview_remove_selected_items'), _('clientgrid.gridview_remove_selected_items_confirm'), function(event) {
            if (event === 'yes') {
                this.updateStore('remove-bulk', this.getSelectedAsList().split(','));
            }
        }, this);
    },
    renderImage: function(d, c, e) {
        var value = e.json[this.dataIndex + '_replace'] || d;

        if (/^{(.*)}$/.test(value)) {
            var valueJson = Ext.decode(value);

            if (valueJson.image) {
                value = valueJson.image;
            }
        }

        var matchUrl = /^(http|https|www)/.test(value);

        if (matchUrl || !Ext.isEmpty(value)) {
            if (matchUrl === false) {
                value = MODx.config.connectors_url + 'system/phpthumb.php?w=110&h=70&zc=1&src=' + value;
            }

            return '<img src="' + value + '" style="display: block; width: 110px; height: 70px; margin: 0 auto;" alt="" />' ;
        }

        return value;
    },
    renderYoutube: function(d, c, e) {
        var value = e.json[this.dataIndex + '_replace'] || d;
        var match = d.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/);

        if (match && 11 === match[7].length || 11 === value.length) {
            if (11 !== value.length) {
                value = match[7];
            }

            return '<iframe width="110" height="70" src="//www.youtube.com/embed/' + value +'?controls=0&rel=0&showinfo=0" frameborder="0" style="display: block; width: 110px; height: 70px; margin: 0 auto;"></iframe>';
        }

        return value;
    },
    renderUrl: function(d, c, e) {
        var value = e.json[this.dataIndex + '_replace'] || d;

        if (!Ext.isEmpty(value)) {
            return '<a href="' + value + '" target="_blank">' + value + '</a>';
        }

        return value;
    },
    renderTag: function(d, c, e) {
        var value = e.json[this.dataIndex + '_replace'] || d;

        if (!Ext.isEmpty(value)) {
            return '[[+' + value + '+]]';
        }

        return value;
    },
    renderPassword: function(d, c, e) {
        var value = e.json[this.dataIndex + '_replace'] || d;
        var password = '';

        for (var i = 0; i < value.length; i++) {
            password += '*';
        }

        return password;
    },
    renderResource: function(d, c, e) {
        var value = e.json[this.dataIndex + '_replace'] || d;

        if (!Ext.isEmpty(value)) {
            return '<a href="?a=resource/update&id=' + d + '" target="_blank">' + value + '</a>';
        }

        return value;
    },
    renderBoolean: function(d, c, e) {
        var value = e.json[this.dataIndex + '_replace'] || d;

        c.css = parseInt(d) === 1 || d ? 'green' : 'red';

        return parseInt(d) === 1 || d ? _('yes') : _('no');
    },
    renderDate: function(d, c, e) {
        var value = e.json[this.dataIndex + '_replace'] || d;

        if (Ext.isEmpty(value)) {
            return '—';
        }

        return value;
    }
});

Ext.reg('clientgrid-grid-gridview', ClientGrid.grid.GridView);

ClientGrid.window.GridViewViewRaw = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        autoHeight  : true,
        width       : 600,
        title       : _('clientgrid.gridview_view_raw'),
        fields      : [{
            xtype       : 'textarea',
            anchor      : '100%',
            height      : 200,
            name        : 'data',
            readOnly    : true
        }]
    });

    ClientGrid.window.GridViewViewRaw.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.GridViewViewRaw, MODx.Window);

Ext.reg('clientgrid-grid-gridview-view-raw', ClientGrid.window.GridViewViewRaw);

ClientGrid.window.GridViewCreateItem = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        autoHeight  : true,
        width       : config.grid.window_width,
        bodyStyle   : config.grid.fields.length > 1 ? 'padding: 0' : '',
        title       : _('clientgrid.gridview_create_item'),
        fields      : this.getFields(config.grid.fields, config.record, config.id)
    });

    ClientGrid.window.GridViewCreateItem.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.GridViewCreateItem, MODx.Window, {
    getFields: function(fields, record, formId) {
        var tabs   = [];

        fields.forEach(function(tab) {
            var items = [];

            if (tab.description !== '') {
                items.push({
                    html            : '<p>' + tab.description + '</p>',
                    bodyCssClass    : 'panel-desc'
                });
            }

            tab.fields.forEach(function(field) {
                var element = Ext.applyIf({
                    fieldLabel  : field.name_formatted || field.name,
                    description : '<b>[[++' + field.key + ']]</b>',
                    name        : field.key,
                    anchor      : '100%',
                    id          : 'clientgrid-field-create-' + field.id,
                    allowBlank  : !field.required
                }, field);

                switch (field.xtype) {
                    case 'datefield':
                        element = Ext.applyIf({
                            format          : MODx.config.manager_date_format,
                            startDay        : parseInt(MODx.config.manager_week_start),
                            minValue        : element.extra.min_date_value,
                            maxValue        : element.extra.max_date_value
                        }, element);

                        break;
                    case 'timefield':
                        element = Ext.applyIf({
                            format          : MODx.config.manager_time_format,
                            offset_time     : MODx.config.server_offset_time,
                            minValue        : element.extra.min_time_value,
                            maxValue        : element.extra.max_time_value
                        }, element);

                        break;
                    case 'datetimefield':
                        element = Ext.applyIf({
                            xtype           : 'xdatetime',
                            dateFormat      : MODx.config.manager_date_format,
                            timeFormat      : MODx.config.manager_time_format,
                            startDay        : parseInt(MODx.config.manager_week_start),
                            offset_time     : MODx.config.server_offset_time,
                            minDateValue    : element.extra.min_date_value,
                            maxDateValue    : element.extra.max_date_value,
                            minTimeValue    : element.extra.min_time_value,
                            maxTimeValue    : element.extra.max_time_value
                        }, element);

                        break;
                    case 'passwordfield':
                        element = Ext.applyIf({
                            xtype           : 'textfield',
                            inputType       : 'password'
                        }, element);

                        break;
                    case 'richtext':
                        element = Ext.applyIf({
                            xtype           : 'textarea',
                            listeners       : {
                                afterrender     : {
                                    fn              : function(event) {
                                        if (MODx.loadRTE) {
                                            MODx.loadRTE(event.id);
                                        }
                                    }
                                }
                            }
                        }, element);

                        break;
                    case 'boolean':
                        element = Ext.applyIf({
                            xtype           : 'combo-boolean',
                            hiddenName      : element.name
                        }, element);

                        break;
                    case 'combo':
                        element = Ext.applyIf({
                            xtype           : 'modx-combo',
                            store           : new Ext.data.JsonStore({
                                fields          : ['value', 'label'],
                                data            : element.extra.values || []
                            }),
                            mode            : 'local',
                            hiddenName      : element.name,
                            valueField      : 'value',
                            displayField    : 'label'
                        }, element);

                        break;
                    case 'checkbox':
                        element = Ext.applyIf({
                            hideLabel       : true,
                            boxLabel        : element.fieldLabel,
                            inputValue      : 1
                        }, element);

                        break;
                    case 'checkboxgroup':
                        var options = [];

                        element.extra.values.forEach(function(option, index) {
                            options.push({
                                name        : element.name,
                                boxLabel    : option.label,
                                inputValue  : option.value
                            });
                        });

                        if (options.length >= 1) {
                            element = Ext.applyIf({
                                xtype       : 'checkboxgroup',
                                columns     : 1,
                                items       : options
                            }, element);
                        }

                        break;
                    case 'radiogroup':
                        var options = [];

                        element.extra.values.forEach(function(option, index) {
                            options.push({
                                name        : element.name,
                                boxLabel    : option.label,
                                inputValue  : option.value
                            });
                        });

                        element = Ext.applyIf({
                            xtype           : 'radiogroup',
                            columns         : 1,
                            items           : options
                        }, element);

                        break;
                    case 'resource':
                        items.push({
                            xtype   : 'hidden',
                            name    : element.name,
                            id      : element.id + '-replace'
                        });

                        element = Ext.applyIf({
                            xtype       : 'modx-field-parent-change',
                            name        : element.name + '_replace',
                            formpanel   : formId,
                            parentcmp   : element.id + '-replace',
                            contextcmp  : null,
                            currentid   : 0
                        }, element);

                        break;
                    case 'browser':
                        element = Ext.applyIf({
                            xtype           : 'modx-combo-browser',
                            source          : element.extra.browser_source || MODx.config.default_media_source,
                            openTo          : element.extra.browser_open_to || '/',
                            allowedFileTypes : element.extra.browser_allowed_file_types || ''
                        }, element);

                        break;
                    default:
                        if (ClientGrid.config.xtypes[field.xtype]) {
                            var customXType = ClientGrid.config.xtypes[field.xtype];

                            if (customXType.type === 'custom') {
                                element.xtype = customXType.xtype;

                                Ext.iterate(customXType.fields, (function(field2) {
                                    if (element.extra[field.xtype + '_' + field2.name]) {
                                        element[field2.name] = element.extra[field.xtype + '_' + field2.name];
                                    } else {
                                        element[field2.name] = '';
                                    }
                                }).bind(this));

                                if (field.xtype === 'tinymce') {
                                    element.listeners = {
                                        afterrender     : {
                                            fn              : function(event) {
                                                if (MODx.loadRTE) {
                                                    MODx.loadRTE(event.id, element.config || null);
                                                }
                                            }
                                        }
                                    };
                                }
                            }
                        }

                        break;
                }

                items.push(element);

                if (field.description_formatted || field.description) {
                    items.push({
                        xtype    : MODx.expandHelp ? 'label' : 'hidden',
                        html     : field.description_formatted || field.description,
                        cls      : 'desc-under'
                    });
                }
            });

            tabs.push({
                title       : tab.name,
                labelSeparator : '',
                disabled    : parseInt(tab.active) !== 1,
                items       : items
            });
        });

        if (tabs.length > 1) {
            return [{
                xtype       : 'modx-vtabs',
                deferredRender : false,
                hideMode    : 'offsets',
                items       : tabs
            }];
        }

        return tabs[0].items;
    },
    submit: function(close) {
        var form = this.fp.getForm();

        if (form.isValid() && this.fireEvent('beforeSubmit', form.getValues())) {
            if (this.config.success) {
                Ext.callback(this.config.success, this.config.scope || this, [form]);
            }

            if (this.fireEvent('success', form)) {
                if (close) {
                    this.config.closeAction !== 'close' ? this.hide() : this.close();
                }
            }
        }
    }
});

Ext.reg('clientgrid-grid-gridview-create-item', ClientGrid.window.GridViewCreateItem);

ClientGrid.window.GridViewUpdateItem = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        autoHeight  : true,
        width       : config.grid.window_width,
        bodyStyle   : config.grid.fields.length > 1 ? 'padding: 0' : '',
        title       : _('clientgrid.gridview_update_item'),
        fields      : [{
            xtype       : 'hidden',
            name        : 'idx'
        }].concat(this.getFields(config.grid.fields, config.record, config.id))
    });

    ClientGrid.window.GridViewUpdateItem.superclass.constructor.call(this, config);
};

Ext.extend(ClientGrid.window.GridViewUpdateItem, MODx.Window, {
    getFields: function(fields, record, formId) {
        var tabs = [];

        fields.forEach(function(tab) {
            var items = [];

            if (tab.description !== '') {
                items.push({
                    html            : '<p>' + tab.description + '</p>',
                    bodyCssClass    : 'panel-desc'
                });
            }

            tab.fields.forEach(function(field) {
                var element = Ext.applyIf({
                    fieldLabel  : field.name_formatted || field.name,
                    description : '<b>[[++' + field.key + ']]</b>',
                    name        : field.key,
                    anchor      : '100%',
                    id          : 'clientgrid-field-update-' + field.id,
                    allowBlank  : !field.required
                }, field);

                switch (field.xtype) {
                    case 'datefield':
                        element = Ext.applyIf({
                            format          : MODx.config.manager_date_format,
                            startDay        : parseInt(MODx.config.manager_week_start),
                            minValue        : element.extra.min_date_value,
                            maxValue        : element.extra.max_date_value
                        }, element);

                        break;
                    case 'timefield':
                        element = Ext.applyIf({
                            format          : MODx.config.manager_time_format,
                            offset_time     : MODx.config.server_offset_time,
                            minValue        : element.extra.min_time_value,
                            maxValue        : element.extra.max_time_value
                        }, element);

                        break;
                    case 'datetimefield':
                        element = Ext.applyIf({
                            xtype           : 'xdatetime',
                            dateFormat      : MODx.config.manager_date_format,
                            timeFormat      : MODx.config.manager_time_format,
                            startDay        : parseInt(MODx.config.manager_week_start),
                            offset_time     : MODx.config.server_offset_time,
                            minDateValue    : element.extra.min_date_value,
                            maxDateValue    : element.extra.max_date_value,
                            minTimeValue    : element.extra.min_time_value,
                            maxTimeValue    : element.extra.max_time_value
                        }, element);

                        break;
                    case 'passwordfield':
                        element = Ext.applyIf({
                            xtype           : 'textfield',
                            inputType       : 'password'
                        }, element);

                        break;
                    case 'richtext':
                        element = Ext.applyIf({
                            xtype           : 'textarea',
                            listeners       : {
                                afterrender     : {
                                    fn              : function(event) {
                                        if (MODx.loadRTE) {
                                            MODx.loadRTE(event.id);
                                        }
                                    }
                                }
                            }
                        }, element);

                        break;
                    case 'boolean':
                        element = Ext.applyIf({
                            xtype           : 'combo-boolean',
                            hiddenName      : element.name
                        }, element);

                        break;
                    case 'combo':
                        element = Ext.applyIf({
                            xtype           : 'modx-combo',
                            store           : new Ext.data.JsonStore({
                                fields          : ['value', 'label'],
                                data            : element.extra.values || []
                            }),
                            mode            : 'local',
                            hiddenName      : element.name,
                            valueField      : 'value',
                            displayField    : 'label'
                        }, element);

                        break;
                    case 'checkbox':
                        element = Ext.applyIf({
                            hideLabel       : true,
                            boxLabel        : element.fieldLabel,
                            inputValue      : 1
                        }, element);

                        break;
                    case 'checkboxgroup':
                        var options = [];

                        element.extra.values.forEach(function(option, index) {
                            options.push({
                                name        : element.name,
                                boxLabel    : option.label,
                                inputValue  : option.value
                            });
                        });

                        if (options.length >= 1) {
                            element = Ext.applyIf({
                                xtype       : 'checkboxgroup',
                                columns     : 1,
                                items       : options
                            }, element);
                        }

                        break;
                    case 'radiogroup':
                        var options = [];

                        element.extra.values.forEach(function(option, index) {
                            options.push({
                                name        : element.name,
                                boxLabel    : option.label,
                                inputValue  : option.value
                            });
                        });

                        element = Ext.applyIf({
                            xtype           : 'radiogroup',
                            columns         : 1,
                            items           : options
                        }, element);

                        break;
                    case 'resource':
                        items.push({
                            xtype   : 'hidden',
                            name    : element.name,
                            id      : element.id + '-replace'
                        });

                        element = Ext.applyIf({
                            xtype       : 'modx-field-parent-change',
                            name        : element.name + '_replace',
                            formpanel   : formId,
                            parentcmp   : element.id + '-replace',
                            contextcmp  : null,
                            currentid   : 0
                        }, element);

                        break;
                    case 'browser':
                        element = Ext.applyIf({
                            xtype           : 'modx-combo-browser',
                            source          : element.extra.browser_source || MODx.config.default_media_source,
                            openTo          : element.extra.browser_open_to || '/',
                            allowedFileTypes : element.extra.browser_allowed_file_types || ''
                        }, element);

                        break;
                    default:
                        if (ClientGrid.config.xtypes[field.xtype]) {
                            var customXType = ClientGrid.config.xtypes[field.xtype];

                            if (customXType.type === 'custom') {
                                element.xtype = customXType.xtype;

                                Ext.iterate(customXType.fields, (function(field2) {
                                    if (element.extra[field.xtype + '_' + field2.name]) {
                                        element[field2.name] = element.extra[field.xtype + '_' + field2.name];
                                    } else {
                                        element[field2.name] = '';
                                    }
                                }).bind(this));

                                if (field.xtype === 'tinymce') {
                                    element.listeners = {
                                        afterrender     : {
                                            fn              : function(event) {
                                                if (MODx.loadRTE) {
                                                    MODx.loadRTE(event.id, element.config || null);
                                                }
                                            }
                                        }
                                    };
                                }
                            }
                        }

                        break;
                }

                items.push(element);

                if (field.description_formatted || field.description) {
                    items.push({
                        xtype    : MODx.expandHelp ? 'label' : 'hidden',
                        html     : field.description_formatted || field.description,
                        cls      : 'desc-under'
                    });
                }
            });

            tabs.push({
                title       : tab.name,
                labelSeparator : '',
                disabled    : parseInt(tab.active) !== 1,
                items       : items
            });
        });

        if (tabs.length > 1) {
            return [{
                xtype       : 'modx-vtabs',
                deferredRender : false,
                hideMode    : 'offsets',
                items       : tabs
            }];
        }

        return tabs[0].items;
    },
    submit: function(close) {
        var form = this.fp.getForm();

        if (form.isValid() && this.fireEvent('beforeSubmit', form.getValues())) {
            if (this.config.success) {
                Ext.callback(this.config.success, this.config.scope || this, [form]);
            }

            if (this.fireEvent('success', form)) {
                if (close) {
                    this.config.closeAction !== 'close' ? this.hide() : this.close();
                }
            }
        }
    }
});

Ext.reg('clientgrid-grid-gridview-update-item', ClientGrid.window.GridViewUpdateItem);

/* Fix for CheckboxSelectionModel in combination with Drag & drop grid */
Ext.override( Ext.grid.GridDragZone, {
    getDragData : function( e ) {
        var t = Ext.lib.Event.getTarget(e);
        var rowIndex = this.view.findRowIndex(t);

        if (rowIndex !== false) {
            var sm = this.grid.selModel;

            if (sm instanceof (Ext.grid.CheckboxSelectionModel)) {
                sm.onMouseDown(e, t);
            }

            if (t.className !== 'x-grid3-row-checker' && (!sm.isSelected(rowIndex) || e.hasModifier())) {
                sm.handleMouseDown(this.grid, rowIndex, e);
            }

            return {
                grid        : this.grid,
                ddel        : this.ddel,
                rowIndex    : rowIndex,
                selections  : sm.getSelections()
            };
        }

        return false;
    }
});