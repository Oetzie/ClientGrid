<div id="clientgrid-{$tv}-properties-div"></div>

<script type="text/javascript">
// <![CDATA[
    {literal}
        MODx.load({
            xtype       : 'panel',
            layout      : 'form',
            labelAlign  : 'top',
            labelSeparator : '',
            items       : [{
                xtype       : 'clientgrid-combo-config',
                fieldLabel  : '{/literal}{$clientgrid['tv_label_config']}{literal}',
                description : MODx.expandHelp ? '' : '{/literal}{$clientgrid['tv_label_config_desc']}{literal}',
                hiddenName  : 'inopt_config',
                anchor      : '100%',
                allowBlank  : false,
                value       : '{/literal}{$params['config']}{literal}'
            }, {
                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                html        : '{/literal}{$clientgrid['tv_label_config_desc']}{literal}',
                cls         : 'desc-under'
            }],
            renderTo    : 'clientgrid-{/literal}{$tv}{literal}-properties-div'
        });
    {/literal}
// ]]>
</script>