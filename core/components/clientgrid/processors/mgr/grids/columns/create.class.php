<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

class ClientGridColumnCreateProcessor extends modObjectCreateProcessor
{
    /**
     * @access public.
     * @var String.
     */
    public $classKey = 'ClientGridColumn';

    /**
     * @access public.
     * @var Array.
     */
    public $languageTopics = ['clientgrid:default'];

    /**
     * @access public.
     * @var String.
     */
    public $objectType = 'clientgrid.column';

    /**
     * @access public.
     * @return Mixed.
     */
    public function initialize()
    {
        $this->modx->getService('clientgrid', 'ClientGrid', $this->modx->getOption('clientgrid.core_path', null, $this->modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/');

        if ($this->getProperty('active') === null) {
            $this->setProperty('active', 0);
        }

        if ($this->getProperty('fixed') === null) {
            $this->setProperty('fixed', 0);
        }

        return parent::initialize();
    }

    /**
     * @access public.
     * @return Mixed.
     */
    public function beforeSave()
    {
        $this->object->set('menuindex', $this->object->getMenuIndex());

        if ((int) $this->object->get('fixed') === 0) {
            $this->object->set('width', '');
        }

        return parent::beforeSave();
    }
}

return 'ClientGridColumnCreateProcessor';
