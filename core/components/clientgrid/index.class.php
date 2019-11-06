<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

abstract class ClientGridManagerController extends modExtraManagerController
{
    /**
     * @access public.
     * @return Mixed.
     */
    public function initialize()
    {
        $this->modx->getService('clientgrid', 'ClientGrid', $this->modx->getOption('clientgrid.core_path', null, $this->modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/');

        $this->addCss($this->modx->clientgrid->config['css_url'] . 'mgr/clientgrid.css');

        $this->addJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/clientgrid.js');

        $this->addJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/extras/extras.js');

        $this->addHtml('<script type="text/javascript">
            Ext.onReady(function() {
                MODx.config.help_url = "' . $this->modx->clientgrid->getHelpUrl() . '";
                
                ClientGrid.config = ' . $this->modx->toJSON(array_merge($this->modx->clientgrid->config, [
                    'branding_url'          => $this->modx->clientgrid->getBrandingUrl(),
                    'branding_url_help'     => $this->modx->clientgrid->getHelpUrl()
                ])) . ';
            });
        </script>');

        return parent::initialize();
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getLanguageTopics()
    {
        return $this->modx->clientgrid->config['lexicons'];
    }

    /**
     * @access public.
     * @returns Boolean.
     */
    public function checkPermissions()
    {
        return $this->modx->hasPermission('clientgrid');
    }
}

class IndexManagerController extends ClientGridManagerController
{
    /**
     * @access public.
     * @return String.
     */
    public static function getDefaultController()
    {
        return 'home';
    }
}
