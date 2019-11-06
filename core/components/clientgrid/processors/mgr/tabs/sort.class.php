<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
class ClientGridTabSortProcessor extends modObjectProcessor
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

    /**
     * @access public
     * @return Mixed.
     */
    public function process()
    {
        $index = 0;

        foreach ((array) explode(',', $this->getProperty('sort')) as $id) {
            $object = $this->modx->getObject($this->classKey, [
                'id' => $id
            ]);

            if ($object) {
                $object->fromArray([
                    'menuindex' => $index
                ]);

                if ($object->save()) {
                    $index++;
                }
            }
        }

        return $this->success();
    }
}

return 'ClientGridTabSortProcessor';
