<?php

/**
 * ClientGrid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

if ($object->xpdo) {
    switch ($options[xPDOTransport::PACKAGE_ACTION]) {
        case xPDOTransport::ACTION_INSTALL:
            $modx =& $object->xpdo;
            $modx->addPackage('clientgrid', $modx->getOption('clientgrid.core_path', null, $modx->getOption('core_path') . 'components/clientgrid/') . 'model/');

            $manager = $modx->getManager();

            $manager->createObjectContainer('ClientGridGrid');
            $manager->createObjectContainer('ClientGridColumn');
            $manager->createObjectContainer('ClientGridField');
            $manager->createObjectContainer('ClientGridTab');

            break;
    }
}

return true;
