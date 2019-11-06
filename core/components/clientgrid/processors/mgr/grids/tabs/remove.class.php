<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
class ClientGridTabRemoveProcessor extends modObjectRemoveProcessor
{
    /**
     * @access public.
     * @var String.
     */
    public $classKey = 'ClientGridTab';

    /**
     * @access public.
     * @var Array.
     */
    public $languageTopics = ['clientgrid:default'];

    /**
     * @access public.
     * @var String.
     */
    public $objectType = 'clientgrid.tab';

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

return 'ClientGridTabRemoveProcessor';
