<div id="clientgrid-panel-div-{$tv->id}"></div>

<script type="text/javascript">
// <![CDATA[
    {literal}
        Ext.onReady(function() {
            MODx.load({
                xtype       : 'clientgrid-panel-gridview',
                name        : 'tv{/literal}{$tv->id}{literal}',
                grid        : '{/literal}{$config}{literal}',
                value       : '{/literal}{$tv->value}{literal}',
                renderTo    : 'clientgrid-panel-div-{/literal}{$tv->id}{literal}'
            });
        });
    {/literal}
// ]]>
</script>