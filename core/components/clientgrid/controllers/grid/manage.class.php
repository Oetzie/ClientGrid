<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

require_once dirname(dirname(__DIR__)) . '/index.class.php';

class ClientGridGridManageManagerController extends ClientGridManagerController
{
    /**
     * @access public.
     * @var Null|Object.
     */
    public $object = null;

    /**
     * @access public.
     */
    public function loadCustomCssJs()
    {
        $this->addJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/widgets/grid/grid.panel.js');

        $this->addJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/widgets/grid/columns.grid.js');
        $this->addJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/widgets/grid/fields.grid.js');
        $this->addJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/widgets/grid/tabs.grid.js');

        $this->addLastJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/sections/grid/grid.js');

        $this->addHtml('<script type="text/javascript">
            Ext.onReady(function() {
                ClientGrid.config.record    = ' . $this->modx->toJSON($this->getGrid()) . ';
                ClientGrid.config.xtypes    = ' . $this->modx->toJSON($this->modx->clientgrid->getXTypes()) . ';
                ClientGrid.config.renders   = ' . $this->modx->toJSON($this->modx->clientgrid->getRenders()) . ';
            });
        </script>');
    }

    /**
     * @access public.
     * @return String.
     */
    public function getPageTitle()
    {
        return $this->modx->lexicon('clientgrid.grid_manage');
    }

    /**
     * @access public.
     * @return String.
     */
    public function getTemplateFile()
    {
        return $this->modx->clientgrid->config['templates_path'] . 'grid/grid.tpl';
    }

    /**
     * @access public.
     * @param Array $properties.
     * @return Mixd.
     */
    public function process(array $properties = [])
    {
        $this->setGrid($properties);

        if (!$this->getGrid()) {
            return $this->failure($this->modx->lexicon('clientgrid.grid_not_exists', [
                'id' => $properties['id']
            ]));
        }
    }

    /**
     * @access public.
     * @param Array $properties.
     */
    public function setGrid(array $properties = [])
    {
        $this->object = $this->modx->getObject('ClientGridGrid', [
            'id' => $properties['id']
        ]);
    }

    /**
     * @access public.
     * @return Null|Array.
     */
    public function getGrid()
    {
        if ($this->object !== null) {
            return array_merge($this->object->toArray(), [
                'actions' => array_merge([
                    'create'            => 0,
                    'update'            => 0,
                    'remove'            => 0,
                    'duplicate'         => 0,
                    'remove_bulk'       => 0,
                    'view_raw_output'   => 0
                ], json_decode($this->object->get('actions'), true))
            ]);
        }

        return null;
    }
}
