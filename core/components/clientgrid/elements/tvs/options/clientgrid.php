<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

$instance = $modx->getService('clientgrid', 'ClientGrid', $modx->getOption('clientgrid.core_path', null, $modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/');

if ($instance instanceof ClientGrid) {
    $modx->smarty->assign('clientgrid', $modx->lexicon->fetch('clientgrid.', true));

    return $modx->smarty->fetch($instance->config['templates_path'] . 'tvs/options/clientgrid.tpl');
}

return '';
