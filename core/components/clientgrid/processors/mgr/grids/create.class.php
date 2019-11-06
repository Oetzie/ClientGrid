<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

class ClientGridGridCreateProcessor extends modObjectCreateProcessor
{
    /**
     * @access public.
     * @var String.
     */
    public $classKey = 'ClientGridGrid';

    /**
     * @access public.
     * @var Array.
     */
    public $languageTopics = ['clientgrid:default'];

    /**
     * @access public.
     * @var String.
     */
    public $objectType = 'clientgrid.grid';

    /**
     * @access public.
     * @return Mixed.
     */
    public function initialize()
    {
        $this->modx->getService('clientgrid', 'ClientGrid', $this->modx->getOption('clientgrid.core_path', null, $this->modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/');

        return parent::initialize();
    }
}

return 'ClientGridGridCreateProcessor';
