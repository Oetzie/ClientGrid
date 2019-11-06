<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
require_once dirname(dirname(dirname(__DIR__))) . '/config.core.php';

require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

$modx->getService('clientgrid', 'ClientGrid', $modx->getOption('clientgrid.core_path', null, $modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/');

if ($modx->clientgrid instanceof ClientGrid) {
    $modx->request->handleRequest([
        'processors_path'   => $modx->clientgrid->config['processors_path'],
        'location'          => ''
    ]);
}
