<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
class ClientGridTab extends xPDOSimpleObject
{
    /**
     * @access public.
     * @return Integer.
     */
    public function getMenuIndex()
    {
        $criteria = $this->xpdo->newQuery('ClientGridTab', [
            'grid_id' => $this->get('grid_id')
        ]);

        $criteria->sortby('menuindex', 'DESC');
        $criteria->limit(1);

        $object = $this->xpdo->getObject('ClientGridTab', $criteria);

        if ($object) {
            return (int) $object->get('menuindex') + 1;
        }

        return 0;
    }
}
