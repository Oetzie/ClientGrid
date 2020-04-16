<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
class ClientGridFieldsGetListProcessor extends modObjectGetListProcessor
{
    /**
     * @access public.
     * @var String.
     */
    public $classKey = 'ClientGridField';

    /**
     * @access public.
     * @var Array.
     */
    public $languageTopics = ['clientgrid:default'];

    /**
     * @access public.
     * @var String.
     */
    public $defaultSortField = 'Field.menuindex';

    /**
     * @access public.
     * @var String.
     */
    public $defaultSortDirection = 'ASC';

    /**
     * @access public.
     * @var String.
     */
    public $objectType = 'clientgrid.field';

    /**
     * @access public.
     * @return Mixed.
     */
    public function initialize()
    {
        $this->modx->getService('clientgrid', 'ClientGrid', $this->modx->getOption('clientgrid.core_path', null, $this->modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/');

        $this->setDefaultProperties([
            'dateFormat' => $this->modx->getOption('manager_date_format') . ', ' .  $this->modx->getOption('manager_time_format')
        ]);

        return parent::initialize();
    }

    /**
     * @access public.
     * @return Mixed.
     */
    public function beforeQuery()
    {
        $this->setProperty('sort', $this->defaultSortField);

        return parent::beforeQuery();
    }

    /**
     * @access public.
     * @param xPDOQuery $criteria.
     * @return xPDOQuery.
     */
    public function prepareQueryBeforeCount(xPDOQuery $criteria)
    {
        $criteria->setClassAlias('Field');

        $criteria->select($this->modx->getSelectColumns('ClientGridField', 'Field'));
        $criteria->select($this->modx->getSelectColumns('ClientGridTab', 'Tab', 'tab_', ['name', 'menuindex']));

        $criteria->leftJoin('ClientGridTab', 'Tab');

        $gridID = $this->getProperty('grid');

        if (!empty($gridID)) {
            $criteria->where([
                'Field.grid_id' => $gridID
            ]);
        }

        $query = $this->getProperty('query');

        if (!empty($query)) {
            $criteria->where([
                'Field.name:LIKE' => '%' . $query . '%'
            ]);
        }

        return $criteria;
    }

    /**
     * @access public.
     * @param xPDOQuery $criteria.
     * @return xPDOQuery.
     */
    public function prepareQueryAfterCount(xPDOQuery $criteria)
    {
        $criteria->sortby('Tab.menuindex', 'ASC');

        return $criteria;
    }

    /**
     * @access public.
     * @param xPDOObject $object.
     * @return Array.
    */
    public function prepareRow(xPDOObject $object)
    {
        $array = array_merge($object->toArray(), [
            'name_formatted'        => $object->getNameFormatted(),
            'description_formatted' => $object->getDescriptionFormatted(),
            'extra'                 => $object->getExtraFormatted()
        ]);

        if (empty($object->get('tab_name'))) {
            $array['tab_name'] = $this->modx->lexicon('clientgrid.tab_uncategorized');
        }

        if (in_array($object->get('editedon'), ['-001-11-30 00:00:00', '-1-11-30 00:00:00', '0000-00-00 00:00:00', null], true)) {
            $array['editedon'] = '';
        } else {
            $array['editedon'] = date($this->getProperty('dateFormat'), strtotime($object->get('editedon')));
        }

        return $array;
    }
}

return 'ClientGridFieldsGetListProcessor';
