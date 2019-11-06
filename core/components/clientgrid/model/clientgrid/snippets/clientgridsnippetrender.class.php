<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */

require_once dirname(__DIR__) . '/clientgridsnippets.class.php';

class ClientGridSnippetRender extends ClientGridSnippets
{
    /**
     * @access public.
     * @var Array.
     */
    public $properties = [
        'input'                 => '{}',
        'render'                => '',

        'limit'                 => 0,
        'where'                 => '{}',
        'sortby'                => '{"idx": "ASC"}',

        'tpl'                   => '',
        'tplWrapper'            => '',
        'tplWrapperEmpty'       => '',

        'usePdoTools'           => false,
        'usePdoElementsPath'    => false
    ];

    /**
     * @access public.
     * @param Array $properties.
     * @return String.
     */
    public function run(array $properties = [])
    {
        $this->setProperties($properties);

        $output     = [];

        $data = json_decode($this->getProperty('input', '{}'), true);

        if ($data) {
            $render     = $this->getProperty('render');
            $limit      = (int) $this->getProperty('limit');
            $where      = json_decode($this->getProperty('where'), true);
            $sortby     = json_decode($this->getProperty('sortby'), true);

            $data       = (array) $this->cleanData($data);

            if (!empty($render)) {
                foreach ($data as $key => $value) {
                    $data[$key] = $this->modx->runSnippet($render, [
                        'value' => $value
                    ]);
                }
            }

            if ($where) {
                foreach ((array) $where as $column => $field) {
                    foreach ($data as $key => $value) {
                        if ((string) $value[$column] !== (string) $field) {
                            unset($data[$key]);
                        }
                    }
                }
            }

            if ($sortby) {
                foreach ((array) $sortby as $key => $value) {
                    if ($key === 'id') {
                        $key = 'idx';
                    }

                    if (in_array($value, ['RAND', 'RAND()'], true)) {
                        shuffle($data);
                    } else {
                        usort($data, function($a, $b) {
                            return $a[$key] - $b[$key];
                        });

                        if (strtoupper($value) === 'DESC') {
                            $data = array_reverse($data);
                        }
                    }
                }
            }

            if ($limit >= 1) {
                $data = array_slice($data,0, $limit);
            }

            foreach ($data as $value) {
                $output[] = $this->getChunk($this->getProperty('tpl'), $value);
            }
        }

        if (!empty($output)) {
            $tplWrapper = $this->getProperty('tplWrapper');

            if ($tplWrapper) {
                return $this->getChunk($tplWrapper, [
                    'output' => implode(PHP_EOL, $output)
                ]);
            }

            return implode(PHP_EOL, $output);
        }

        $tplWrapperEmpty = $this->getProperty('tplWrapperEmpty');

        if (!empty($tplWrapperEmpty)) {
            return $this->getChunk($tplWrapperEmpty);
        }

        return '';
    }
}
