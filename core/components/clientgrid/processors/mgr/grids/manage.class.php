<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
class ClientGridGridManageProcessor extends modObjectUpdateProcessor
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

        if ($this->getProperty('bulk_remove') === null) {
            $this->setProperty('bulk_remove', 0);
        }

        if ((int) $this->getProperty('window_width') < 400) {
            $this->setProperty('window_width', 400);
        }

        return parent::initialize();
    }

    /**
     * @access public.
     * @return Mixed.
     */
    public function beforeSave()
    {
        $actions = [
            'create'            => 0,
            'update'            => 0,
            'remove'            => 0,
            'duplicate'         => 0,
            'remove_bluk'       => 0,
            'view_raw_output'   => 0
        ];

        foreach (array_keys($this->getProperty('actions')) as $action) {
            $actions[$action] = 1;
        }

        $this->object->set('actions', json_encode($actions));

        return parent::beforeSet();
    }
}

return 'ClientGridGridManageProcessor';
