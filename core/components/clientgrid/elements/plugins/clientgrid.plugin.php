<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

if (in_array($modx->event->name, ['OnManagerPageBeforeRender', 'OnTVInputRenderList', 'OnTVInputPropertiesList'], true)) {
    $instance = $modx->getService('clientgridplugins', 'ClientGridPlugins', $modx->getOption('clientgrid.core_path', null, $modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/');

    if ($instance instanceof ClientGridPlugins) {
        $method = lcfirst($modx->event->name);

        if (method_exists($instance, $method)) {
            $instance->$method($scriptProperties);
        }
    }
}
