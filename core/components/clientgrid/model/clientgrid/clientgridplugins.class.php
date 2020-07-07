<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

require_once __DIR__ . '/clientgrid.class.php';

class ClientGridPlugins extends ClientGrid
{
    /**
     * @access public.
     */
    public function onManagerPageBeforeRender()
    {
        $this->modx->controller->addCss($this->config['css_url'] . 'mgr/clientgrid-overall.css');

        $this->modx->controller->addJavascript($this->config['js_url'] . 'mgr/clientgrid.js');

        $this->modx->controller->addJavascript($this->config['js_url'] . 'mgr/extras/grid.js');
        $this->modx->controller->addJavascript($this->config['js_url'] . 'mgr/extras/combo-clientgrid.js');

        $this->modx->controller->addHtml('<script type="text/javascript">
            Ext.onReady(function() {
                ClientGrid.config = ' . $this->modx->toJSON(array_merge($this->config, [
                    'branding_url'          => $this->getBrandingUrl(),
                    'branding_url_help'     => $this->getHelpUrl(),
                    'xtypes'                => $this->getXTypes(),
                    'grids'                 => $this->formatGrids($this->getGrids())
                ])) . ';
            });
        </script>');

        if (is_array($this->config['lexicons'])) {
            foreach ($this->config['lexicons'] as $lexicon) {
                $this->modx->controller->addLexiconTopic($lexicon);
            }
        } else {
            $this->modx->controller->addLexiconTopic($this->config['lexicons']);
        }
    }

    /**
     * @access public.
     * @param Array $properties.
     */
    public function onTVInputRenderList(array $properties = [])
    {
        $this->modx->event->output($this->config['elements_path'] . 'tvs/input');
    }

    /**
     * @access public.
     * @param Array $properties.
     */
    public function onTVInputPropertiesList(array $properties = [])
    {
        $this->modx->event->output($this->config['elements_path'] . 'tvs/options/');
    }

    /**
     * @access public.
     * @param Array $properties.
     */
    public function OnClientSettingsRegisterSettings(array $properties = [])
    {
        $this->modx->controller->addLexiconTopic('clientgrid:clientsettings');

        if (isset($properties['settings'])) {
            $properties['settings']['clientgrid'] = [
                'xtype'         => 'clientgrid-panel-gridview',
                'name'          => $this->modx->lexicon('clientsettings.clientgrid.name'),
                'fields'        => [[
                    'xtype'         => 'clientgrid-combo-config',
                    'name'          => 'grid',
                    'title'         => $this->modx->lexicon('clientsettings.clientgrid.label_config'),
                    'description'   => $this->modx->lexicon('clientsettings.clientgrid.label_config_desc')
                ]]
            ];
        }
    }
}
