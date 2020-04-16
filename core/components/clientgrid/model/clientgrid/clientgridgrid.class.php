<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
class ClientGridGrid extends xPDOSimpleObject
{
    /**
     * @access public.
     * @return Array.
     */
    public function getColumns()
    {
        $columns = [];

        $criteria = $this->xpdo->newQuery('ClientGridColumn');

        $criteria->select($this->xpdo->getSelectColumns('ClientGridColumn', 'ClientGridColumn'));
        $criteria->select($this->xpdo->getSelectColumns('ClientGridField', 'ClientGridField', '', ['key']));

        $criteria->innerJoin('ClientGridField', 'ClientGridField', '`ClientGridColumn`.`field_id` = `ClientGridField`.`id`');

        $criteria->where([
            'ClientGridColumn.grid_id'   => $this->get('id'),
            'ClientGridColumn.active'    => 1
        ]);

        $criteria->sortby('ClientGridColumn.menuindex', 'ASC');

        foreach ($this->xpdo->getCollection('ClientGridColumn', $criteria) as $column) {
            $columns[] = $column;
        }

        return $columns;
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getFields()
    {
        $fields = [];

        $criteria = $this->xpdo->newQuery('ClientGridField', [
            'grid_id'   => $this->get('id'),
            'active'    => 1
        ]);

        $criteria->sortby('menuindex', 'ASC');

        foreach ($this->xpdo->getCollection('ClientGridField', $criteria) as $field) {
            $fields[] = $field;
        }

        return $fields;
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getTabs()
    {
        $tabs = [];

        $criteria = $this->xpdo->newQuery('ClientGridTab', [
            'grid_id'   => $this->get('id'),
            'active'    => 1
        ]);

        $criteria->sortby('menuindex', 'ASC');

        foreach ($this->xpdo->getCollection('ClientGridTab', $criteria) as $tab) {
            $tabs[] = $tab;
        }

        return $tabs;
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getColumnsFormatted()
    {
        $columns = [];

        foreach ($this->getColumns() as $column) {
            $columns[] = array_merge($column->toArray(), [
                'name' => $column->getNameFormatted()
            ]);
        }

        return $columns;
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getFieldsFormatted()
    {
        $fields = [
            [
                'name'          => $this->xpdo->lexicon('clientgrid.tab_uncategorized'),
                'description'   => '',
                'active'        => 1,
                'fields'        => []
            ]
        ];

        foreach ($this->getTabs() as $tab) {
            $fields[$tab->get('id')] = [
                'name'          => $tab->getNameFormatted(),
                'description'   => $tab->getDescriptionFormatted(),
                'active'        => $tab->get('active'),
                'fields'        => []
            ];
        }

        foreach ($this->getFields() as $field) {
            if (isset($fields[$field->get('tab_id')])) {
                $fields[$field->get('tab_id')]['fields'][$field->get('id')] = $field;
            }
        }

        foreach ($fields as $key => $field) {
            if (isset($field['fields'])) {
                $newFields = [];

                foreach ((array) $field['fields'] as $value) {
                    $newFields[] = array_merge($value->toArray(), [
                        'name'          => $value->getNameFormatted(),
                        'description'   => $value->getDescriptionFormatted(),
                        'extra'         => $value->getExtraValues()
                    ]);
                }

                $fields[$key]['fields'] = $newFields;
            }
        }

        return array_values($fields);
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getFieldsFormattedWithOutTabs()
    {
        $fields = [];

        foreach ($this->getFieldsFormatted() as $field) {
            if (isset($field['fields'])) {
                foreach ((array) $field['fields'] as $value) {
                    $fields[] = $value;
                }
            }
        }

        return $fields;
    }
}
