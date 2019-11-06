<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

class ClientGridFormatProcessor extends modObjectProcessor
{
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

    /**
     * @access public.
     * @return Mixed.
     */
    public function process()
    {
        $output = [];

        $object = $this->modx->clientgrid->getGrid($this->getProperty('id'));

        if ($object) {
            $data   = $this->getProperty('data');
            $query  = $this->getProperty('query');
            $fields = $object->getFieldsFormattedWithOutTabs();

            $output = $this->modx->clientgrid->formatData(json_decode($data, true), $fields, $query);
        }

        return $this->outputArray($output, count($output));
    }
}

return 'ClientGridFormatProcessor';
