<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

require_once dirname(__DIR__) . '/index.class.php';

class ClientGridHomeManagerController extends ClientGridManagerController
{
    /**
     * @access public.
     */
    public function loadCustomCssJs()
    {
        $this->addJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/widgets/home.panel.js');

        $this->addJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/widgets/grids.grid.js');

        $this->addLastJavascript($this->modx->clientgrid->config['js_url'] . 'mgr/sections/home.js');
    }

    /**
     * @access public.
     * @return String.
     */
    public function getPageTitle()
    {
        return $this->modx->lexicon('clientgrid');
    }

    /**
     * @access public.
     * @return String.
     */
    public function getTemplateFile()
    {
        return $this->modx->clientgrid->config['templates_path'] . 'home.tpl';
    }
}
