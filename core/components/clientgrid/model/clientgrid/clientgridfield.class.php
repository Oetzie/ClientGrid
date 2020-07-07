<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
class ClientGridField extends xPDOSimpleObject
{
    /**
     * @access public.
     * @return String.
     */
    public function getNameFormatted()
    {
        $lexicon    = 'clientgrid.grid_field_' . $this->get('name');
        $formatted  = $this->xpdo->lexicon($lexicon);

        if ($formatted !== $lexicon) {
            return $formatted;
        }

        return $this->get('name');
    }

    /**
     * @access public.
     * @return String.
     */
    public function getDescriptionFormatted()
    {
        $lexicon    = 'clientgrid.grid_field_' . $this->get('name') . '_desc';
        $formatted  = $this->xpdo->lexicon($lexicon);

        if ($formatted !== $lexicon) {
            return $formatted;
        }

        return $this->get('description');
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getExtraFormatted()
    {
        return json_decode($this->get('extra'), true);
    }

    /**
     * @access public.
     * @return Integer.
     */
    public function getMenuIndex()
    {
        $criteria = $this->xpdo->newQuery('ClientGridField', [
            'grid_id' => $this->get('grid_id')
        ]);

        $criteria->sortby('menuindex', 'DESC');
        $criteria->limit(1);

        $object = $this->xpdo->getObject('ClientGridField', $criteria);

        if ($object) {
            return (int) $object->get('menuindex') + 1;
        }

        return 0;
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getExtraValues()
    {
        $extras = json_decode($this->get('extra'), true);

        if (in_array($this->get('xtype'), ['combo', 'checkboxgroup', 'radiogroup'], true)) {
            $data = [];

            if (isset($extras['values'])) {
                foreach ((array) $extras['values'] as $key => $value) {
                    if (!empty($value['label'])) {
                        $data[] = $value;
                    }
                }
            }

            if (isset($extras['binded_values'])) {
                $context = $this->xpdo->getOption('default_context');

                if (isset($_GET['context'])) {
                    $context = $_GET['context'];
                } else if (isset($_GET['context_key'])) {
                    $context = $_GET['context_key'];
                }

                if (!empty($extras['binded_values'])) {
                    if (preg_match('/^@SELECT\s/i', $extras['binded_values'])) {
                        $query = ltrim($extras['query'], '@');

                        $placeholders = [
                            'user'              => $this->xpdo->placeholders['modx.user.id'],
                            'db_name'           => $this->xpdo->placeholders['+dbname'],
                            'db_table_prefix'   => $this->xpdo->placeholders['+table_prefix'],
                            'db_charset'        => $this->xpdo->placeholders['+charset'],
                            'host'              => $this->xpdo->placeholders['+host'],
                            'context'           => $context
                        ];

                        foreach ($placeholders as $key => $value) {
                            $query = str_replace('{' . $key . '}', $value, $query);
                        }

                        $result = $this->xpdo->query($query);

                        if ($result) {
                            while ($value = $result->fetch(PDO::FETCH_ASSOC)) {
                                if (isset($value['value'], $value['label'])) {
                                    $data[] = [
                                        'value' => $value['value'],
                                        'label' => $value['label']
                                    ];
                                }
                            }
                        }
                    } else if (preg_match('/^@SNIPPET\s/i', $extras['binded_values'])) {
                        $snippet = ltrim($extras['binded_values'], '@SNIPPET');

                        $result = $this->xpdo->runSnippet($snippet, [
                            'id'        => $this->get('id'),
                            'key'       => $this->get('key'),
                            'context'   => $context
                        ]);

                        if ($result) {
                            foreach ((array) $result as $value) {
                                $data[] = [
                                    'value' => $value['value'],
                                    'label' => $value['label']
                                ];
                            }
                        }
                    }
                }
            }

            $extras['values'] = $data;
        } else if ($this->get('xtype') === 'browser') {
            $source = $this->xpdo->getObject('modMediaSource', [
                'id' => $extras['browser_source']
            ]);

            if ($source) {
                $extras['sourcePath'] = trim($source->getProperties()['basePath']['value'], '/') . '/';
            } else {
                $extras['sourcePath'] = '';
            }
        }

        return $extras;
    }
}
