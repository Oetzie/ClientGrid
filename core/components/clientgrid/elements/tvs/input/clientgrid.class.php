<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

class ClientGridInputRender extends modTemplateVarInputRender
{
    /**
     * @access public.
     * @param Mixed $value.
     * @param Array $params.
     * @return Mixed.
     */
    public function process($value, array $params = [])
    {
        $this->modx->getService('clientgrid', 'ClientGrid', $this->modx->getOption('clientgrid.core_path', null, $this->modx->getOption('core_path') . 'components/clientgrid/') . 'model/clientgrid/');

        foreach ($params as $key => $param) {
            $this->setPlaceholder($key, $param);
        }
    }

    /**
     * @access public.
     * @return String.
     */
    public function getTemplate()
    {
        return $this->modx->clientgrid->config['templates_path'] . 'tvs/input/clientgrid.tpl';
    }
}

return 'ClientGridInputRender';
