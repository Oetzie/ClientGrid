<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

$class = $modx->loadClass('ClientGridSnippetRender', $modx->getOption('clientgrid.core_path', null, $modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/snippets/', false, true);

if ($class) {
    $instance = new $class($modx);

    if ($instance instanceof ClientGridSnippets) {
        return $instance->run($scriptProperties);
    }
}

return '';
